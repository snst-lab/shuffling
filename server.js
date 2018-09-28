"use strict";

const Linebot = function(app) {
  const linebot = require('linebot');
  const Database = require('nedb');
  const db={};
  db.botstatus = new Database({
      filename: '.database/botstatus',
      autoload: true
  });
  
  this.bot = linebot({
      channelId: process.env.CHANNEL_ID,
      channelSecret: process.env.CHANNEL_SECRET,
      channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
      verify: true
  });
  app.post('/', this.bot.parser());
  
  this.onMessageEvent = function (callback){
      this.bot.on('message',event => {
            this.setMessageTemplate(event);
            callback(event);
      });
  }
  
  this.setMessageTemplate = function(event){     
      event.replyFlex = function(title,src,message,button,uri){
           event.reply([{
               "type": "flex",
                "altText": title,
                "contents": {
                    "type": "bubble",
                    "header": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "text",
                                "text": title
                            }
                        ]
                    },
                    "hero": {
                        "type": "image",
                        "url": src,
                        "size": "full",
                        "aspectRatio": "2:1"
                    },
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "text",
                                "text": message,
                                "wrap": true
                            }
                        ]
                    },
                    "footer": {
                        "type": "box",
                        "layout": "horizontal",
                        "contents": [
                            {
                                "type": "button",
                                "style": "primary",
                                "action": {
                                    "type": "uri",
                                    "label": "デフォルト",
                                    "uri": "https://snst-lab.github.io/shuffling/index"
                                }
                            },
                            {
                                "type": "button",
                                "style": "primary",
                                "action": {
                                    "type": "uri",
                                    "label": button,
                                    "uri": uri
                                }
                            }
                        ]
                    }
                }
           }]).then(data => {
                console.log('Success', data);
           }).catch(error => {
                console.log('Failed', error);
                 try{throw new Error('Success');}catch(e){console.log(e);}
           });
          }
      }

      this.readDatabase = function(lineID,callback){
          return new Promise((resolve, reject) =>  {
              db.botstatus.findOne({ lineid: lineID }, (err, obj) =>{
                   if(err == null && obj!=null){
                       resolve(obj.status);
                   }
                   else if(err == null && obj==null){
                       resolve('action=null');
                   }
                   else{
                       reject(err);
                   }
              });
          });
      }

      this.writeDatabase = function(lineID,status){
          db.botstatus.findOne({ lineid: lineID }, (err, obj) => {
              if(obj==null){
                  db.botstatus.insert({'lineid':lineID,'status':status});  
              }
              else{
                  db.botstatus.update({ 'lineid': lineID }, { $set: { status: status } }, { multi: true });
              }
          });
      }
}

const Route = function(app){
    app.use(express.static('public'));
    app.get("/", (req, res) => {
        res.sendFile(__dirname + '/public/redirect.html');
    });
}


var Main = function(app){
    const route = new Route(app);
    const bot = new Linebot(app);
  
    this.onMessageEvent = function(event){
        event.replyFlex(
            "Shuffling!",
            null,
            "アニメーションを生成",
            "メッセージから",
            "https://snst-lab.github.io/shuffling/public/redirect?text="+event.message.text
        );
    }
    
    app.listen(process.env.PORT || 80, () => {
        console.log('Server is running.');
    });
    bot.onMessageEvent(this.onMessageEvent);
}
const express = require('express');
new Main(express());