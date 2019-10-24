const axios = require("axios");
const Discord = require("discord.js");

module.exports = {
    name: "ddg",

    onMessage: function(ctx, message){
        if(message.content.substr(0, 1) == "!") return false;
      
        var query = null;
        
        try{
            var question = message.content.match(/(?:^| )(?:kto|co|czym?|kiedy|gdzie|kim|jak) (?:[^ ]+) ([^?.!$]+)([?.!]|$)/i);
            var query = question[1];
            //nwm co to robi i czemu nie działa lol
            //query = question[1].match(/(?:jest|był|stał|odbył|był|to)(?:o|a)?(?: się)? ([^?.!$]+)/)[1] || query;
        }catch(e){
            return false;
        }
        
        if(query){
            console.log("[DDG]", message.content, query);
          
            axios.get("https://api.duckduckgo.com/?format=json&skip_disambig=1&q=" + encodeURIComponent(query), {
                headers: {"Accept-Language": "pl"}
            })
            .then((resp) => {
                if(resp.data.Answer){
                    message.channel.send(new Discord.RichEmbed({
                        title: "DuckDuckGo",
                        url: "https://duckduckgo.com/?q=" + encodeURIComponent(query),
                        description: resp.data.Answer
                    }));
                }else if(resp.data.AbstractText){
                    let title = resp.Heading ? resp.Heading : "DuckDuckGo";
                    let url = resp.AbstractURL ? resp.AbstractURL : "https://duckduckgo.com/?q=" + encodeURIComponent(query);

                    let author = {url: url};
                    if(resp.AbstractSource) author.name = resp.AbstractSource;

                    let desc = resp.data.Abstract;
                    desc = desc.replace(/<\/?code>/gi, "```");
                    desc = desc.replace(/<\/?b>/gi, "**");
                    desc = desc.replace(/<\/?em>/gi, "_");
                    desc = desc.replace(/<([^>]+)>/gi, "");
                    desc = desc.replace(/\&gt;/gi, ">");
                    desc = desc.replace(/\&lt;/gi, "<");

                    message.channel.send(new Discord.RichEmbed({
                        title: title,
                        description: desc,
                        url: url,
                        author: author
                    }).setImage(resp.data.Image));
                }
            })
            .catch(console.log);
        }
    }
};