class Game {

    private engine: BABYLON.Engine;
    public scene: BABYLON.Scene;

    private _buttons: Array<BABYLON.AbstractMesh> = [];
    private centerPosition: BABYLON.Vector3;

    private _sounds: Array<BABYLON.Sound> = [];

    private sequence: Array<number> = [];
    private runningSequenceIndex = 0;

    private cameraParams = { alpha: -1.57, beta: 0.45 };

    // True when the player can start to reproduce the sequence
    private _waitForInput: boolean = false;

    private _simonSequence: Array<string> = [];
    private _userSequence: Array<string> = [];

    constructor(canvasId: string) {

        let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(canvasId);
        this.engine = new BABYLON.Engine(canvas, true);
        this.engine.enableOfflineSupport = false;

        this.scene = null;

        window.addEventListener("resize", () => {
            this.engine.resize();
        });

        this._initScene();

        let loader = new BABYLON.AssetsManager(this.scene);

        let addSound = (task: any) => {
            this._sounds.push(new BABYLON.Sound("", task.data, this.scene));
        }
        loader.addBinaryFileTask("Sound 1", "assets/sfx/a_sharp.mp3").onSuccess = addSound.bind(this);
        loader.addBinaryFileTask("Sound 2", "assets/sfx/c_sharp.mp3").onSuccess = addSound.bind(this);
        loader.addBinaryFileTask("Sound 3", "assets/sfx/d_sharp.mp3").onSuccess = addSound.bind(this);
        loader.addBinaryFileTask("Sound 4", "assets/sfx/f_sharp.mp3").onSuccess = addSound.bind(this);

        loader.addMeshTask("simon", "", 'assets/', "simon.babylon").onSuccess = (task: BABYLON.MeshAssetTask) => {

            // Get buttons
            for (let obj of task.loadedMeshes) {
                obj.isPickable = true;
                if (obj.name.indexOf('button') !== -1) {
                    this._buttons.push(obj);
                }
                if (obj.name.indexOf('socle') !== -1) {
                    this.centerPosition = obj.position.clone();
                }
            }
        }

        loader.onFinish = this._run.bind(this);
        loader.onProgress = (remaining: number, totalCount: number) => {
            FBInstant.setLoadingProgress(100 - remaining / totalCount);
        };


        loader.load();


    }


    private _initScene() {

        this.scene = new BABYLON.Scene(this.engine);

        let camera = new BABYLON.ArcRotateCamera('', 0, 0, 250, BABYLON.Vector3.Zero(), this.scene);
        // camera.attachControl(this.engine.getRenderingCanvas());
        let light = new BABYLON.HemisphericLight('', new BABYLON.Vector3(0, 1, 0), this.scene);

    }

    private _run() {
        this.scene.executeWhenReady(() => {

            FBInstant.startGameAsync().then(() => {

                this._initGame();

                this.engine.runRenderLoop(() => {
                    this.scene.render();
                });

            });
        });
    }


    private _initGame() {

        this.scene.stopAllAnimations();

        this.scene.debugLayer.show();
        (this.scene.activeCamera as BABYLON.ArcRotateCamera).target = this.centerPosition;

        let easing = new BABYLON.ExponentialEase(5);
        easing.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEOUT);

        // World extends
        var worldExtends = this.scene.getWorldExtends();
        var worldSize = worldExtends.max.subtract(worldExtends.min);
        var worldCenter = worldExtends.min.add(worldSize.scale(0.5));
        var radius = worldSize.length() * 1.25;

        BABYLON.Animation.CreateAndStartAnimation('', this.scene.activeCamera, 'alpha', 60, 100, 0, this.cameraParams.alpha, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing);
        BABYLON.Animation.CreateAndStartAnimation('', this.scene.activeCamera, 'beta', 60, 100, 0, this.cameraParams.beta, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing);
        BABYLON.Animation.CreateAndStartAnimation('', this.scene.activeCamera, 'radius', 60, 100, 250, radius, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, easing, this._startGame.bind(this));

        this.scene.onPointerDown = async (evt: PointerEvent, pickInfo: BABYLON.PickingInfo) => {
            if (pickInfo.hit) {

                if (this._waitForInput) {
                    let buttonName = await this._playButton(this._getButtonIndex(pickInfo.pickedMesh.name));
                    this._userSequence.push(buttonName);
                }

                let isButtonOk = this.checkSequences();
                if (!isButtonOk) {
                    console.log("game over")
                    this._waitForInput = false;
                    // Play lost sound
                    // Display game over
                    // try again
                    return;
                }
                else {
                    console.log("ok !")
                    if (this._userSequence.length === this._simonSequence.length) {
                        // add a new button to the sequence
                        this._gameLoop().then(() => {
                            this._waitForInput = true;
                        });
                    }
                }
            }
        }
    }

    private _startGame() {
        this._waitForInput = false;
        this.runningSequenceIndex = 0;
        this.sequence = [];
        this._userSequence = [];
        this._simonSequence = [];

        this._gameLoop().then(() => {
            this._waitForInput = true;
        });

    }

    /**
     * Adds a button to the sequence and play the whole sequence
     */
    private async _gameLoop() {
        this._waitForInput = false;
        this._userSequence = [];
        let index = this._addButtonInSequence();
        this._simonSequence.push(this._buttons[index].name);

        for (let i = 0; i < this.sequence.length; i++) {
            let buttonName = await this._playButton(this.sequence[i]);
        }
    }

    private _getButtonIndex(name: string) {
        for (let b = 0; b < this._buttons.length; b++) {
            let button = this._buttons[b];
            if (button.name === name) {
                return b;
            }
        }
        return 0;
    }

    /**
     * Returns the button name played
     * @param index 
     */
    private _playButton(index: number): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let button = this._buttons[index];
            this._sounds[index].play();
            this.scene.beginAnimation(button, 0, 20, false, 1.5, resolve.bind(this, button.name));
        });
    }

    /**
     * Adds a button to press to the sequence
     */
    private _addButtonInSequence(): number {
        let random = Math.floor(BABYLON.Scalar.RandomRange(0, 4));
        this.sequence.push(random);
        return random;
    }

    /**
     * Returns true if the first item of user sequence i
     */
    private checkSequences(): boolean {
        console.log(this._userSequence);
        console.log(this._simonSequence);
        for (let i = 0; i < this._userSequence.length; i++) {
            let button = this._userSequence[i];
            if (this._simonSequence[i] !== button) {
                return false;
            }
        }
        return true;
    }

}