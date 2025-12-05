# twilio-caller

A Node.js application that uses Twilio to make outbound calls and transfer them to another number.

## Prerequisites

- Node.js (v14 or higher recommended)
- pnpm (or npm/yarn)
- A Twilio account with:
  - Account SID
  - Auth Token
  - A Twilio phone number
- A publicly accessible webhook URL (e.g., using ngrok for local development)

## Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```
   Or if using npm:
   ```bash
   npm install
   ```

2. **Configure your Twilio credentials:**
   - Open `index.js`
   - Replace the `accountSid` and `authToken` with your Twilio credentials
   - Update `twilioNumber` with your Twilio phone number
   - Update `customerNumber` with the number you want to call
   - Update `forwardingNumber` with the number to transfer the call to
   - Update `webhookUrl` with your publicly accessible webhook URL

3. **Set up a webhook tunnel (for local development):**
   If running locally, you'll need to expose your local server to the internet. Using ngrok:
   ```bash
   ngrok http 3000
   ```
   Then update the `webhookUrl` in `index.js` with the ngrok URL (e.g., `https://your-ngrok-url.ngrok-free.app/transfer-call`)

## Running the Application

1. **Start the server:**
   ```bash
   node index.js
   ```
   Or with pnpm:
   ```bash
   pnpm start
   ```
   (Note: You may need to add a start script to package.json)

2. The server will:
   - Start listening on port 3000
   - Immediately initiate an outbound call to the customer number
   - When the call is answered, Twilio will fetch TwiML from your webhook URL
   - The call will be transferred to the forwarding number

## Important Notes

- ⚠️ **Security Warning**: The current code has hardcoded credentials. For production, use environment variables:
  ```javascript
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  ```
- Make sure your webhook URL is publicly accessible (Twilio needs to reach it)
- The webhook endpoint `/transfer-call` must be accessible via POST requests