module.exports = {
    name: "andrut",
    command: true,
    regex: /andrut/,
    usage: "&andrut",
    description: "Przemawia do amdupa",
    category: "Zabawa",

    onInvoke: function(context, message){
        var immutable = "a";
        var mutable = "ndrut";
        var substitutes = ["", "a", "b", "c", "d", "e", "f", "i", "l", "m", "n", "o", "p", "r", "s", "u", "w", "v"];
      
        var numberOfSubstitutions = Math.randomRange(1, 2);
      
        for(var i = 0; i < numberOfSubstitutions; i++){
            var place = Math.randomRange(0, (mutable.length - 1));
            var substitute = substitutes[Math.randomRange(0, (substitutes.length - 1))];
          
            var prefix = mutable.substr(0, place - 1);
            var suffix = mutable.substr(place + 1, mutable.length);
          
            mutable = prefix + substitute + suffix;
        }
      
        message.channel.send(immutable + mutable);
    }
};