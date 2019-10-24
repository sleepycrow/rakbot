const axios = require('axios');
const Discord = require('discord.js');

module.exports = {
    name: "zerotier",
    command: true,
    regex: /zerotier/,
    usage: "&zerotier",
    description: "Wysyła wewnętrzne IP grupy 'pedaly' na ZeroTier.",
    category: "Narzędzia",

    onInvoke: function(ctx, message){
        message.channel.startTyping();
        axios.get("https://my.zerotier.com/api/network/" + process.env.ZEROTIER_GROUP_ID + "/member", {
            headers: {"Authorization": "bearer " + process.env.ZEROTIER_API_KEY}
        })
        .then(resp => {
            let members = resp.data;
            var output = "";

            for(var i = 0; i < members.length; i++){
                if(members[i].config.ipAssignments && members[i].config.ipAssignments[0]){
                    let name = members[i].id;
                    if(members[i].name) name = members[i].name;
                    let ip = members[i].config.ipAssignments[0];

                    output += name + " - " + ip + "\n";
                }
            }

            message.channel.send(new Discord.RichEmbed({
                title: "Członkowie grupy 'pedaly' (" + process.env.ZEROTIER_GROUP_ID + ") na ZeroTier",
                description: output
            }));
        })
        .catch(err => {
            ctx.utils.sendError(err, message.channel);
        })
        .then(() => {
            message.channel.stopTyping();
        });
      }
  };