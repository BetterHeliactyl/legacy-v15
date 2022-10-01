const { application } = require('express');
const express = require('express')
const router = new express.Router()
const fs = require('fs')
const db = require('../handler/DB')

let earners = {}

router.ws("/ws", function(ws, req) {
    if(req.session.loggedin !== true) return ws.end();
    let time = 60;
    earners[req.session.userinfo.id] = true;
    let aba = setInterval(() => {
        if(earners[req.session.userinfo.id] == true) {
            time--;
            if(time <= 0) {
                time = 60;
                ws.send(JSON.stringify({"type":"coin"}))
                let r = JSON.parse(db.get(`coins-${req.params.id}`)).coins + 1;
                db.set(`coins-${req.session.userinfo.id}`,{coins:r})
            }
            ws.send(JSON.stringify({"type":"count","amount":time}))
        }
    }, 1000)
    ws.on('close', async () => {
        delete earners[req.session.userinfo.id];
        clearInterval(aba)
    })
  })

module.exports.path = "/afk";
module.exports.router = router;