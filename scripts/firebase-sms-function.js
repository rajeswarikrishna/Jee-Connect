const functions = require('firebase-functions');
const https = require('https');

// --- 🛠️ SETUP INSTRUCTIONS ---
// 1. Initialize Firebase Functions in your project: `firebase init functions` (Select JavaScript)
// 2. Replace the contents of `functions/index.js` with this file.
// 3. Set your Twilio credentials in the Firebase environment:
//    firebase functions:config:set twilio.sid="YOUR_SID" twilio.token="YOUR_TOKEN" twilio.phone="YOUR_PHONE"
// 4. Deploy your function: `firebase deploy --only functions`

exports.sendParentSMS = functions.https.onRequest((req, res) => {
    // 1. Enable CORS for web apps (Netlify)
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    // 2. Load Twilio credentials from Firebase Config
    const TWILIO_SID = functions.config().twilio?.sid;
    const TWILIO_TOKEN = functions.config().twilio?.token;
    const TWILIO_PHONE = functions.config().twilio?.phone;

    // Simulate success if Twilio isn't set up yet
    if (!TWILIO_SID || TWILIO_SID.startsWith('YOUR_')) {
        console.warn('Twilio not configured. Simulating success...');
        res.status(200).json({ success: true, message: 'Simulated SMS via Firebase' });
        return;
    }

    // 3. Format phone number and prepare data
    let to = req.body.to.replace(/\s/g, '');
    if (to.length === 10 && !to.startsWith('+')) {
        to = '+91' + to; // Default to India country code
    }

    const postData = new URLSearchParams({
        To: to,
        From: TWILIO_PHONE,
        Body: req.body.message
    }).toString();

    const options = {
        hostname: 'api.twilio.com',
        port: 443,
        path: `/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
            'Authorization': 'Basic ' + Buffer.from(TWILIO_SID + ':' + TWILIO_TOKEN).toString('base64')
        }
    };

    // 4. Send request to Twilio API
    const twilioReq = https.request(options, (twilioRes) => {
        let result = '';
        twilioRes.on('data', d => { result += d; });
        twilioRes.on('end', () => {
            if (twilioRes.statusCode >= 400) {
                console.error(`[Twilio Error] ${result}`);
                res.status(twilioRes.statusCode).json({ success: false, error: 'Twilio rejected request' });
            } else {
                res.status(200).json({ success: true, sid: JSON.parse(result).sid });
            }
        });
    });

    twilioReq.on('error', (e) => {
        console.error('[SMS Error]', e.message);
        res.status(500).json({ success: false, error: e.message });
    });

    twilioReq.write(postData);
    twilioReq.end();
});
