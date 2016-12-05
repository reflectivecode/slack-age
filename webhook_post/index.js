var querystring = require('querystring');
var https = require('https');

var token       = process.env.APP_SLACK_TOKEN;
var template_id = process.env.APP_IMGFLIP_TEMPLATE;
var user        = process.env.APP_IMGFLIP_USER;
var pass        = process.env.APP_IMGFLIP_PASS;

var responses = {
  "1":  "Yes",
  "2":  "No",
  "3":  "Food please",
  "4":  "Wood please",
  "5":  "Gold please",
  "6":  "Stone please",
  "7":  "Ahh!",
  "8":  "All hail, king of the losers!",
  "9":  "Ooh!",
  "10": "I'll beat you back to Age of Empires",
  "12": "Ah! Being rushed!",
  "13": "Sure, blame it on your ISP",
  "14": "Start the game already!",
  "15": "Don't point that thing at me!",
  "16": "Enemy sighted!",
  "17": "It is good to be the king",
  "18": "Monk! I need a monk!",
  "19": "Long time, no siege",
  "20": "My granny could scrap better than that",
  "21": "Nice town, I'll take it",
  "22": "Quit touching me!",
  "23": "Raiding party!",
  "24": "Dadgum",
  "25": "Eh, smite me",
  "26": "The wonder, the wonder, the... no!",
  "27": "You played two hours to die like this?",
  "28": "Yeah, well, you should see the other guy",
  "29": "Roggan",
  "30": "Wololo",
  "31": "Attack an enemy now",
  "32": "Cease creating extra villagers",
  "33": "Create extra villagers",
  "34": "Build a navy",
  "35": "Stop building a navy",
  "36": "Wait for my signal to attack",
  "37": "Build a wonder",
  "38": "Give me your extra resources",
  "42": "What age are you in?"
};

exports.handler = (event, context, callback) => {
  var payload = querystring.parse(event.body);
  if (payload.token !== token) throw "auth error";
  console.log(payload);
  if (payload.text.toUpperCase().trim() === "HELP" || payload.text.trim().length === 0) {
    var allMessages = "";
    Object.keys(responses).forEach(key => {
        allMessages += "\r" + key + " → " + responses[key];
    });
    callback(null, {
      "response_type": "ephemeral",
      "text": "Creates an Age of Empires meme photo. Enter one of the numbers below or enter your own custom text.",
      "attachments": [
        {
          "text": allMessages
        }
      ]
    });
  } else {
    var message = responses.hasOwnProperty(payload.text) ? responses[payload.text] : payload.text;
    var texts = split(message);
    var options = {
      host: 'api.imgflip.com',
      port: 443,
      method: 'POST',
      path: '/caption_image?' + querystring.stringify({
        "template_id": template_id,
        "username": user,
        "password": pass,
        "text0": texts.text0,
        "text1": texts.text1
      })
    };
    
    httpsRequest(options).then(json => {
      var response = JSON.parse(json);
      if (!response.success) {
        throw new Error(response.error_message);
      }
      return {
        "response_type": "in_channel",
        "attachments": [
          {
            "image_url": response.data.url,
            "fallback": message
          }
        ]
      };
    }).then(value => callback(null, value), err => callback(err));
  }
};

var semicolonRegex = /^\s*(.*?)\s*;\s*(.*?)\s*$/;
var periodRegex = /^\s*(.*?\.)\s+(.*?)\s*$/;

function split(text) {
  var match1 = semicolonRegex.exec(text);
  if (match1) {
    return {
      text0: match1[1],
      text1: match1[2]
    };
  }
  var match2 = periodRegex.exec(text);
  if (match2) {
    return {
      text0: match2[1],
      text1: match2[2]
    };
  }
  text = text.trim();
  var middle = Math.ceil(text.length / 2);
  while (middle > 0) {
    if (text[middle] === ' ') {
      return {
        text0: text.substr(0, middle).trim(),
        text1: text.substr(middle + 1).trim()
      };
    }
    if (text[text.length - middle] === ' ') {
      return {
        text0: text.substr(0, text.length - middle).trim(),
        text1: text.substr(text.length - middle + 1).trim()
      };
    }
    middle -= 1;
  }
  return {
    text0: "",
    text1: text
  };
}

function httpsRequest(options) {
  return new Promise((resolve, reject) => {
    var data = "";
    var req = https.request(options, (res) => {
      try {
        if (res.statusCode !== 200) {
          throw new Error("Response status code: " + res.statusCode);
        }
        res.on('data', (d) => {
          data += d;
        });
        res.on('end', () => {
          resolve(data);
        });
        res.on('error', (err) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
    req.end();
    req.on('error', (err) => {
      reject(err);
    });
  });
}