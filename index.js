//
// Heliactyl 15, Codename Mannequin
// 
//  * Copyright SrydenCloud Limited
//  * Please read the "License" file
//

const express = require('express')
var session = require('express-session')
const chalk = require("chalk")
const db = require('./handler/DB')
const app = express()
var expressWs = require('express-ws')(app);
const prompt = require('prompt-sync')();
const fs = require("fs");
const wssettings = require("./webserver.json")

let port = JSON.parse(fs.readFileSync("./webserver.json")).port;

// Set Heliactyl release version
db.set("version","15.0.0-beta5")

app.set("view engine","ejs")
app.set("views","views/themes")
app.set('trust proxy', 1)
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}))
let settings = {
    panel:{
        url:(db.get("settings-panel") == undefined) ? "https://panel.example.com" : JSON.parse(db.get("settings-panel")).url,
        key:(db.get("settings-panel") == undefined) ? "INVALID_KEY" : JSON.parse(db.get("settings-panel")).key
    },
    discord : {
        id:(db.get("settings-discord") == undefined) ? "0" : JSON.parse(db.get("settings-discord")).clientid,
        secret:(db.get("settings-discord") == undefined) ? "0" : JSON.parse(db.get("settings-discord")).secret,
        callback:(db.get("settings-discord") == undefined) ? "0" : JSON.parse(db.get("settings-discord")).callback
    }
}
if(!((db.get("settings-discord") == undefined) && (db.get("settings-panel") == undefined))) {
require('./handler/locations').getLocations()
require('./handler/eggs').getEggs()
}
let rf = require('fs').readdirSync("./routes")
for(let i = 0; i < rf.length; i++) {
    let ab = require('./routes/'+rf[i])
    if((db.get("settings-discord") == undefined) && (db.get("settings-panel") == undefined)) {
        if((ab.path !== "/setup") && ab.path !== "/") {
            console.log(chalk.yellowBright("API | Cannot load route '"+ab.path+"' as this instance is not setup!"))
        }else{
            app.use(ab.path,ab.router)
            expressWs.applyTo(ab.router)
            console.log(chalk.gray("API | Loaded route "+ab.path))
        }
    }else{
        app.use(ab.path,ab.router)
        console.log(chalk.gray("API | Loaded route "+ab.path))
        expressWs.applyTo(ab.router)
    }
}
app.get("*", async(req, res) => {
    res.send("404")
})

console.log(chalk.blue("HELIACTYL | Instance successfully started!"))
console.log(chalk.blue("HELIACTYL | You are running version 15.0.0-beta2"))
console.log(chalk.green("WS | Heliactyl Webserver started!"))
app.listen(parseInt(port))
