var Twilio = require("../lib");

var accountSid = process.env.TWILIO_ACCOUNT_SID;
var token = process.env.TWILIO_AUTH_TOKEN;

// Check if we have real credentials
var hasRealCredentials = accountSid && 
                        token &&
                        accountSid.startsWith('AC');

// Uncomment the following line to specify a custom CA bundle for HTTPS requests:
// process.env.TWILIO_CA_BUNDLE = '/path/to/cert.pem';
// You can also set this as a regular environment variable outside of the code

console.log("=== Twilio Node.js Helper Library Examples ===\n");

if (!hasRealCredentials) {
  console.log("⚠ Demo Mode: This example requires valid Twilio credentials to run.");
  console.log("⚠ Please set the following environment variables:");
  console.log("  - TWILIO_ACCOUNT_SID (must start with 'AC')");
  console.log("  - TWILIO_AUTH_TOKEN");
  console.log("  - FROM_NUMBER (your Twilio phone number)");
  console.log("  - TO_NUMBER (destination phone number)");
  console.log("\n📖 Example setup:");
  console.log("  export TWILIO_ACCOUNT_SID='ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'");
  console.log("  export TWILIO_AUTH_TOKEN='your_auth_token'");
  console.log("  export FROM_NUMBER='+12345678901'");
  console.log("  export TO_NUMBER='+12345678901'");
  console.log("\n💡 The code examples below show the usage patterns:\n");
} else {
  console.log("✅ Using real Twilio credentials");
}

var twilio = hasRealCredentials ? new Twilio(accountSid, token) : null;

if (hasRealCredentials) {
  var i = 0;
  // Callback as second parameter
  console.log("📞 Listing calls with callbacks...");
  twilio.calls.each({
    pageSize: 7,
    callback: function (call, done) {
      console.log(call.sid);
      i++;
      if (i === 10) {
        done();
      }
    },
    done: function (error) {
      console.log("je suis fini");
      console.log(error);
    },
  });

  // Callback as first parameter
  console.log("📞 Listing calls with simple callback...");
  twilio.calls.each(function (call) {
    console.log(call.sid);
  });
} else {
  console.log("📞 Call listing examples:");
  console.log("// List calls with pagination callback");
  console.log("twilio.calls.each({");
  console.log("  pageSize: 7,");
  console.log("  callback: function (call, done) {");
  console.log("    console.log(call.sid);");
  console.log("    // Process each call");
  console.log("  },");
  console.log("  done: function (error) {");
  console.log("    console.log('Finished processing calls');");
  console.log("  }");
  console.log("});");
  console.log("");
}

var from = process.env.FROM_NUMBER;
var to = process.env.TO_NUMBER;

// Check if phone numbers are configured
var hasPhoneNumbers = from && to;

if (hasRealCredentials && hasPhoneNumbers) {
  console.log("📱 Sending messages...");
  
  // Send message using callback
  twilio.messages.create(
    {
      from: from,
      to: to,
      body: "create using callback",
    },
    function (err, result) {
      if (err) {
        console.error("Error sending message with callback:", err.message);
      } else {
        console.log("Created message using callback");
        console.log(result.sid);
      }
    }
  );

  // Send message using promise
  var promise = twilio.messages.create({
    from: from,
    to: to,
    body: "create using promises",
  });
  promise.then(function (message) {
    console.log("Created message using promises");
    console.log(message.sid);
  }).catch(function (error) {
    console.error("Error sending message with promises:", error.message);
  });
} else {
  console.log("📱 Message creation examples:");
  if (!hasRealCredentials) {
    console.log("// Requires TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN");
  }
  if (!hasPhoneNumbers) {
    console.log("// Requires FROM_NUMBER and TO_NUMBER environment variables");
  }
  console.log("// Send message using callback");
  console.log("twilio.messages.create({");
  console.log("  from: '+12345678901',  // Your Twilio number");
  console.log("  to: '+12345678901',    // Destination number");
  console.log("  body: 'Hello from Twilio!'");
  console.log("}, function (err, result) {");
  console.log("  if (err) {");
  console.log("    console.error('Error:', err.message);");
  console.log("  } else {");
  console.log("    console.log('Message SID:', result.sid);");
  console.log("  }");
  console.log("});");
  console.log("");
  console.log("// Send message using promises");
  console.log("twilio.messages.create({");
  console.log("  from: '+12345678901',");
  console.log("  to: '+12345678901',");
  console.log("  body: 'Hello from Twilio!'");
  console.log("}).then(function (message) {");
  console.log("  console.log('Message SID:', message.sid);");
  console.log("}).catch(function (error) {");
  console.log("  console.error('Error:', error.message);");
  console.log("});");
  console.log("");
}

