const db = require('./DB')
const axios = require('axios')
const chalk = require("chalk")
let settings = {
    panel:{
        url:(db.get("settings-panel") == undefined) ? "https://panel.example.com" : JSON.parse(db.get("settings-panel")).url,
        key:(db.get("settings-panel") == undefined) ? "INVALID_KEY" : JSON.parse(db.get("settings-panel")).key,
        name:(db.get("settings-panel") == undefined) ? "Heliactyl" : JSON.parse(db.get("settings-panel")).name
    },
    discord : {
        id:(db.get("settings-discord") == undefined) ? "0" : JSON.parse(db.get("settings-discord")).clientid,
        secret:(db.get("settings-discord") == undefined) ? "0" : JSON.parse(db.get("settings-discord")).secret,
        callback:(db.get("settings-discord") == undefined) ? "0" : JSON.parse(db.get("settings-discord")).callback
    },
    resources: {
        ram:(db.get("settings-resources") == undefined) ? 1024 : JSON.parse(db.get("settings-resources")).ram,
        disk:(db.get("settings-resources") == undefined) ? 10240 : JSON.parse(db.get("settings-resources")).disk,
        cpu:(db.get("settings-resources") == undefined) ? 100 : JSON.parse(db.get("settings-resources")).cpu,
        servers:(db.get("settings-resources") == undefined) ? 2 : JSON.parse(db.get("settings-resources")).servers
    }
}

module.exports = {
    getLocations:async function getLocations() {
        let data1 = await axios.get("https://"+settings.panel.url+"/api/application/locations",{headers:{'Authorization':'Bearer '+settings.panel.key}});
        let locations = []
        for(let i = 0; i < data1.data.data.length; i++) {
            if(!(data1.data.data[i].attributes.long ? data1.data.data[i].attributes.long : data1.data.data[i].attributes.short).startsWith("!")) {
                locations.push({id:data1.data.data[i].attributes.id,name:(data1.data.data[i].attributes.long ? data1.data.data[i].attributes.long : data1.data.data[i].attributes.short)})
            }
        }
        console.log(chalk.yellow("PANEL | Fetched locations from the Panel"))
        db.set(`locations`, JSON.stringify(locations))
    }
}