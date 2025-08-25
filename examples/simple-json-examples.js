/**
 * Simple JSON Payload Examples for Twilio Node.js Helper Library
 *
 * This file shows basic examples of using JSON payloads with Twilio APIs.
 * These are the most common patterns developers will use.
 */

const Twilio = require("../lib");

// Check if we have real credentials
const hasRealCredentials =
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  process.env.TWILIO_ACCOUNT_SID.startsWith("AC");

console.log("=== Simple JSON Payload Examples ===\n");

if (!hasRealCredentials) {
  console.log(
    "⚠ Demo Mode: Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN for live testing"
  );
  console.log(
    "⚠ The examples below show JSON payload structures and patterns\n"
  );
}

// =============================================================================
// Example 1: Basic JSON Payload - AI Assistant Tool
// =============================================================================
console.log("1. Basic AI Assistant tool with JSON payload:");

const basicJsonPayload = {
  name: "simple_calculator",
  description: "A simple calculator tool",
  type: "function",
  enabled: true,
  meta: {
    method: "POST",
    url: "https://api.example.com/calculate",
  },
};

console.log("📋 JSON Payload Structure:");
console.log(JSON.stringify(basicJsonPayload, null, 2));

if (hasRealCredentials) {
  console.log("\n🚀 Code to execute:");
  console.log(
    `const tool = await twilio.assistants.v1.tools.create(jsonPayload);`
  );
} else {
  console.log("\n💡 Usage Pattern:");
  console.log("const twilio = new Twilio(accountSid, authToken);");
  console.log(
    "const tool = await twilio.assistants.v1.tools.create(jsonPayload);"
  );
}

// =============================================================================
// Example 2: JSON Payload with Nested Objects
// =============================================================================
console.log("\n" + "=".repeat(70));
console.log("2. Tool with nested JSON structure:");

const nestedJsonPayload = {
  name: "weather_service",
  description: "Get weather information",
  type: "function",
  enabled: true,
  meta: {
    method: "POST",
    url: "https://api.weather.com/v1/forecast",
    input_schema: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "City name",
        },
        units: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
        },
      },
      required: ["location"],
    },
  },
};

console.log("📋 Nested JSON Payload Structure:");
console.log(JSON.stringify(nestedJsonPayload, null, 2));

console.log("\n💡 Key Feature: Complex nested objects are fully supported");

// =============================================================================
// Example 3: Using Callbacks with JSON Payload
// =============================================================================
console.log("\n" + "=".repeat(70));
console.log("3. Callback pattern with JSON payload:");

const callbackJsonPayload = {
  name: "data_processor",
  description: "Process data requests",
  type: "function",
  enabled: true,
};

console.log("📋 JSON Payload:");
console.log(JSON.stringify(callbackJsonPayload, null, 2));

console.log("\n💡 Callback Pattern:");
console.log(`twilio.assistants.v1.tools.create(jsonPayload, (error, tool) => {
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Tool created:', tool.sid);
  }
});`);

// =============================================================================
// Example 4: JSON Array in Payload
// =============================================================================
console.log("\n" + "=".repeat(70));
console.log("4. JSON payload with arrays:");

const payloadWithArray = {
  name: "multi_service_tool",
  description: "Tool that handles multiple services",
  type: "function",
  enabled: true,
  meta: {
    supported_formats: ["json", "xml", "csv"],
    allowed_domains: [
      "api.service1.com",
      "api.service2.com",
      "api.service3.com",
    ],
    rate_limits: {
      requests_per_minute: 60,
      burst_limit: 10,
    },
  },
};

console.log("📋 JSON Payload with Arrays:");
console.log(JSON.stringify(payloadWithArray, null, 2));

console.log("\n💡 Key Feature: Arrays and complex structures are supported");

// =============================================================================
// Example 5: Custom Headers with JSON Payload
// =============================================================================
console.log("\n" + "=".repeat(70));
console.log("5. Custom headers with JSON payload:");

const jsonPayload = {
  name: "custom_header_tool",
  description: "Tool demonstrating custom headers",
  type: "function",
  enabled: true,
};

const customHeaders = {
  "X-Custom-Client": "my-application",
  "X-Request-ID": `req-${Date.now()}`,
  "X-API-Version": "v1",
};

console.log("📋 JSON Payload:");
console.log(JSON.stringify(jsonPayload, null, 2));
console.log("\n📋 Custom Headers:");
console.log(JSON.stringify(customHeaders, null, 2));

console.log("\n💡 Usage with Custom Headers:");
console.log(
  `const tool = await twilio.assistants.v1.tools.create(jsonPayload, customHeaders);`
);

// =============================================================================
// Example 6: Other APIs that Support JSON
// =============================================================================
console.log("\n" + "=".repeat(70));
console.log("6. Other APIs supporting JSON payloads:");

console.log("\n📋 Flex API - Interaction Transfer:");
const flexPayload = {
  from: "agent1@company.com",
  to: "agent2@company.com",
  type: "agent",
  execution: {
    timeout: 300,
    metadata: {
      reason: "escalation",
      priority: "high",
    },
  },
};
console.log(JSON.stringify(flexPayload, null, 2));
console.log(
  "Usage: twilio.flexApi.v1.interactions(sid).channels(sid).transfers.create(payload)"
);

console.log("\n📋 TaskRouter - Bulk Statistics:");
const taskrouterPayload = {
  filters: {
    start_date: "2024-01-01T00:00:00Z",
    end_date: "2024-01-31T23:59:59Z",
    task_channels: ["voice", "chat"],
  },
  granularity: "daily",
};
console.log(JSON.stringify(taskrouterPayload, null, 2));
console.log(
  "Usage: twilio.taskrouter.v1.workspaces(sid).taskQueues(sid).bulkRealTimeStatistics().create(payload)"
);

// =============================================================================
// Summary
// =============================================================================
console.log("\n" + "=".repeat(70));
console.log("=== Key Takeaways ===");
console.log(
  "✓ JSON payloads work automatically - no special configuration needed"
);
console.log("✓ Nested objects and arrays are fully supported");
console.log("✓ Both Promise and callback patterns work with JSON");
console.log("✓ Custom headers can be included with JSON payloads");
console.log("✓ The library automatically sets Content-Type: application/json");
console.log(
  "✓ Multiple APIs support JSON payloads (Assistants, Flex, TaskRouter, etc.)"
);

console.log("\n=== Next Steps ===");
console.log("• Replace placeholder SIDs with real values for testing");
console.log("• Check API documentation for specific JSON schemas required");
console.log("• Add proper error handling for production use");
console.log("• Validate JSON structure before sending requests");

if (!hasRealCredentials) {
  console.log("\n=== To Test with Real API Calls ===");
  console.log("export TWILIO_ACCOUNT_SID='ACxxxxx...'");
  console.log("export TWILIO_AUTH_TOKEN='your_auth_token'");
  console.log("node examples/simple-json-examples.js");
}

// Export for use in other modules
module.exports = {
  basicJsonPayload,
  nestedJsonPayload,
  callbackJsonPayload,
  payloadWithArray,
  customHeaders,
  flexPayload,
  taskrouterPayload,
};
