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
    
      event.replyText = function(message){
           event.reply([{
              "type": "text",
              "text": message
           }]).then(data => {
                console.log('Success', data);
           }).catch(error => {
                console.log('Failed', error);
           });
      }
      
      event.replyButton = function(/*title,message,button,postback,...*/){
           var obj = {
              "type": "template",
              "altText": arguments[0],
              "template": {
                  "type": "buttons",
                  "thumbnailImageUrl": null,
                  "imageAspectRatio": "rectangle",
                  "imageSize": "cover",
                  "imageBackgroundColor": "#FFFFFF",
                  "title": arguments[0],
                  "text": arguments[1],
                  "actions": [
                      {
                        "type": "postback",
                        "label": arguments[2],
                        "data": arguments[3],
                      }
                  ]
              }
           }
           for (var i = 0; i < 3; i++) {
             if(arguments.length > 2*i+4){
                obj.template.actions[i+1]={
                  "type":  "postback",
                  "label": arguments[2*i+4],
                  "data":  arguments[2*i+5] 
                };
             }
           }
          event.reply([obj]).then(data => {
                console.log('Success', data);
           }).catch(error => {
                console.log('Failed', error);
           });
      }
      
      event.replyFlex = function(/*title,message,button,uri...*/){
           event.reply([{
               "type": "flex",
                "altText": arguments[0],
                "contents": {
                    "type": "bubble",
                    "styles": {
                        "header": {
                            "backgroundColor": "#ff69b4"
                        }
                    },
                    "header": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "text",
                                "text": arguments[0]
                            }
                        ]
                    },
                    "body": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "text",
                                "text": arguments[1],
                                "wrap": true
                            }
                        ]
                    },
                    "footer": {
                        "type": "box",
                        "layout": "vertical",
                        "contents": [
                            {
                                "type": "button",
                                "action": {
                                    "type": "uri",
                                    "label": arguments[2],
                                    "uri": arguments[3]
                                }
                            },
                            {
                                "type": "button",
                                "action": {
                                    "type": "uri",
                                    "label": arguments[4],
                                    "uri": arguments[5]
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
                   if(err === null && obj!=null){
                       resolve(obj.status);
                   }
                   else if(err === null && obj===null){
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
              if(obj===null){
                  db.botstatus.insert({'lineid':lineID,'status':status});  
              }
              else{
                  db.botstatus.update({ 'lineid': lineID }, { $set: { status: status } }, { multi: true });
              }
          });
      }
}


const Main = function(app){
    const bot = new Linebot(app);
    const escape = require('unicode-escape');

    this.onMessageEvent = function(event){
      event.replyFlex(
            "Shuffling!",
            "アニメーションを作成",
            "サンプル",
            "https://snst-lab.github.io/shuffling/public/redirect",
            "メッセージから",
            "https://snst-lab.github.io/shuffling/public/redirect?text=" + escape(event.message.text).replace(/\\/g, "@@")
        );
    }
    
    app.listen(process.env.PORT || 3000, () => {
        console.log('Server is running.');
    });
    bot.onMessageEvent(this.onMessageEvent);
}
const express = require('express');
new Main(express());