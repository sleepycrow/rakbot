const Discord = require('discord.js');
const axios = require('axios');
//can't be bothered to add auto ticker downloading, here's a big ass list of ids instead
var tickers = {"BTC":"90","ETH":"80","XRP":"58","USDT":"518","BCH":"2321","LTC":"1","EOS":"2679","BNB":"2710","BCHSV":"33234","XLM":"89","TRX":"2713","ADA":"257","XMR":"28","LEO":"33833","XTZ":"3682","LINK":"2751","ATOM":"33830","NEO":"133","IOTA":"447","MKR":"12377","DASH":"8","ETC":"118","USDC":"33285","VET":"2741","ONT":"32331","NEM":"70","DOGE":"2","CRO":"33819","BAT":"184","ZEC":"134","INB":"33061","DCR":"99","TUSD":"32479","PAX":"33820","HEDG":"33608","ABBC":"33821","SNX":"33723","QTUM":"237","ZRX":"2729","HT":"32351","THR":"32937","REP":"129","CENNZ":"32340","BTG":"285","NANO":"2835","HOT":"32686","OMG":"232","RVN":"32386","VSYS":"33535","SEELE":"32764","KCS":"2750","DGB":"43","LSK":"108","KMD":"139","DAI":"32417","BTM":"2482","KBC":"32847","QNT":"33085","BCD":"32073","BDX":"33389","EKT":"32397","ICX":"3708","BTT":"33391","SC":"183","IOST":"32229","XVG":"102","MCO":"211","WAVES":"113","MONA":"22","BTS":"54","QBIT":"32902","ALGO":"34406","SLV":"34407","MAID":"95","THETA":"32360","NEXO":"32604","MATIC":"33536","HC":"33228","ARDR":"131","RLC":"166","DX":"33071","VEST":"33233","STEEM":"106","FXC":"33562","OKB":"33531","AE":"2731","ZIL":"32334","ENJ":"2581","CHZ":"34391","ZEN":"186","ENG":"2800","NET":"33761","BXK":"34388","SOLVE":"33766","DGTX":"32728","NRG":"32957","SNT":"207","BOTX":"33561","CRPT":"32374","EURS":"32887","GNT":"156","ETN":"2623","NPXS":"32342","VERI":"2698","IGNIS":"4028","RIF":"33764","LA":"2976","ELF":"32226","ZB":"33529","TT":"33913","TNT":"2830","NEW":"33823","EVR":"425","GXS":"2732","XZC":"132","STRAT":"120","NEX":"33548","ELA":"32341","PPT":"2688","AOA":"32801","EDC":"2956","DGD":"111","KNC":"2515","ETP":"2720","BTC2":"33888","FCT":"94","MANA":"258","FET":"33718","BCZERO":"33767","PZM":"2906","REN":"32390","RCN":"264","BRD":"32225","LAMB":"33765","BZ":"32836","LINA":"33145","FTM":"33644","WAN":"32333","ILC":"446","STREAM":"36601","WICC":"32338","NULS":"3667","BHPC":"32883","XMX":"32793","WTC":"2718","AION":"3700","AGVC":"33326","NAS":"2885","LRC":"2781","R":"495","GRIN":"33773","PAI":"32874","RDD":"6","GNY":"33902","ARK":"149","WAX":"32238","MXM":"33106","FUN":"215","DATA":"2765","HYN":"33642","UIP":"32633","QASH":"10689","XAC":"36463","POWR":"269","ODE":"32412","STORJ":"221","MX":"36329","ANT":"180","BHT":"36610","TOMO":"32356","BEAM":"33386","IOTX":"32719","MOAC":"32584","SXDT":"32405","CTXC":"32339","LOOM":"32337","BNT":"200","ULT":"33801","DAG":"32794","ATP":"33564","SAN":"2866","BHP":"33645","MBC":"33602","EVN":"32387","LOKI":"32729","GNO":"167","MAN":"4012","ORBS":"33824","ABT":"32350","MTL":"219","LEND":"32085","GRS":"18","PIVX":"103","VITAE":"32904","CSC":"1686","BTU":"33717","VTC":"3","CELR":"33772","BQTX":"33849","ROX":"33146"};

module.exports = {
    name: "krypto",
    command: true,
    regex: /krypto ([A-Za-z0-9]+)/,
    usage: "&krypto [znak waluty]",
    description: "Wysyła jakieś tam info o krypto",
    category: "Narzędzia",

    onInvoke: function(ctx, message){
        message.channel.startTyping();

        let currency = message.content.match(this.regex)[1];

        if(!currency || !tickers[currency.toUpperCase()]){
            message.channel.stopTyping();
            ctx.utils.sendError({errMsg: "Nie znam takiej waluty."}, message.channel);
            return;
        }

        axios.get("https://api.coinlore.com/api/ticker/?id=" + tickers[currency.toUpperCase()])
        .then(resp => {
            let info = resp.data[0];
            message.channel.send(new Discord.RichEmbed({
                title: "💹 " + info.name + " (" + info.symbol + ")",
                description: "**Aktualna cena**: " + info.price_usd + " USD / " + info.price_btc + " BTC\n"
                    +"**Zmiana w ciągu ostatnich 24h**: " + info.percent_change_24h + "%\n"
                    +"**Zmiana w ciągu ostatnich 7d**: " + info.percent_change_7d + "%"
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