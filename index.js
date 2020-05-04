/*
  RakBot - Zaracza kanał
  https://discordapp.com/oauth2/authorize?access_type=online&client_id=368126162024529920&redirect_uri=https%3A%2F%2Frakbot.glitch.me&scope=bot&permissions=3148800
*/

require("dotenv").config();
const Discord = require('discord.js');
const fs = require("fs");
const client = new Discord.Client();
const utils = require("./utils.js");
const commandPrefix = /^&/;

var modules = [];
modules.push(require("./modules/commands/help.js"));
modules.push(require("./modules/commands/clean.js"));
modules.push(require("./modules/commands/emoji.js"));
modules.push(require("./modules/commands/e621.js"));
modules.push(require("./modules/commands/4chan.js"));
modules.push(require("./modules/commands/reddit.js"));
modules.push(require("./modules/commands/petittube.js"));
modules.push(require("./modules/commands/kurwa.js"));
modules.push(require("./modules/commands/sonda.js"));
modules.push(require("./modules/commands/bash.js"));
modules.push(require("./modules/commands/calc.js"));
modules.push(require("./modules/commands/translate.js"));
modules.push(require("./modules/commands/rand.js"));
modules.push(require("./modules/commands/roll.js"));
modules.push(require("./modules/commands/krypto.js"));
modules.push(require("./modules/anti-rak.js"));
modules.push(require("./modules/macro.js"));
modules.push(require("./modules/ddg.js"));
modules.push(require("./modules/nano.js"));

const context = {
    client: client,
    modules: modules,
    utils: utils,
    commandPrefix: commandPrefix
};

client.on('error', console.error);

client.on('message', message => {
    if(!message.author.bot){
        console.log("<" + message.author.tag + "> " + message.content);

        if(message.content.match(commandPrefix) != null) message.isRakbotCmd = true;

        let commandFound = false;

        for(var i = 0; i < modules.length; i++){

            if(message.isRakbotCmd && modules[i].command && !commandFound){
                if(message.content.match(new RegExp(commandPrefix.source + modules[i].regex.source)) != null){
                    modules[i].onInvoke(context, message);
                    commandFound = true;
                }
            }
            
            if(modules[i].onMessage){
                modules[i].onMessage(context, message);
            }
            
        }
    }
});

client.on('ready', () => {
    console.log('ready to rak!');
    client.user.setActivity('&help • www.rak.bot.nu', { type: 'PLAYING' });
});

fs.mkdirSync("assets"); // Make sure the assets dir exists, for module compatibility reasons.

for(var i = 0; i < modules.length; i++){
    if(modules[i].onStart) modules[i].onStart(context);
}

client.login(process.env.DISCORD_API_KEY);

// utility bullshit whatever lol
Math.randomRange = function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
};
