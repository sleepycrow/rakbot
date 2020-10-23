module.exports = {
    name: "say",
    command: true,
    regex: /say ([^`]+)/,
    usage: "&say <tekst>",
    description: "przemawia jedyny słuszny rabkot",
    category: "Narzędzia",

    onInvoke: function(context, message){
        var input = message.content.toLowerCase().match(this.regex)[1];
        message.channel.send(input);

        message.delete().catch(() => {});
    }
};
