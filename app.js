const BootBot = require('bootbot');
const validUrl = require('valid-url');
const req = require("request");

const bot = new BootBot({
    accessToken: 'EAAPN673b2b0BAMRc8Mtt5RYFLfNtytEkdX31eSQTZBDFw97ZCyX1kP4r1thcHNrOA71hfFd5M2ZBkx6iwnZBq3WAE1Q5iuOtlZAQZApKODkJABbvkpiYP2QVyFmOgYzzjklHWSngOFxRSUOIXn2lVAHiANo2UCpcB4EqbNsBE3EEYoMUp4uuLy',
    verifyToken: ':P',
    appSecret: 'a7fd8bc1d354a76982cfb92f7a84f23e'
});
bot.setPersistentMenu([
    { type: 'postback', title: 'Shorten A Link', payload: 'SHORTEN' },
    { type: 'postback', title: 'Get Info About A Link', payload: 'INFO' }
]);
bot.setGreetingText('Shorten links at dwarfish.herokuapp.com');
bot.setGetStartedButton((payload, chat) => {
    chat.say("Let's dwarf 'em all!");
});

bot.on('postback:SHORTEN', (payload, chat) => {
    chat.conversation((convo) => {
        convo.ask("Please send the link to be shortened..", (payload, conv) => {
            const url = payload.message.text;
            if (validUrl.isUri(url)) {
                req.post("https://dwarfish.herokuapp.com/l", { body: { "long_url": url }, json: true, encoding: "utf8" }, (err, res) => {
                    if (err !== null) {
                        conv.say("Something Went Wrong Please Try Again.");
                        convo.end();
                    }
                    const json = res.toJSON().body;
                    if ("error" in json) {
                        conv.say("url doesn't exist");
                        convo.end();
                    }
                    const short = json["short_url"];
                    conv.say("https://dwarfish.herokuapp.com/s/" + short);
                    convo.end();
                });
            } else {
                conv.say("Link sent isn't valid,Try again!");
                convo.end();
            }
        });
    });
});
bot.on("postback:INFO", (payload, chat) => {
    chat.conversation((convo) => {
        convo.ask("Please send the link to be checked..", (payload, conv) => {
            const url = payload.message.text;
            if (validUrl.isUri(url) && url.includes("https://dwarfish.herokuapp.com/s/")) {
                req.get("https://dwarfish.herokuapp.com/i/" + url.replace("https://dwarfish.herokuapp.com/s/", ""), { encoding: "utf8" }, (err, res) => {
                    if (err !== null) {
                        conv.say("Something Went Wrong Please Try Again");
                        convo.end();
                    }
                    const json = JSON.parse(res.toJSON().body);
                    if ("error" in json) {
                        conv.say("url doesn't exist");
                        convo.end();
                    }
                    const long = json["long_url"];
                    const views = json["views"];
                    conv.say("Long Link :" + long + "\nNumber Of Views : " + views);
                    convo.end();
                });
            } else {
                conv.say("Link sent isn't valid,Try again!");
                convo.end();
            }
        });
    });
});
bot.start(process.env.PORT || 8080);