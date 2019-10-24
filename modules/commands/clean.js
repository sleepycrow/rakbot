module.exports = {
    name: "clean",
    command: true,
    regex: /clean/,
    usage: "&clean",
    description: "Usuwa wiadomości rakbota spośród 20 ostatnich wiadomości w kanale",
    category: "Narzędzia",

    onInvoke: function(ctx, message){
        message.channel.fetchMessages({limit: 20})
        .then(resp => {
            let msgs = resp.array();
            for(var i = 0; i < msgs.length; i++){
                if(msgs[i].author.id == ctx.client.user.id || msgs[i].content.match(ctx.commandPrefix) != null){
                    msgs[i].delete().catch(() => {});
                }
            }
        })
        .catch(err => {
            ctx.utils.sendError(err, message.channel);
        });
    }
};