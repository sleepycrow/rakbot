module.exports = {
    name: "marineta",

    onMessage: function(context, message){
        if(!message.author.bot){
            if(message.content.match(/(marinet(a|y|e|ę))/ig) != null){
                message.channel.send("<3 **kocham marinetę** <3");
            }
        }
    }
};