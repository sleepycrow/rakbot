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

        axios.get("https://e621.net/posts.json?tags="+tags, {
            headers: {"User-Agent": "Rakbot/2.0"}
        })
        .then(resp => {
            var posts = resp.data.posts;
            if(posts.length <= 0) throw {errMsg: "Nie znaleziono żadnych dzieł o tagach " + tags};

            // Select a random submission
            let item = posts[Math.randomRange(0, posts.length - 1)];

            // Make a string of all of the submission's the tags
            let tags = "";
            for(cat in item.tags) tags += item.tags[cat].join(" ");

            message.channel.send(new Discord.RichEmbed({
                title: item.file.url,
                description: tags,
                url: item.file.url,
                file: item.file.url
            }));
        })
        .catch(err => {
            console.error(err);
            ctx.utils.sendError(err, message.channel);
        })
        .then(() => {
            message.channel.stopTyping();
        });
    }
};
