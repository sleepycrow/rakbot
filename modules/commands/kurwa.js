module.exports = {
    name: "kurwa",
    command: true,
    regex: /kurwa/,
    usage: "&kurwa",
    description: "kurwa pierdoli w dupę",
    category: "Zabawa",

    onInvoke: function(context, message){
        message.channel.send("_**`Kurwa, " + message.author.username + " pierdoli w dupę.`**_", {
            files: ["http://rak.bot.nu/assets/kurwa.jpg"]
        });
    }
}