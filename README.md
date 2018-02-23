# SIMON
https://stackoverflow.com/questions/14459078/unable-to-load-config-info-from-usr-local-ssl-openssl-cnf


## Run in localhost

### 1. Compile
Open VSCode.
`CTRL+SHIFT+B` to run the compilation task

### 2. Start the game

```
npm install
npm install -g grunt
npm run start
```
That will run a webserver and open your default browser at https://localhost:3000. Validate the certificate (if asked in the browser), and go to the following URL
- [DEV URL](https://www.facebook.com/embed/instantgames/231358994040500/player?game_url=https://localhost:3000)
- [PROD URL](https://www.facebook.com/embed/instantgames/1246601822117867/player?game_url=https://localhost:3000)

## Deploy in Messenger

### 1. Build
`CTRL+ù` to open the terminal in VSCode.
Type `grunt` to create the package (named `1boss_YYYYMMDD-HHMMSS.zip`).

### 3a. Deploy for Development

* Be sure to have the correct API url in `ServerHerlper.ts`
* Open the Facebook application page
* Select the application `1BOSS - Dev`
* Select `Web Hosting` on the left menu
* Upload your package.
* When the new version state is 'standby', click again on `Web Hosting`
* Select your new version and click on the star `Test mode`.

You're done!

### 3b. Deploy for Production

* Be sure to have the correct API url in `ServerHerlper.ts`
* Open the Facebook application page
* Select the application `1BOSS`
* Select `Web Hosting` on the left menu
* Upload your package.
* When the new version state is 'standby', click again on `Web Hosting`
* Select your new version and click on the star `Set in production`.

You're done!