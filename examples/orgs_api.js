"use strict";
var Twilio = require("../lib");

const clientId = process.env.ORGS_CLIENT_ID;
const clientSecret = process.env.ORGS_CLIENT_SECRET;
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const organizationSid = process.env.TWILIO_ORG_SID;

// Check if we have all required credentials
const hasAllCredentials = clientId && 
                         clientSecret && 
                         accountSid && 
                         organizationSid &&
                         accountSid.startsWith('AC');

console.log("=== Twilio Organizations API Example ===\n");

if (!hasAllCredentials) {
  console.log("⚠ Demo Mode: This example requires valid Twilio Organizations credentials to run.");
  console.log("⚠ Please set the following environment variables:");
  console.log("  - ORGS_CLIENT_ID");
  console.log("  - ORGS_CLIENT_SECRET");
  console.log("  - TWILIO_ACCOUNT_SID (must start with 'AC')");
  console.log("  - TWILIO_ORG_SID");
  console.log("\n📖 Example setup:");
  console.log("  export ORGS_CLIENT_ID='your_client_id'");
  console.log("  export ORGS_CLIENT_SECRET='your_client_secret'");
  console.log("  export TWILIO_ACCOUNT_SID='ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'");
  console.log("  export TWILIO_ORG_SID='ORG_SID_HERE'");
  console.log("\n💡 The code examples below show the usage patterns:\n");
} else {
  console.log("✅ Using real Twilio Organizations credentials");
}

if (hasAllCredentials) {
  const orgsCredentialProvider = new Twilio.OrgsCredentialProviderBuilder()
    .setClientId(clientId)
    .setClientSecret(clientSecret)
    .build();

  const client = new Twilio();
  client.setCredentialProvider(orgsCredentialProvider);
  client.setAccountSid(accountSid);

  console.log("📋 Listing organization accounts...");
  client.previewIam
    .organization(organizationSid)
    .accounts.list()
    .then((accounts) => {
      console.log("Organization accounts:", accounts);
    })
    .catch((error) => {
      console.error("Error listing accounts:", error.message);
    });

  console.log("📋 Fetching specific account...");
  client.previewIam
    .organization(organizationSid)
    .accounts(accountSid)
    .fetch()
    .then((account) => {
      console.log("Account details:", account);
    })
    .catch((error) => {
      console.error("Error fetching account:", error.message);
    });
} else {
  console.log("📋 Organizations API usage examples:");
  console.log("// Set up organizations credential provider");
  console.log("const orgsCredentialProvider = new Twilio.OrgsCredentialProviderBuilder()");
  console.log("  .setClientId(clientId)");
  console.log("  .setClientSecret(clientSecret)");
  console.log("  .build();");
  console.log("");
  console.log("// Configure client");
  console.log("const client = new Twilio();");
  console.log("client.setCredentialProvider(orgsCredentialProvider);");
  console.log("client.setAccountSid(accountSid);");
  console.log("");
  console.log("// List organization accounts");
  console.log("client.previewIam");
  console.log("  .organization(organizationSid)");
  console.log("  .accounts.list()");
  console.log("  .then(accounts => console.log(accounts))");
  console.log("  .catch(error => console.error(error.message));");
  console.log("");
}
