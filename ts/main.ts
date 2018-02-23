declare var FBInstant: any;

let app = {

    initializeFb: function () {

        FBInstant.initializeAsync().then(() => {
            // Many properties will be null until the initialization completes.
            // This is a good place to fetch them:
            let locale = FBInstant.getLocale(); // 'en_US' 'fr_FR'...
            let platform = FBInstant.getPlatform(); // 'IOS', 'ANDROID' or 'WEB'
            let sdkVersion = FBInstant.getSDKVersion(); // '3.0'
            let playerID = FBInstant.player.getID();

            console.log(locale, platform, sdkVersion, playerID);

            new Game('gameCanvas');

        }).catch((e) => {
            console.log(e);
        });
    }
};

app.initializeFb();
