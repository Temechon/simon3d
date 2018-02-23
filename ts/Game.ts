class Game {

    private engine: BABYLON.Engine;
    public scene: BABYLON.Scene;

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
        loader.addMeshTask("simon", "", 'assets/', "simon.babylon");

        loader.onFinish = this._run.bind(this);
        loader.onProgress = (remaining: number, totalCount: number) => {
            FBInstant.setLoadingProgress(100 - remaining / totalCount);
        }

        loader.load();


    }


    private _initScene() {

        this.scene = new BABYLON.Scene(this.engine);

        let camera = new BABYLON.ArcRotateCamera('', 0, 0, 5, BABYLON.Vector3.Zero(), this.scene);
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

    }
}