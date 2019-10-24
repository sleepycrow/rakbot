const Discord = require('discord.js');
const defaultCategory = "Nieskategoryzowane";

module.exports = {
    name: "help",
    command: true,
    regex: /help/,
    usage: "&help",
    description: "Wysyła na kanał listę komend",
    category: "Narzędzia",

    onInvoke: function(context, message){
        var entries = {};

        for(var i = 0; i < context.modules.length; i++){
            let module = context.modules[i];
            let category = module.category || defaultCategory;
            
            if(!entries[category]) entries[category] = [];

            if(module.usage && module.description){
                entries[category].push("**" + context.modules[i].usage + "** - " + context.modules[i].description);
            }else if(module.helpEntry){
                entries[category].push(module.helpEntry);
            }
        }

        for(let category in entries){
            if(entries[category].length == 0) continue;
            
            message.channel.send(new Discord.RichEmbed({
                title: "**" + category + "**",
                description: entries[category].join("\n")
            }));
        }
    }
};