module.exports = {
    name: "Anti-AMD",

    onMessage: function(context, message){
        if(message.author != context.client.user && message.content.match(/AMD/ig) != null){
            let response = message.content.replace(/AMD/ig, "**Intel**");
            response = response.replace(/(gówn|chuj)([^ ]+)/ig, "**zajebiste**");
            message.channel.send("Somsiat chciał powiedzieć że " + response + " B))");
        }
    }
};