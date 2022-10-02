const { application } = require('express');
const crypto = require('crypto')
const axios = require('axios')
const DiscordOauth2 = require("discord-oauth2");
const db = require('../handler/DB')
function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}
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
const oauth = new DiscordOauth2({
	clientId: `${settings.discord.id}`,
	clientSecret: `${settings.discord.secret}`,
	redirectUri: `${settings.discord.callback}`,
});
const express = require('express')
const router = new express.Router()

router.get("/login", async(req, res) => {
    res.render("default/login",{req:req,name:settings.panel.name})
})
router.get("/logout", async(req, res) => {
    req.session.destroy(function(err) {
        res.redirect("/")
      })
})
router.get("/callback", async(req, res) => {
    oauth.tokenRequest({
        clientId: `${settings.discord.id}`,
        clientSecret: `${settings.discord.secret}`,
    
        code: req.query.code,
        scope: "identify guilds email guilds.join",
        grantType: "authorization_code",

        redirectUri: `${settings.discord.callback}`,
    }).then(c => {
        req.session.code = c.access_token;
        oauth.getUser(c.access_token).then(async d => {
            req.session.userinfo = d;
            let userinfo = d;
            if(db.get(`user-${userinfo.id}`) == undefined) {
                // Create Account
                let usrList = await axios.get("https://"+settings.panel.url+"/api/application/users?include=servers&filter[email]="+encodeURIComponent(userinfo.email),{headers:{'Authorization':`Bearer ${settings.panel.key}`}});
                if(usrList.length == 0) {
                    axios.post("https://"+settings.panel.url+"/api/application/users",{"email":userinfo.email,"username":userinfo.id,"first_name":userinfo.username,"last_name":userinfo.discriminator},{headers:{'Authorization':`Bearer ${settings.panel.key}`}}).then(async ptrreg => {
                    let servers = await axios.get("https://"+settings.panel.url+"/api/application/users?include=servers&filter[email]="+encodeURIComponent(userinfo.email),{headers:{'Authorization':`Bearer ${settings.panel.key}`}});
                    let info = {
                        id:ptrreg.data.attributes.id,
                        uuid:ptrreg.data.attributes.uuid,
                        userinfo:userinfo
                    }
                    req.session.pterod = servers.data.data[0].attributes;
                    req.session.pter = ptrreg.data.attributes.id;
                    req.session.servers = [];
                    req.session.resources = settings.resources;
                    req.session.loggedin = true;
                    let newPass = makeid(8)
                    let zee = await axios.patch("https://"+settings.panel.url+"/api/application/users/"+ptrreg.data.attributes.id,{"email":userinfo.email,"username":userinfo.id,"first_name":userinfo.username,"last_name":userinfo.discriminator,"language":"en","password":newPass},{headers:{'Authorization':`Bearer ${settings.panel.key}`}})
                    db.set("user-"+userinfo.id,JSON.stringify(info));
                    db.set(`pass-${userinfo.id}`,`${newPass}`)
                    db.set(`coins-${userinfo.id}`,JSON.stringify({coins:0}))
                    res.redirect("/panel/home")
                }).catch(e => {
                    res.send("An error occured while creating your account. Please try again later.")
                })
                }else{
                    req.session.pterod = usrList.data.data[0].attributes;
                    req.session.pter = usrList.data.data[0].attributes.id;
                    req.session.servers = usrList.data.data[0].attributes.relationships.servers.data;
                    req.session.resources = settings.resources;
                    req.session.loggedin = true;
                    let newPass = makeid(8)
                    let zee = await axios.patch("https://"+settings.panel.url+"/api/application/users/"+ptrreg.data.attributes.id,{"email":userinfo.email,"username":userinfo.id,"first_name":userinfo.username,"last_name":userinfo.discriminator,"language":"en","password":newPass},{headers:{'Authorization':`Bearer ${settings.panel.key}`}})
                    db.set("user-"+userinfo.id,JSON.stringify(info));
                    db.set(`pass-${userinfo.id}`,`${newPass}`)
                    db.set(`coins-${userinfo.id}`,JSON.stringify({coins:0}))
                }
            }else{
                let z = JSON.parse(db.get(`user-${userinfo.id}`));
                req.session.pter = z.id;
                let servers = await axios.get("https://"+settings.panel.url+"/api/application/users?include=servers&filter[email]="+encodeURIComponent(userinfo.email),{headers:{'Authorization':`Bearer ${settings.panel.key}`}});
                req.session.pterod = servers.data.data[0].attributes;
                req.session.servers = servers.data.data[0].attributes.relationships.servers.data;
                req.session.resources = settings.resources;
                req.session.loggedin = true;
                if(db.get(`pass-${userinfo.id}`) == undefined) {
                    let newPass = makeid(8)
                    let zee = await axios.patch("https://"+settings.panel.url+"/api/application/users/"+z.id,{"email":userinfo.email,"username":userinfo.id,"first_name":userinfo.username,"last_name":userinfo.discriminator,"language":"en","password":newPass},{headers:{'Authorization':`Bearer ${settings.panel.key}`}})
                    db.set(`pass-${userinfo.id}`,`${newPass}`)
                }
                if(db.get(`coins-${userinfo.id}`) == undefined) db.set(`coins-${userinfo.id}`,JSON.stringify({coins:0}))
                res.redirect("/panel/home")
            }
        });
    }).catch(e => {
        console.log(e)
        res.redirect("/auth/discord")
    })
})
router.get("/discord", async(req, res) => {
    const url = oauth.generateAuthUrl({
        scope: ["identify", "guilds","email","guilds.join"],
        state: crypto.randomBytes(16).toString("hex"), // Be aware that randomBytes is sync if no callback is provided
    });
    res.redirect(url)
})

module.exports.path = "/auth";
module.exports.router = router;
