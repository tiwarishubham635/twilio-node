var Twilio = require("../lib");
const crypto = require("crypto");

var accountSid = process.env.TWILIO_ACCOUNT_SID;
var token = process.env.TWILIO_AUTH_TOKEN;
var phoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Check if we have real credentials
var hasRealCredentials = accountSid && 
                        token &&
                        accountSid.startsWith('AC');

// Uncomment the following line to specify a custom CA bundle for HTTPS requests:
// process.env.TWILIO_CA_BUNDLE = '/path/to/cert.pem';
// You can also set this as a regular environment variable outside of the code

console.log("=== Twilio Public Key Client Validation (PKCV) Example ===\n");

if (!hasRealCredentials) {
  console.log("⚠ Demo Mode: This example requires valid Twilio credentials to run.");
  console.log("⚠ Please set the following environment variables:");
  console.log("  - TWILIO_ACCOUNT_SID (must start with 'AC')");
  console.log("  - TWILIO_AUTH_TOKEN");
  console.log("  - TWILIO_PHONE_NUMBER (optional, for message filtering)");
  console.log("\n📖 Example setup:");
  console.log("  export TWILIO_ACCOUNT_SID='ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'");
  console.log("  export TWILIO_AUTH_TOKEN='your_auth_token'");
  console.log("  export TWILIO_PHONE_NUMBER='+12345678901'");
  console.log("\n💡 The code examples below show the PKCV usage patterns:\n");
} else {
  console.log("✅ Using real Twilio credentials for PKCV demo");
}

if (hasRealCredentials) {
  // Generate public and private key pair
  console.log("🔑 Generating RSA key pair...");
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  // Create a default rest client
  var client = new Twilio(accountSid, token);

  console.log("📤 Submitting public key to Twilio...");
  // Submit the public key using the default client
  client.accounts.v1.credentials.publicKey
    .create({
      friendlyName: "Public Key",
      publicKey: publicKey,
    })
    .then((key) => {
      console.log("✅ Public key created successfully");
      
      // Create a new signing key using the default client
      console.log("🔐 Creating signing key...");
      client.newSigningKeys.create().then((signingKey) => {
        console.log("✅ Signing key created successfully");
        
        // Switch to the Validation Client to validate API calls
        console.log("🔒 Setting up validation client...");
        const validationClient = new Twilio(signingKey.sid, signingKey.secret, {
          accountSid: accountSid,
          validationClient: {
            accountSid: accountSid,
            credentialSid: key.sid,
            signingKey: signingKey.sid,
            privateKey: privateKey,
            algorithm: "PS256", // Validation client supports RS256 or PS256 algorithm. Default is RS256.
          },
        });
        validationClient.setAccountSid(accountSid);

        console.log("📱 Making validated API request...");
        const listOptions = { limit: 10 };
        if (phoneNumber) {
          listOptions.from = phoneNumber;
        }
        
        validationClient.messages
          .list(listOptions)
          .then((messages) => {
            console.log("✅ Validated API request successful!");
            console.log(`Found ${messages.length} messages`);
            messages.forEach(msg => console.log(`Message SID: ${msg.sid}`));
          })
          .catch((err) => {
            console.error("❌ Error making validated API request:", err.message);
          });
      }).catch((err) => {
        console.error("❌ Error creating signing key:", err.message);
      });
    })
    .catch((err) => {
      console.error("❌ Error creating public key:", err.message);
    });
} else {
  console.log("🔑 PKCV usage examples:");
  console.log("// 1. Generate RSA key pair");
  console.log("const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {");
  console.log("  modulusLength: 2048,");
  console.log("  publicKeyEncoding: { type: 'spki', format: 'pem' },");
  console.log("  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }");
  console.log("});");
  console.log("");
  console.log("// 2. Submit public key to Twilio");
  console.log("client.accounts.v1.credentials.publicKey.create({");
  console.log("  friendlyName: 'Public Key',");
  console.log("  publicKey: publicKey");
  console.log("});");
  console.log("");
  console.log("// 3. Create signing key");
  console.log("client.newSigningKeys.create()");
  console.log("");
  console.log("// 4. Set up validation client");
  console.log("const validationClient = new Twilio(signingKey.sid, signingKey.secret, {");
  console.log("  accountSid: accountSid,");
  console.log("  validationClient: {");
  console.log("    accountSid: accountSid,");
  console.log("    credentialSid: key.sid,");
  console.log("    signingKey: signingKey.sid,");
  console.log("    privateKey: privateKey,");
  console.log("    algorithm: 'PS256'");
  console.log("  }");
  console.log("});");
  console.log("");
}
