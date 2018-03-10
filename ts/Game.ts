class Game {

    private engine: BABYLON.Engine;
    public scene: BABYLON.Scene;

    private _buttons: Array<BABYLON.AbstractMesh> = [];
    private centerPosition: BABYLON.Vector3;

    private sequence: Array<number> = [];
    private runningSequenceIndex = 0;

    private cameraParams = { alpha: -1.57, beta: 0.89 };

    // True when the player can start to reproduce the sequence
    private _waitForInput: boolean = false;

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
        camera.attachControl(this.engine.getRenderingCanvas());
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

        this.scene.onPointerDown = (evt: PointerEvent, pickInfo: BABYLON.PickingInfo) => {
            console.log(pickInfo.pickedMesh.name);
            // if (this._waitForInput && pickInfo.hit) {
            //     console.log(pickInfo.pickedMesh.name);
            // }
        }
    }

    private _startGame() {
        this._waitForInput = false;
        this.runningSequenceIndex = 0;
        this.sequence = [];

        this._gameLoop().then(() => {
            this._waitForInput = true;
        });

    }

    private async _gameLoop() {
        this._waitForInput = false;
        this._addButton();

        for (let i = 0; i < this.sequence.length; i++) {
            await this._showAnimationWithSound();
            this.runningSequenceIndex++;
        }
    }


    private _showAnimationWithSound(): Promise<any> {
        this.scene.stopAllAnimations();
        return new Promise<any>((resolve, reject) => {
            let button = this._buttons[this._getNextButtonToPlay()];
            this.scene.beginAnimation(button, 0, 20, false, 1, resolve.bind(this));
        });
    }

    private _getNextButtonToPlay() {
        return this.sequence[this.runningSequenceIndex];
    }

    /**
     * Adds a button to press to the sequence
     */
    private _addButton() {
        let random = Math.floor(BABYLON.Scalar.RandomRange(0, 4));
        this.sequence.push(random);
    }

}