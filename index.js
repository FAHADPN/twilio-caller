const twilio = require('twilio');
const express = require('express');
const app = express();
const VoiceResponse = twilio.twiml.VoiceResponse;

const accountSid = 'ACXXXXXXXXXXXXXXXX'; // Replace with your Twilio account SID
const authToken = 'your_auth_token'; // Replace with your Twilio account SID and auth token
const client = new twilio(accountSid, authToken);
const twilioNumber = '+1------'; // Your Twilio number
const customerNumber = '+91------'; // Number you are calling
const forwardingNumber = '+1--------'; // Number to transfer the call to
const webhookUrl = 'https://ddbb-27-62-69-24.ngrok-free.app/transfer-call'; // Your TwiML webhook URL

// Initiate the outbound call
client.calls.create({
    to: customerNumber,
    from: twilioNumber,
    url: webhookUrl // Twilio fetches TwiML from here once the call is answered
}).then(call => console.log(`Call initiated with SID: ${call.sid}`))
.catch(error => console.error(error));

// Webhook to handle call transfer
app.post('/transfer-call', (req, res) => {
    const response = new VoiceResponse();
    const dial = response.dial();
    dial.number(forwardingNumber);
    res.type('text/xml');
    res.send(response.toString());
});

app.listen(5000, () => console.log('Server running on port 5000'));