if (hasRealCredentials) {
  console.log("📡 SIP Trunking examples...");
  
  // Create sip trunk using callback as first parameter
  twilio.trunking.v1.trunks.create(function (err, result) {
    if (err) {
      console.error("Error creating default trunk:", err.message);
    } else {
      console.log("Created default trunk");
      console.log(result.sid);
    }
  });

  // Create sip trunk using callback as second parameter
  twilio.trunking.v1.trunks.create(
    {
      friendlyName: "sip trunking",
    },
    function (err, result) {
      if (err) {
        console.error("Error creating trunk with friendly name:", err.message);
      } else {
        console.log("Created trunk with friendly name");
        console.log(result.sid);
        console.log(result.friendlyName);
      }
    }
  );

  promise = twilio.trunking.v1.trunks.create({
    friendlyName: "promise trunking",
  });
  promise.then(function (trunk) {
    console.log("Created trunk with friendly name and promises");
    console.log(trunk.sid);
    console.log(trunk.friendlyName);
  }).catch(function (error) {
    console.error("Error creating trunk with promises:", error.message);
  });
} else {
  console.log("📡 SIP Trunking examples:");
  console.log("// Create trunk with callback");
  console.log("twilio.trunking.v1.trunks.create({");
  console.log("  friendlyName: 'My SIP Trunk'");
  console.log("}, function (err, result) {");
  console.log("  if (err) {");
  console.log("    console.error('Error:', err.message);");
  console.log("  } else {");
  console.log("    console.log('Trunk SID:', result.sid);");
  console.log("  }");
  console.log("});");
  console.log("");
}

var trunkSid = "TK7e37e59861c14bb80dde245cfaad5522";

if (hasRealCredentials) {
  // Fetch trunk sid using callback
  twilio.trunking.v1.trunks(trunkSid).fetch(function (err, result) {
    if (err) {
      console.error("Error fetching trunk:", err.message);
    } else {
      console.log("Fetch trunk using callback");
      console.log(result.sid);
    }
  });

  // Fetch trunk using promise
  promise = twilio.trunking.v1.trunks(trunkSid).fetch();
  promise.then(function (trunk) {
    console.log("Fetch trunk using promise");
    console.log(trunk.sid);
  }).catch(function (error) {
    console.error("Error fetching trunk with promises:", error.message);
  });

  // Update trunk using callback
  twilio.trunking.v1.trunks(trunkSid).update(
    {
      friendlyName: "callback trunk",
    },
    function (err, result) {
      if (err) {
        console.error("Error updating trunk:", err.message);
      } else {
        console.log("Updated using callbacks");
        console.log(result.sid);
        console.log(result.friendlyName);
      }
    }
  );

  // Update trunk using promise
  promise = twilio.trunking.v1.trunks(trunkSid).update({
    friendlyName: "promise trunk",
  });
  promise.then(function (trunk) {
    console.log("Updated trunk with friendly name and promises");
    console.log(trunk.sid);
    console.log(trunk.friendlyName);
  }).catch(function (error) {
    console.error("Error updating trunk with promises:", error.message);
  });
} else {
  console.log("// Fetch trunk by SID");
  console.log("twilio.trunking.v1.trunks('TK...').fetch()");
  console.log("  .then(trunk => console.log(trunk.sid))");
  console.log("  .catch(error => console.error(error.message));");
  console.log("");
  console.log("// Update trunk");
  console.log("twilio.trunking.v1.trunks('TK...').update({");
  console.log("  friendlyName: 'Updated Trunk Name'");
  console.log("}).then(trunk => console.log(trunk.friendlyName));");
  console.log("");
}

if (hasRealCredentials) {
  // List messages using callbacks
  twilio.messages.list(function (err, messages) {
    if (err) {
      console.error("Error listing messages with callbacks:", err.message);
    } else {
      console.log("Listing messages using callbacks");
      messages.forEach(function (message) {
        console.log(message.sid);
      });
    }
  });

  // List messages using promises
  promise = twilio.messages.list();
  promise.then(function (messages) {
    console.log("Listing messages using promises");
    messages.forEach(function (message) {
      console.log(message.sid);
    });
  }).catch(function (error) {
    console.error("Error listing messages with promises:", error.message);
  });
} else {
  console.log("📱 Message listing examples:");
  console.log("// List messages using callbacks");
  console.log("twilio.messages.list(function (err, messages) {");
  console.log("  if (err) {");
  console.log("    console.error('Error:', err.message);");
  console.log("  } else {");
  console.log("    messages.forEach(function (message) {");
  console.log("      console.log('Message SID:', message.sid);");
  console.log("    });");
  console.log("  }");
  console.log("});");
  console.log("");
  console.log("// List messages using promises");
  console.log("twilio.messages.list()");
  console.log("  .then(messages => {");
  console.log("    messages.forEach(message => console.log(message.sid));");
  console.log("  })");
  console.log("  .catch(error => console.error(error.message));");
  console.log("");
}
