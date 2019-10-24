const Discord = require("discord.js");

const optionCodes = ["❤","💛","💙","💚","💜","🖤", "💟"];

module.exports = {
    name: "sonda",
    command: true,
    regex: /sonda/,
    usage: "&sonda \"<pytanie>\" \"<opcja 1>\" \"<opcja 2>\"...",
    description: "Tworzy sondę. Max 7 opcji.",
    category: "Narzędzia",

    onInvoke: function(context, message){
        var args = message.content.match(/"([^"]+)"/gi);
        var question = args.splice(0, 1)[0];
        var options = "";

        if(args.length <= optionCodes.length){
            for(var i = 0; i < args.length; i++){
                options += optionCodes[i] + " - " + args[i] + "\n";
            }

            message.channel.send(new Discord.RichEmbed({
                title: question,
                description: options
            }))
            .then((message) => {
                for(var i = 0; i < args.length; i++){
                    message.react(optionCodes[i]);
                }
            });
        }else{
            message.channel.send("⚠ Maksymalna liczba opcji w sondzie to " + optionCodes.length);
        }
    }
};