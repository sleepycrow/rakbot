const Discord = require('discord.js');
const axios = require('axios');

module.exports = {
    name: "translate",
    command: true,
    regex: /t(ranslate)? ([A-Za-z-]+) ([^`]+)/,
    usage: "&t [lang1-]<lang2> <tekst>",
    description: "Tłumaczenia powered by Yandex.Translate",
    category: "Narzędzia",

    onInvoke: function(ctx, message){
        message.channel.startTyping();

        let match = message.content.match(this.regex);
        var lang = match[2];
        var text = match[3];

        axios.get("https://translate.yandex.net/api/v1.5/tr.json/translate?key=" + process.env.YANDEX_KEY
            + "&lang=" + encodeURIComponent(lang)
            + "&text=" + encodeURIComponent(text))
        .then(resp => {
            if(resp.data.text && resp.data.lang){
                message.channel.send(new Discord.RichEmbed({
                    title: resp.data.lang,
                    description: resp.data.text.join("\n"),
                    author: {
                        name: "Powered by Yandex.Translate",
                        url: "https://translate.yandex.com"
                    }
                }));
            }else if(resp.data.message){
                throw {errMsg: resp.data.message};
            }else{
                throw {};
            }
        })
        .catch(err => {
            ctx.utils.sendError(err, message.channel);
        })
        .then(() => {
            message.channel.stopTyping();
        });
    }
};