const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 9000;

// Twilio credentials from Render environment variables
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE;

const server = http.createServer((req, res) => {
    // CORS for Netlify frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Health check endpoint
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', service: 'JEE Connect SMS Server' }));
        return;
    }

    if (req.method === 'POST' && req.url === '/send-sms') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);

                // Format phone number
                let to = data.to.replace(/\s/g, '');
                if (to.length === 10 && !to.startsWith('+')) {
                    to = '+91' + to;
                }

                // Extract Twilio credentials from request body (optional fallback) or environment variables
                const activeSid = data.twilioSid || TWILIO_SID;
                const activeToken = data.twilioToken || TWILIO_TOKEN;
                const activePhone = data.twilioPhone || TWILIO_PHONE;

                console.log(`[SMS] Sending to: ${to}`);

                // If Twilio not configured, simulate success
                if (!activeSid || activeSid.startsWith('YOUR_')) {
                    console.warn('[SMS] Twilio not configured. Simulating...');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true, message: 'Simulated SMS' }));
                    return;
                }

                // Send via Twilio
                const postData = new URLSearchParams({
                    To: to,
                    From: activePhone,
                    Body: data.message
                }).toString();

                const options = {
                    hostname: 'api.twilio.com',
                    port: 443,
                    path: `/2010-04-01/Accounts/${activeSid}/Messages.json`,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Content-Length': postData.length,
                        'Authorization': 'Basic ' + Buffer.from(activeSid + ':' + activeToken).toString('base64')
                    }
                };

                const twilioReq = https.request(options, (twilioRes) => {
                    let result = '';
                    twilioRes.on('data', d => { result += d; });
                    twilioRes.on('end', () => {
                        console.log(`[SMS] Twilio Status: ${twilioRes.statusCode}`);
                        if (twilioRes.statusCode >= 400) {
                            console.error(`[SMS] Error: ${result}`);
                        }
                        res.writeHead(twilioRes.statusCode, { 'Content-Type': 'application/json' });
                        res.end(result);
                    });
                });

                twilioReq.on('error', (e) => {
                    console.error('[SMS] Error:', e.message);
                    res.writeHead(500);
                    res.end(JSON.stringify({ success: false, error: e.message }));
                });

                twilioReq.write(postData);
                twilioReq.end();

            } catch (e) {
                console.error('[SMS] Parse error:', e.message);
                res.writeHead(400);
                res.end(JSON.stringify({ success: false, error: 'Invalid JSON' }));
            }
        });
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
    }
});

server.listen(PORT, () => {
    console.log(`🚀 JEE Connect SMS Server running on port ${PORT}`);
});
