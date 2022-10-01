const { application } = require('express');
const express = require('express')
const db = require('../handler/DB')
const router = new express.Router()
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

router.get("/:id/get", async(req, res) => {
        if(db.get("extra-"+req.params.id) == undefined) {
            return res.json(settings.resources);
        }
        let ures = {
            ram:settings.resources.ram + JSON.parse(db.get("extra-"+req.params.id)).ram,
            disk:settings.resources.disk + JSON.parse(db.get("extra-"+req.params.id)).disk,
            cpu:settings.resources.cpu + JSON.parse(db.get("extra-"+req.params.id)).cpu,
            servers:settings.resources.servers + JSON.parse(db.get("extra-"+req.params.id)).servers
        }
        return res.json(ures);
})
router.get("/:id/coins", async(req, res) => {
    if(db.get("extra-"+req.params.id) == undefined) {
        return res.json(settings.resources);
    }
    let ures = {
        coins:JSON.parse(db.get(`coins-${req.params.id}`)).coins
    }
    return res.json(ures);
})
router.get("/:id/addCoins", async(req, res) => {
    if(req.session.loggedin !== true) return res.send("Perms.");
    if(req.session.pterod.root_admin !== true) return res.send("Perms.");
    
    if(db.get("extra-"+req.params.id) == undefined) {
        return res.json(settings.resources);
    }
    if(!req.query.coins) return res.send("Invalid!");
    if(isNaN(JSON.parse(db.get(`coins-${req.params.id}`)).coins)) db.set(`coins-${req.params.id}`,JSON.stringify({coins:0}));
    let ures = {
        coins:JSON.parse(db.get(`coins-${req.params.id}`)).coins
    }
    ures.coins = ures.coins + parseInt(req.query.coins);
    db.set(`coins-${req.params.id}`,JSON.stringify(ures))
    return res.json({"b":db.get(`coins-${req.params.id}`)});
})
router.get("/:id/extra", async(req, res) => {
    if(db.get("extra-"+req.params.id) == undefined) {
        return res.json({ram:0,disk:0,cpu:0,servers:0});
    }
    let ures = {
        ram:JSON.parse(db.get("extra-"+req.params.id)).ram,
        disk:JSON.parse(db.get("extra-"+req.params.id)).disk,
        cpu:JSON.parse(db.get("extra-"+req.params.id)).cpu,
        servers:JSON.parse(db.get("extra-"+req.params.id)).servers
    }
    return res.json(ures);
})
router.get("/:id/addExtra", async(req, res) => {
    if(req.session.loggedin !== true) return res.send("Perms.");
    if(req.session.pterod.root_admin !== true) return res.send("Perms.");
    let cex = {ram:0,cpu:0,disk:0,servers:0}
    if(db.get(`user-${req.params.id}`) == undefined) return res.send("User does not exist!");
    if(db.get("extra-"+req.params.id) == undefined) {
        cex = {ram:0,cpu:0,disk:0,servers:0};
    }else{
        cex = JSON.parse(db.get("extra-"+req.params.id));
    }
    let addingram = 0;
    let addingdisk = 0;
    let addingcpu = 0;
    let addingservers = 0;
    if(!isNaN(req.query.ram)) addingram = parseInt(req.query.ram);
    if(!isNaN(req.query.disk)) addingdisk = parseInt(req.query.disk);
    if(!isNaN(req.query.cpu)) addingcpu = parseInt(req.query.cpu);
    if(!isNaN(req.query.servers)) addingservers = parseInt(req.query.servers);
    let nex = {
        ram:cex.ram+addingram,
        disk:cex.disk+addingdisk,
        cpu:cex.cpu+addingcpu,
        servers:cex.servers+addingservers
    }
    db.set(`extra-${req.params.id}`,JSON.stringify(nex))
    return res.json(nex);
})
module.exports.path = "/api";
module.exports.router = router;