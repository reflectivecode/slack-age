var querystring = require('querystring');
var https = require('https');
var url = require('url');

var token       = process.env.APP_SLACK_TOKEN;
var template_id = process.env.APP_IMGFLIP_TEMPLATE;
var user        = process.env.APP_IMGFLIP_USER;
var pass        = process.env.APP_IMGFLIP_PASS;

exports.handler = (event, context, callback) => {
  var payload = querystring.parse(event.body);
  if (payload.token !== token) throw "auth error";
  console.log(payload);
  
  var texts = split(payload.text);
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
          "fallback": payload.text
        }
      ]
    };
  }).then(response => {
    var options = url.parse(payload.response_url);
    options.method = 'POST';
    options.headers = { 'Content-Type': 'application/json' };
    return httpsRequest(options, JSON.stringify(response));
  }).then(() => {
    return { text: "posted" };
  }).then(value => callback(null, value), err => callback(err));
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

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    var data = "";
    var req = https.request(options, (res) => {
      try {
        res.on('data', (d) => {
          data += d;
        });
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            console.log(data);
            reject(new Error("Response status code: " + res.statusCode + " " + data));
          }
        });
        res.on('error', (err) => {
          reject(err);
        });
      } catch (err) {
        reject(err);
      }
    });
    if (body) {
      req.write(body);
    }
    req.end();
    req.on('error', (err) => {
      reject(err);
    });
  });
}