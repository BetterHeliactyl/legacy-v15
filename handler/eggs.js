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
    getEggs:async function getEggs() {
        let data1 = await axios.get("https://"+settings.panel.url+"/api/application/nests",{headers:{'Authorization':'Bearer '+settings.panel.key}});
        let nests = []
        for(let i = 0; i < data1.data.data.length; i++) {
            nests.push({id:data1.data.data[i].attributes.id,name:data1.data.data[i].attributes.name})
        }
        let eggs = []
        for(let i = 0; i < nests.length; i++) {
            let data2 = await axios.get("https://"+settings.panel.url+"/api/application/nests/"+nests[i].id+"/eggs?include=variables",{headers:{'Authorization':'Bearer '+settings.panel.key}});
            for(let ii = 0; ii < data2.data.data.length; ii++) {
                let envs = {}
                for(let iii = 0; iii < data2.data.data[ii].attributes.relationships.variables.data.length; iii++) {
                    let thong = data2.data.data[ii].attributes.relationships.variables.data[iii].attributes.env_variable;
                    let thongv = data2.data.data[ii].attributes.relationships.variables.data[iii].attributes.default_value;
                    envs[thong] = thongv;
                }
                eggs.push({id:data2.data.data[ii].attributes.id,environment:envs,name:data2.data.data[ii].attributes.name,docker_image:data2.data.data[ii].attributes.docker_image,startup:data2.data.data[ii].attributes.startup})
            }
        }
        console.log(chalk.yellow("PANEL | Fetched eggs from the Panel"))
        db.set(`eggs`, JSON.stringify(eggs))
    }
}