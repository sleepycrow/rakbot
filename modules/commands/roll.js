module.exports = {
    name: "roll",
    command: true,
    regex: /roll ([0-9])d([0-9]+)/,
    usage: "&roll <il. kości>d<il. oczek>",
    description: "dungeons & dragons",
    category: "Narzędzia",

    onInvoke: function(context, message){
        let matches = message.content.match(this.regex);
        var rolls = [];
        var dice = matches[1];
        var walls = matches[2];
      
        for(var i = 0; i < dice; i++){
            rolls.push(Math.round(Math.random() * (walls - 1) + 1));
        }
      
        message.channel.send("🎲 Wyrzuciłeś " + rolls.join(", ") + "!");
    }
};