const { application } = require('express');
const express = require('express')
const router = new express.Router()
const fs = require('fs')
const db = require('../handler/DB')
router.get("/discord", async(req, res) => {
    if(db.get("settings-discord") == undefined) {
        let html = fs.readFileSync("./_i/discord-setup.ejs").toString()
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(html)
        res.end()
    }
})
router.get("/panel", async(req, res) => {
    if(db.get("settings-panel") == undefined) {
        let html = fs.readFileSync("./_i/panel-setup.ejs").toString()
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(html)
        res.end()
    }
})
router.get("/resources", async(req, res) => {
    if(db.get("settings-resources") == undefined) {
        let html = fs.readFileSync("./_i/resources-setup.ejs").toString()
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(html)
        res.end()
    }
})
router.get("/setup", async(req, res) => {
    res.redirect("/setup/discord")
})
router.get("/doPanel", async(req, res) => {
    if(db.get("settings-panel") == undefined) {
        let settings = {
            url: decodeURIComponent(req.query.url),
            key: decodeURIComponent(req.query.key),
            name:decodeURIComponent(req.query.name)
        }
        db.set("settings-panel",JSON.stringify(settings))
        res.redirect("/setup/resources")
    }else{
        res.redirect("/setup/panel")
    }
})
router.get("/doResources", async(req, res) => {
    if(db.get("settings-resources") == undefined) {
        let settings = {
            ram: parseInt(decodeURIComponent(req.query.ram)),
            disk: parseInt(decodeURIComponent(req.query.disk)),
            servers: parseInt(decodeURIComponent(req.query.servers)),
            cpu: parseInt(decodeURIComponent(req.query.cpu))
        }
        db.set("settings-resources",JSON.stringify(settings))
        let html = fs.readFileSync("./_i/setup-finished.ejs").toString()
        res.writeHead(200, {"Content-Type": "text/html"});
        res.write(html)
        res.end()
        setTimeout(() => {
            process.exit(1)
        },500)
    }else{
        res.redirect("/setup/panel")
    }
})

router.get("/doDiscord", async(req, res) => {
    if(db.get("settings-discord") == undefined) {
        let settings = {
            clientid: decodeURIComponent(req.query.clientid),
            secret: decodeURIComponent(req.query.secret),
            callback:decodeURIComponent(req.query.callback)
        }
        db.set("settings-discord",JSON.stringify(settings))
        res.redirect("/setup/panel")
    }else{
        res.redirect("/setup/panel")
    }
})

module.exports.path = "/setup";
module.exports.router = router;