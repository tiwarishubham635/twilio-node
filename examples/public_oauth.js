var Twilio = require("../lib");

const clientId = process.env.OAUTH_CLIENT_ID;
const clientSecret = process.env.OAUTH_CLIENT_SECRET;
const accountSid = process.env.TWILIO_ACCOUNT_SID;

// Check if we have all required credentials
const hasAllCredentials = clientId && 
                         clientSecret && 
                         accountSid &&
                         accountSid.startsWith('AC');

console.log("=== Twilio Public OAuth Example ===\n");

if (!hasAllCredentials) {
  console.log("⚠ Demo Mode: This example requires valid OAuth credentials to run.");
  console.log("⚠ Please set the following environment variables:");
  console.log("  - OAUTH_CLIENT_ID");
  console.log("  - OAUTH_CLIENT_SECRET");
  console.log("  - TWILIO_ACCOUNT_SID (must start with 'AC')");
  console.log("\n📖 Example setup:");
  console.log("  export OAUTH_CLIENT_ID='your_oauth_client_id'");
  console.log("  export OAUTH_CLIENT_SECRET='your_oauth_client_secret'");
  console.log("  export TWILIO_ACCOUNT_SID='ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'");
  console.log("\n💡 The code examples below show the OAuth usage patterns:\n");
} else {
  console.log("✅ Using real OAuth credentials");
}

if (hasAllCredentials) {
  const clientCredentialProvider = new Twilio.ClientCredentialProviderBuilder()
    .setClientId(clientId)
    .setClientSecret(clientSecret)
    .build();

  const client = new Twilio();
  client.setCredentialProvider(clientCredentialProvider);
  client.setAccountSid(accountSid);

  const messageId = "SMXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
  console.log(`📱 Fetching message ${messageId}...`);
  client
    .messages(messageId)
    .fetch()
    .then((message) => {
      console.log("✅ Message fetched successfully:");
      console.log("Message SID:", message.sid);
      console.log("Body:", message.body);
      console.log("Status:", message.status);
    })
    .catch((error) => {
      console.error("❌ Error fetching message:", error.message);
      if (error.code === 20404) {
        console.log("💡 Note: Update the messageId variable with a real message SID");
      }
    });
} else {
  console.log("🔐 OAuth client credentials flow examples:");
  console.log("// 1. Set up OAuth credential provider");
  console.log("const clientCredentialProvider = new Twilio.ClientCredentialProviderBuilder()");
  console.log("  .setClientId(clientId)");
  console.log("  .setClientSecret(clientSecret)");
  console.log("  .build();");
  console.log("");
  console.log("// 2. Configure client with OAuth");
  console.log("const client = new Twilio();");
  console.log("client.setCredentialProvider(clientCredentialProvider);");
  console.log("client.setAccountSid(accountSid);");
  console.log("");
  console.log("// 3. Use client to make API calls");
  console.log("client.messages(messageId).fetch()");
  console.log("  .then(message => console.log(message))");
  console.log("  .catch(error => console.error(error.message));");
  console.log("");
}
