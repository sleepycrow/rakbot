const axios = require('axios');
const Discord = require('discord.js');

module.exports = {
    name: "e621",
    command: true,
    regex: /e621 ([^`]+)/,
    usage: "&e621 <tagi oddzielone przecinkami>",
    description: "Wysyła losową pracę z e621 posiadającą podane tagi.",
    category: "Zabawa",

    onInvoke: function(ctx, message){
        message.channel.startTyping();
        let tags = message.content.match(this.regex)[1];
        tags = tags.replace(/, ?/g, "+");
        tags = tags.replace(/ /g, "_");

        axios.get("https://e621.net/post/index.json?tags="+tags, {
            headers: {"User-Agent": "Rakbot/2.0 geihomo"}
        })
        .then(resp => {
            if(resp.data.length <= 0) throw {errMsg: "Nie znaleziono żadnych dzieł o tagach " + tags};

            let item = resp.data[Math.randomRange(0, resp.data.length - 1)];
            message.channel.send(new Discord.RichEmbed({
                title: item.file_url,
                description: item.tags,
                url: item.file_url,
                file: item.file_url
            }));
        })
        .catch(err => {
            ctx.utils.sendError(err, message.channel);
        })
        .then(() => {
            message.channel.stopTyping();
        });
    }
};