const { application } = require('express');
const express = require('express')
const axios = require('axios')
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
router.get("/delete", async(req, res) => {
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
        if(!req.query.id) return res.send("Invalid server!");
        let found = false;
        let fsrv = {}
        for(let i = 0; i < sv.length; i++) {
            if(sv[i].attributes.identifier == `${req.query.id}`) {
                found = true;
                fsrv = sv[i].attributes;
            }
        }
        if(found == false) return res.send("You do not own this server!");
        try {
            let z = await axios.delete("https://"+settings.panel.url+"/api/application/servers/"+fsrv.id+"/force",{headers:{'Authorization':`Bearer ${settings.panel.key}`}})
        res.redirect("/panel/home?success="+encodeURIComponent("Your server has been deleted!"))
        }catch(e) {
            res.redirect("/panel/home?err="+encodeURIComponent("Failed to delete your server!"))
        }
    }
})
router.get("/create", async(req, res) => {
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
        res.render("default/create",{req:req,servers:req.session.servers,db:db,userinfo:req.session.userinfo,resources:availables,admin:req.session.pterod.root_admin,name:settings.panel.name,locs:JSON.parse(db.get(`locations`)),eggs:JSON.parse(db.get(`eggs`)),coins:JSON.parse(db.get(`coins-${req.session.userinfo.id}`)).coins})
    }
})
router.get("/doCreate", async(req, res) => {
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
        if(!req.query.ram || !req.query.disk || !req.query.cpu || !req.query.name || !req.query.egg || !req.query.location) return res.redirect("/servers/create?error="+encodeURIComponent("You did not fill out all of the input boxes!"));
        if(isNaN(req.query.ram) || isNaN(req.query.disk) || isNaN(req.query.cpu)) return res.send("Need a number for resource amts.");
        let dec = {
            ram:parseFloat(req.query.ram),
            disk:parseFloat(req.query.disk),
            cpu:parseFloat(req.query.cpu),
            name:decodeURIComponent(req.query.name),
            egg:parseFloat(req.query.egg),
            loc:parseFloat(req.query.location)
        }
        if(dec.ram > availables.ram || dec.ram < 256) return res.send("Invalid resource amount!");
        if(dec.disk > availables.disk || dec.disk < 256) return res.send("Invalid resource amount!");
        if(dec.cpu > availables.cpu || dec.cpu < 10) return res.send("Invalid resource amount!");
        if(availables.slots < 1) return res.send("Not enough slots!"); // shouldnt we use ?err=thinghere?
        if(!(new RegExp("[a-zA-Z 0-9]+").test(dec.name))) return res.send("Invalid name!");
        let eggs = JSON.parse(db.get(`eggs`))
        let egg = {}
        for(let i = 0;i < eggs.length; i++) {
            if(eggs[i].id == +req.query.egg) {
                egg = eggs[i]
            }
        }
        try{
            let tet = await axios.post("https://"+settings.panel.url+"/api/application/servers",{"name":decodeURIComponent(req.query.name),"user":req.session.pter,environment:egg.environment,egg:egg.id,docker_image:egg.docker_image,startup:egg.startup,limits:{memory:+req.query.ram,swap:0,disk:+req.query.disk,io:500,cpu:+req.query.cpu},feature_limits:{databases:1,backups:1},deploy:{locations:[+req.query.location],dedicated_ip:false,port_range:[]}},{headers:{'Authorization':'Bearer '+settings.panel.key}});
        //console.log(tet.data)
        res.redirect("/panel/home?success="+encodeURIComponent("Server created!"))
        }catch(e) {
            console.log(e.response.data)
        }
    }
})
module.exports.path = "/servers";
module.exports.router = router;