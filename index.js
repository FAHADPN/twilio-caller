const twilio = require('twilio');
const express = require('express');
const app = express();
const VoiceResponse = twilio.twiml.VoiceResponse;

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

const accountSid = 'ACa33***********'; // Replace with your Twilio account SID
const authToken = 'eee1241**********'; // Replace with your Twilio account SID and auth token
console.log('Initializing Twilio client with account SID:', accountSid);
const client = new twilio(accountSid, authToken);

const twilioNumber = '+1**********'; // Your Twilio number
const customerNumber = '+91**********'; // Number you are calling from
const forwardingNumber = '+1**********'; // Number to transfer the call to
const webhookUrl = 'https://9415d3a29bf0.ngrok-free.app/transfer-call'; // Your TwiML webhook URL
console.log('Configured numbers - from:', twilioNumber, 'to(customer):', customerNumber, 'forwarding:', forwardingNumber);
console.log('Using webhook URL:', webhookUrl);

// Enable request body parsing so we can log incoming Twilio parameters
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.send('Twilio Call Server is running');
});

// Webhook to handle call transfer
app.post('/transfer-call', (req, res) => {
    try {
        console.log('Received /transfer-call webhook request');
        console.log('Request method:', req.method, 'URL:', req.originalUrl);
        console.log('Request headers:', {
            'user-agent': req.headers['user-agent'],
            'content-type': req.headers['content-type'],
            'x-twilio-signature': req.headers['x-twilio-signature']
        });
        console.log('Request body params:', req.body);

        const response = new VoiceResponse();
        console.log('Creating TwiML Dial to forwarding number:', forwardingNumber);
        const dial = response.dial();
        dial.number(forwardingNumber);

        const twimlString = response.toString();
        console.log('Generated TwiML response:', twimlString);

        res.type('text/xml');
        res.send(twimlString);
        console.log('Sent TwiML response to Twilio');
    } catch (err) {
        console.error('Error handling /transfer-call webhook:', err && err.message ? err.message : err);
        if (err && err.stack) console.error(err.stack);
        res.status(500).send('Internal Server Error');
    }
});

const PORT = 3000;
let server;

try {
    server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log('Waiting for webhook requests...');
        
        // Initiate the outbound call AFTER server is ready
        console.log('Attempting to create outbound call...');
        client.calls.create({
            to: customerNumber,
            from: twilioNumber,
            url: webhookUrl // Twilio fetches TwiML from here once the call is answered
        }).then(call => {
            console.log(`Call initiated with SID: ${call.sid}`);
            console.log('Call status:', call.status || 'unknown');
            console.log('✓ Server is running and waiting for webhook calls. Press Ctrl+C to stop.');
            console.log('  Waiting for call to be answered and webhook to be triggered...');
        }).catch(error => {
            console.error('Error initiating call:', error && error.message ? error.message : error);
            if (error && error.stack) console.error(error.stack);
            console.log('✓ Server is still running and ready for webhook calls. Press Ctrl+C to stop.');
        });
    });

    // Handle server errors (like port already in use)
    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`\n❌ ERROR: Port ${PORT} is already in use!`);
            console.error('Another instance of this server is likely still running.');
            console.error('\nTo fix this:');
            console.error('1. Find and kill the process using port 3000:');
            console.error('   Windows: netstat -ano | findstr :3000');
            console.error('   Then: taskkill /PID <PID> /F');
            console.error('2. Or change the PORT in index.js to a different port');
            console.error('3. Or simply close the other terminal window running the server\n');
            process.exit(1);
        } else {
            console.error('Server error:', error);
            process.exit(1);
        }
    });
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
