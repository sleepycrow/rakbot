const Discord = require('discord.js');
const axios = require('axios');

module.exports = {
    name: "4chan",
    command: true,
    regex: /4ch(?:an)? ?([A-Za-z0-9]+)?(?: ([^]+))?/,
    usage: "&4chan [board] [szukane]",
    description: "Przyszukuje boarda lub wysyła losowy OP z niego (domyślnie /b/)",
    category: "Zabawa",

    onInvoke: function(ctx, message){
        message.channel.startTyping();

        let board = message.content.match(this.regex)[1] || "b";
        let query = message.content.match(this.regex)[2] || null;

        axios.get("http://a.4cdn.org/" + board + "/catalog.json")
        .then(resp => {
            let threads = (query != null ? searchThreads(resp.data, query) : getRandomThread(resp.data));

            for(let i = 0; i < threads.length; i++){
                let thread = threads[i];
                let image = "http://i.4cdn.org/" + board + "/" + thread.tim + thread.ext;
                let link = "http://boards.4chan.org/" + board + "/thread/" + thread.no;
                let post = thread.com;
                post = post.replace(/<span( [^>]+)?>([^<]+)<\/span>/gi, "$2");
                post = post.replace(/<br>/gi, "\n");
                post = post.replace(/&gt;/gi, ">");
                post = post.replace(/&lt;/gi, "<");
                post = post.replace(/&#039;/gi, "'");
                post = post.replace(/&quot;/gi, "\"");
                post = post.replace(/<([^>]+)>/gi, "");

                message.channel.send(new Discord.RichEmbed({
                    title: (thread.sub || ("Thread #" + thread.no)),
                    description: post,
                    url: link,
                    file: image
                }));
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

function getRandomThread(resp){
    let page = resp[Math.randomRange(0, resp.length)];
    let thread = page.threads[Math.randomRange(0, page.threads.length)];
    return [thread];
}

function searchThreads(resp, query){
    let results = [];
  
    for(var page = 0; page < resp.length; page++){
        for(var i = 0; i < resp[page].threads.length; i++){
            var thread = resp[page].threads[i];
            if((thread.sub && thread.sub.includes(query)) || (thread.com && thread.com.includes(query)))
              results.push(thread);
        }
    }
  
    return results;
}