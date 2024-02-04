const templateId = '58512784';

const presets = {
  "1": "Yes",
  "2": "No",
  "3": "Food please",
  "4": "Wood please",
  "5": "Gold please",
  "6": "Stone please",
  "7": "Ahh!",
  "8": "All hail, king of the losers!",
  "9": "Ooh!",
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

export default {
  async fetch(request, env, context) {
    const payload = await parseSlackRequest(request, env);
    const { text } = payload;

    if (text.toUpperCase().trim() === 'HELP' || text.trim().length === 0) {
      return respondWithHelp();
    } else {
      return await respondWithImage(env, text);
    }
  },
};


async function parseSlackRequest(request, env) {
  const slackToken = env.APP_SLACK_TOKEN;
  const slackSigningSecret = env.APP_SLACK_SIGNING_SECRET;

  const blob = await request.blob();
  const text = await blob.text();
  console.log({ requestBody: text });

  if (!await verifySlackRequest(slackSigningSecret, request.headers, text)) {
    return new Response('invalid signature', { status: 401 });
  }

  const payload = new URLSearchParams(text);
  if (payload.get('token') !== slackToken) {
    return new Response('invalid token', { status: 401 });
  }

  return Object.fromEntries(payload);
}

async function verifySlackRequest(signingSecret, requestHeaders, requestBody) {
  const timestampHeader = requestHeaders.get('x-slack-request-timestamp');
  if (!timestampHeader) {
    return false;
  }

  const fiveMinutesAgoSeconds = Math.floor(Date.now() / 1000) - 60 * 5;
  if (Number.parseInt(timestampHeader) < fiveMinutesAgoSeconds) {
    return false;
  }

  const signatureHeader = requestHeaders.get('x-slack-signature');
  if (!signatureHeader) {
    return false;
  }

  const textEncoder = new TextEncoder();
  return await crypto.subtle.verify(
    'HMAC',
    await crypto.subtle.importKey('raw', textEncoder.encode(signingSecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']),
    fromHexStringToBytes(signatureHeader.substring(3)), textEncoder.encode(`v0:${timestampHeader}:${requestBody}`)
  );
}

function fromHexStringToBytes(hexString) {
  const bytes = new Uint8Array(hexString.length / 2);
  for (let idx = 0; idx < hexString.length; idx += 2) {
    bytes[idx / 2] = parseInt(hexString.substring(idx, idx + 2), 16);
  }
  return bytes.buffer;
}

function respondWithHelp() {
  let allPresets = '';
  Object.keys(presets).forEach(key => {
    allPresets += '\r' + key + ' → ' + presets[key];
  });

  return makeResponse({
    response_type: 'ephemeral',
    text: 'Creates an Age of Empires meme photo. Enter one of the numbers below or enter your own custom text.',
    attachments: [
      {
        text: allPresets
      }
    ]
  });
}

async function respondWithImage(env, text) {
  const message = presets.hasOwnProperty(text) ? presets[text] : text;
  const texts = split(message);
  const imageUrl = await captionImage(env, templateId, texts.text0, texts.text1);

  return makeResponse({
    response_type: 'in_channel',
    attachments: [
      {
        image_url: imageUrl,
        fallback: message
      }
    ]
  });
}

const semicolonRegex = /^\s*(.*?)\s*;\s*(.*?)\s*$/;
const periodRegex = /^\s*(.*?\.)\s+(.*?)\s*$/;

function split(text) {
  const match1 = semicolonRegex.exec(text);
  if (match1) {
    return {
      text0: match1[1],
      text1: match1[2]
    };
  }
  const match2 = periodRegex.exec(text);
  if (match2) {
    return {
      text0: match2[1],
      text1: match2[2]
    };
  }
  text = text.trim();
  let middle = Math.ceil(text.length / 2);
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
    text0: '',
    text1: text
  };
}

async function captionImage(env, template_id, text0, text1) {
  const username = env.APP_IMGFLIP_USER;
  const password = env.APP_IMGFLIP_PASS;

  const response = await fetch('https://api.imgflip.com/caption_image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      template_id,
      text0,
      text1,
      username,
      password,
    })
  });

  const json = await response.json();
  if (!json.success) {
    throw new Error(json.error_message);
  }

  return json.data.url;
}

function makeResponse(json) {
  return new Response(JSON.stringify(json), {
    headers: {
      'content-type': 'application/json;charset=UTF-8',
    },
  });
}
