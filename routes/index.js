const { application } = require('express');
const express = require('express')
const db = require('../handler/DB')
const router = new express.Router()

router.get("/", async(req, res) => {
    if((db.get("settings-discord") == undefined) && (db.get("settings-panel") == undefined) && (db.get("settings-resources") == undefined)) {
        res.redirect("/setup/setup")
    }else{
    if(req.session.loggedin !== true) {
        res.redirect("/auth/login")
    }else{
        res.redirect("/panel/home")
    }
}
})

module.exports.path = "/";
module.exports.router = router;