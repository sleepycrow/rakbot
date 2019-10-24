const fs = require('fs');

module.exports = {
    name: "linux",

    onMessage: function(context, message){
        if(message.author != context.client.user){
          if(message.content.match(/gnu/ig) != null){
                fs.readFile('./assets/gnu_copypasta.txt', (err, data) => {
                    if(!err){
                        data = data.toString();

                        for(var i = 0; i < data.length; i += 2000){
                            message.channel.send(data.substr(i, 2000));
                        }
                    }
                });
            }else if(message.content.match(/linu(x|ks)(a|y)?/ig) != null){
                fs.readFile('./assets/linux_copypasta.txt', (err, data) => {
                    if(!err){
                        data = data.toString();

                        for(var i = 0; i < data.length; i += 2000){
                            message.channel.send(data.substr(i, 2000));
                        }
                    }
                });
            }
        }
    }
};