module.exports = {
    name: "anti-rak",

    onMessage: function(context, message){
        if(message.author != context.client.user){
            if(message.content.includes("😂"))
                message.react("👎");
        }
    }
};