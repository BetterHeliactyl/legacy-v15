const { application } = require('express');
const express = require('express')
const db = require('../handler/DB')
const axios = require('axios')
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

router.get("/home", async(req, res) => {
    if(req.session.loggedin !== true) {
        res.redirect("/auth/login")
    }else{
        if(db.get("extra-"+req.session.userinfo.id) == undefined) {
            let eres = {
                ram:0,
                disk:0,
                cpu:0,
                servers:0
            }
            db.set("extra-"+req.session.userinfo.id,JSON.stringify(eres))
        }
        let ures = {
            ram:settings.resources.ram + JSON.parse(db.get("extra-"+req.session.userinfo.id)).ram,
            disk:settings.resources.disk + JSON.parse(db.get("extra-"+req.session.userinfo.id)).disk,
            cpu:settings.resources.cpu + JSON.parse(db.get("extra-"+req.session.userinfo.id)).cpu,
            servers:settings.resources.servers + JSON.parse(db.get("extra-"+req.session.userinfo.id)).servers
        }
        let servers = await axios.get("https://"+settings.panel.url+"/api/application/users?include=servers&filter[email]="+encodeURIComponent(req.session.userinfo.email),{headers:{'Authorization':`Bearer ${settings.panel.key}`}});
        let usedRam = 0;
        let usedDisk = 0;
        let usedCpu = 0;
        let usedSlots = servers.data.data[0].attributes.relationships.servers.data.length;
        let sv = servers.data.data[0].attributes.relationships.servers.data;
        for(let i = 0; i < sv.length; i++) {
            usedRam += sv[i].attributes.limits.memory;
            usedDisk += sv[i].attributes.limits.disk;
            usedCpu += sv[i].attributes.limits.cpu;
        }
        let availables = {
            ram:ures.ram-usedRam,
            disk:ures.disk-usedDisk,
            cpu:ures.cpu-usedCpu,
            slots:ures.servers-usedSlots
        }
        req.session.servers = servers.data.data[0].attributes.relationships.servers.data;
        res.render("default/home",{req:req,servers:req.session.servers,db:db,userinfo:req.session.userinfo,resources:availables,admin:req.session.pterod.root_admin,name:settings.panel.name,coins:JSON.parse(db.get(`coins-${req.session.userinfo.id}`)).coins})
    }
})
router.get("/creds", async(req, res) => {
    if(req.session.loggedin !== true) {
        res.redirect("/auth/login")
    }else{
        if(db.get("extra-"+req.session.userinfo.id) == undefined) {
            let eres = {
                ram:0,
                disk:0,
                cpu:0,
                servers:0
            }
            db.set("extra-"+req.session.userinfo.id,JSON.stringify(eres))
        }
        let ures = {
            ram:settings.resources.ram + JSON.parse(db.get("extra-"+req.session.userinfo.id)).ram,
            disk:settings.resources.disk + JSON.parse(db.get("extra-"+req.session.userinfo.id)).disk,
            cpu:settings.resources.cpu + JSON.parse(db.get("extra-"+req.session.userinfo.id)).cpu,
            servers:settings.resources.servers + JSON.parse(db.get("extra-"+req.session.userinfo.id)).servers
        }
        let servers = await axios.get("https://"+settings.panel.url+"/api/application/users?include=servers&filter[email]="+encodeURIComponent(req.session.userinfo.email),{headers:{'Authorization':`Bearer ${settings.panel.key}`}});
        let usedRam = 0;
        let usedDisk = 0;
        let usedCpu = 0;
        let usedSlots = servers.data.data[0].attributes.relationships.servers.data.length;
        let sv = servers.data.data[0].attributes.relationships.servers.data;
        for(let i = 0; i < sv.length; i++) {
            usedRam += sv[i].attributes.limits.memory;
            usedDisk += sv[i].attributes.limits.disk;
            usedCpu += sv[i].attributes.limits.cpu;
        }
        let availables = {
            ram:ures.ram-usedRam,
            disk:ures.disk-usedDisk,
            cpu:ures.cpu-usedCpu,
            slots:ures.servers-usedSlots
        }
        req.session.servers = servers.data.data[0].attributes.relationships.servers.data;
        res.render("default/creds",{req:req,servers:req.session.servers,db:db,userinfo:req.session.userinfo,resources:availables,admin:req.session.pterod.root_admin,name:settings.panel.name,coins:JSON.parse(db.get(`coins-${req.session.userinfo.id}`)).coins,pass:db.get("pass-"+req.session.userinfo.id)})
    }
})
router.get("/link",async(req, res) => {
    res.redirect("https://"+settings.panel.url)
})
router.get("/afk", async(req, res) => {
    if(req.session.loggedin !== true) {
        res.redirect("/auth/login")
    }else{
        if(db.get("extra-"+req.session.userinfo.id) == undefined) {
            let eres = {
                ram:0,
                disk:0,
                cpu:0,
                servers:0
            }
            db.set("extra-"+req.session.userinfo.id,JSON.stringify(eres))
        }
        let ures = {
            ram:settings.resources.ram + JSON.parse(db.get("extra-"+req.session.userinfo.id)).ram,
            disk:settings.resources.disk + JSON.parse(db.get("extra-"+req.session.userinfo.id)).disk,
            cpu:settings.resources.cpu + JSON.parse(db.get("extra-"+req.session.userinfo.id)).cpu,
            servers:settings.resources.servers + JSON.parse(db.get("extra-"+req.session.userinfo.id)).servers
        }
        let servers = await axios.get("https://"+settings.panel.url+"/api/application/users?include=servers&filter[email]="+encodeURIComponent(req.session.userinfo.email),{headers:{'Authorization':`Bearer ${settings.panel.key}`}});
        let usedRam = 0;
        let usedDisk = 0;
        let usedCpu = 0;
        let usedSlots = servers.data.data[0].attributes.relationships.servers.data.length;
        let sv = servers.data.data[0].attributes.relationships.servers.data;
        for(let i = 0; i < sv.length; i++) {
            usedRam += sv[i].attributes.limits.memory;
            usedDisk += sv[i].attributes.limits.disk;
            usedCpu += sv[i].attributes.limits.cpu;
        }
        let availables = {
            ram:ures.ram-usedRam,
            disk:ures.disk-usedDisk,
            cpu:ures.cpu-usedCpu,
            slots:ures.servers-usedSlots
        }
        req.session.servers = servers.data.data[0].attributes.relationships.servers.data;
        res.render("default/afk",{req:req,servers:req.session.servers,db:db,userinfo:req.session.userinfo,resources:availables,admin:req.session.pterod.root_admin,name:settings.panel.name,coins:JSON.parse(db.get(`coins-${req.session.userinfo.id}`)).coins})
    }
})


module.exports.path = "/panel";
module.exports.router = router;