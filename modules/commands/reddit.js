const axios = require('axios');
const Discord = require("discord.js");

module.exports = {
    name: "reddit",
    command: true,
    regex: /reddit ([^`]+)/,
    usage: "&reddit <subreddit>",
    description: "Wysyła losowy wpis z wybranego subreddita.",
    category: "Zabawa",

    onInvoke: function(ctx, message){
        message.channel.startTyping();

        let subreddit = message.content.match(this.regex)[1];

        axios.get("https://www.reddit.com/r/" + subreddit + "/new.json")
        .then(resp => {
            let posts = resp.data.data.children;

            if(posts.length <= 0) throw {errMsg: "r/" + subreddit + " nie istnieje lub nie posiada wpisów."};

            let post = posts[Math.randomRange(0, posts.length - 1)].data;
            message.channel.send(new Discord.RichEmbed({
                title: post.title,
                description: post.selftext.substr(0, 2048),
                url: post.url,
                file: (post.post_hint ? post.url : null)
            }));
        })
        .catch(err => {
            ctx.utils.sendError(err, message.channel);
        })
        .then(() => {
            message.channel.stopTyping();
        });
    }
}