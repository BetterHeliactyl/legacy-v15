const { application } = require('express');
const express = require('express')
const axios = require('axios')
const router = new express.Router()
const fs = require('fs')
const db = require('../handler/DB')
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


router.get("/buyDisk", async (req, res) => {
    if(req.session.loggedin !== true) return res.redirect("/auth/login");
    let price = 0.25;
    if(!req.query.amount || isNaN(req.query.amount)) return res.send("Bad amount!");
    if(db.get(`price-disk`) != undefined) price = parseInt(db.get("price-disk"));
    if(JSON.parse(db.get(`coins-${req.session.userinfo.id}`)).coins < parseInt(req.query.amount)*price) return res.send("You cannot afford this!");
    let cex = {ram:0,cpu:0,disk:0,servers:0}
    if(db.get("extra-"+req.session.userinfo.id) == undefined) {
        cex = {ram:0,cpu:0,disk:0,servers:0};
    }else{
        cex = JSON.parse(db.get("extra-"+req.session.userinfo.id));
    }
    cex.disk += parseInt(req.query.amount);
    db.set(`extra-${req.session.userinfo.id}`,JSON.stringify(cex))
    db.set(`coins-${req.session.userinfo.id}`,JSON.stringify({coins:JSON.parse(db.get(`coins-${req.session.userinfo.id}`)).coins-(parseInt(req.query.amount)*price)}))
    res.redirect("/store/buy?success="+encodeURIComponent("Successfully purchased "+req.query.amount+"MB of Disk."))
})
router.get("/buyRAM", async (req, res) => {
    if(req.session.loggedin !== true) return res.redirect("/auth/login");
    let price = 0.5;
    if(!req.query.amount || isNaN(req.query.amount)) return res.send("Bad amount!");
    if(db.get(`price-ram`) != undefined) price = parseInt(db.get("price-ram"));
    if(JSON.parse(db.get(`coins-${req.session.userinfo.id}`)).coins < parseInt(req.query.amount)*price) return res.send("You cannot afford this!");
    let cex = {ram:0,cpu:0,disk:0,servers:0}
    if(db.get("extra-"+req.session.userinfo.id) == undefined) {
        cex = {ram:0,cpu:0,disk:0,servers:0};
    }else{
        cex = JSON.parse(db.get("extra-"+req.session.userinfo.id));
    }
    cex.ram += parseInt(req.query.amount);
    db.set(`extra-${req.session.userinfo.id}`,JSON.stringify(cex))
    db.set(`coins-${req.session.userinfo.id}`,JSON.stringify({coins:JSON.parse(db.get(`coins-${req.session.userinfo.id}`)).coins-(parseInt(req.query.amount)*price)}))
    res.redirect("/store/buy?success="+encodeURIComponent("Successfully purchased "+req.query.amount+"MB of RAM."))
})
router.get("/buyCPU", async (req, res) => {
    if(req.session.loggedin !== true) return res.redirect("/auth/login");
    let price = 5;
    if(!req.query.amount || isNaN(req.query.amount)) return res.send("Bad amount!");
    if(db.get(`price-cpu`) != undefined) price = parseInt(db.get("price-cpu"));
    if(JSON.parse(db.get(`coins-${req.session.userinfo.id}`)).coins < parseInt(req.query.amount)*price) return res.send("You cannot afford this!");
    let cex = {ram:0,cpu:0,disk:0,servers:0}
    if(db.get("extra-"+req.session.userinfo.id) == undefined) {
        cex = {ram:0,cpu:0,disk:0,servers:0};
    }else{
        cex = JSON.parse(db.get("extra-"+req.session.userinfo.id));
    }
    cex.cpu += parseInt(req.query.amount);
    db.set(`extra-${req.session.userinfo.id}`,JSON.stringify(cex))
    db.set(`coins-${req.session.userinfo.id}`,JSON.stringify({coins:JSON.parse(db.get(`coins-${req.session.userinfo.id}`)).coins-(parseInt(req.query.amount)*price)}))
    res.redirect("/store/buy?success="+encodeURIComponent("Successfully purchased "+req.query.amount+"% of CPU."))
})
router.get("/buySlots", async (req, res) => {
    if(req.session.loggedin !== true) return res.redirect("/auth/login");
    let price = 250;
    if(!req.query.amount || isNaN(req.query.amount)) return res.send("Bad amount!");
    if(db.get(`price-slot`) != undefined) price = parseInt(db.get("price-slot"));
    if(JSON.parse(db.get(`coins-${req.session.userinfo.id}`)).coins < parseInt(req.query.amount)*price) return res.send("You cannot afford this!");
    let cex = {ram:0,cpu:0,disk:0,servers:0}
    if(db.get("extra-"+req.session.userinfo.id) == undefined) {
        cex = {ram:0,cpu:0,disk:0,servers:0};
    }else{
        cex = JSON.parse(db.get("extra-"+req.session.userinfo.id));
    }
    cex.servers += parseInt(req.query.amount);
    db.set(`extra-${req.session.userinfo.id}`,JSON.stringify(cex))
    db.set(`coins-${req.session.userinfo.id}`,JSON.stringify({coins:JSON.parse(db.get(`coins-${req.session.userinfo.id}`)).coins-(parseInt(req.query.amount)*price)}))
    res.redirect("/store/buy?success="+encodeURIComponent("Successfully purchased "+req.query.amount+" slot."))
})
router.get("/buy", async(req, res) => {
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
        res.render("default/store",{req:req,servers:req.session.servers,db:db,userinfo:req.session.userinfo,resources:availables,admin:req.session.pterod.root_admin,name:settings.panel.name,coins:JSON.parse(db.get(`coins-${req.session.userinfo.id}`)).coins})
    }
})
module.exports.path = "/store";
module.exports.router = router;