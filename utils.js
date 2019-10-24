const Discord = require('discord.js');

module.exports = {
    sendError: function(error, channel){
        channel.send(new Discord.RichEmbed({
            title: "❌ Błąd",
            description: error.errMsg || "Wystąpił błąd przy wykonywaniu tej operacji 😥"
        }));
    }
};