/**
 * JSON Payload Examples for Twilio Node.js Helper Library
 * 
 * This file demonstrates how to use JSON payloads with various Twilio APIs.
 * As of version 5.0.0, the Node helper library supports application/json content type.
 * 
 * Prerequisites:
 * - Set environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
 * - Some examples require additional setup (Assistant SID, Service SID, etc.)
 */

const Twilio = require("../lib");

// Check if we have real credentials
const hasRealCredentials = process.env.TWILIO_ACCOUNT_SID && 
                          process.env.TWILIO_AUTH_TOKEN &&
                          process.env.TWILIO_ACCOUNT_SID.startsWith('AC');

console.log("=== JSON Payload Examples for Twilio Node.js ===\n");

if (!hasRealCredentials) {
  console.log("⚠ Demo Mode: Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN for live testing");
  console.log("⚠ The examples below show JSON payload structures and API patterns\n");
}

// =============================================================================
// Example 1: AI Assistants API - Creating a Tool with JSON Payload
// =============================================================================
console.log("1. AI Assistants API - Tool Creation with Complex JSON");

const assistantToolData = {
  assistant_id: "ASSISTANT_SID_HERE", // Replace with actual Assistant SID
  name: "weather_tool",
  description: "A tool to get weather information",
  type: "function",
  enabled: true,
  meta: {
    method: "POST",
    url: "https://api.weather.com/forecast",
    input_schema: {
      type: "object",
      properties: {
        location: {
          type: "string",
          description: "The location to get weather for"
        },
        units: {
          type: "string",
          enum: ["celsius", "fahrenheit"],
          description: "Temperature units"
        }
      },
      required: ["location"]
    }
  },
  policy: {
    name: "weather_policy",
    description: "Policy for weather tool access",
    type: "access_control",
    policy_details: {
      allowed_domains: ["weather.com", "openweathermap.org"],
      rate_limit: {
        requests_per_minute: 60
      }
    }
  }
};

console.log("📋 Complex AI Assistant Tool JSON Payload:");
console.log(JSON.stringify(assistantToolData, null, 2));
console.log("\n💡 Usage:");
console.log("const tool = await twilio.assistants.v1.tools.create(toolData);");
console.log("// or with callback:");
console.log("twilio.assistants.v1.tools.create(toolData, callback);");

// =============================================================================
// Example 2: Flex API - Interaction Transfer with JSON Payload
// =============================================================================
console.log("\n" + "=".repeat(70));
console.log("2. Flex API - Interaction Transfer with JSON");

const flexTransferData = {
  from: "agent1@company.com",
  to: "agent2@company.com",
  type: "agent", 
  execution: {
    timeout: 300,
    priority: "high",
    metadata: {
      reason: "customer_escalation",
      department: "technical_support",
      skill_requirements: ["api_knowledge", "troubleshooting"]
    }
  }
};

console.log("📋 Flex Interaction Transfer JSON Payload:");
console.log(JSON.stringify(flexTransferData, null, 2));
console.log("\n💡 Usage:");
console.log("const transfer = await twilio.flexApi.v1");
console.log("  .interactions(interactionSid)");
console.log("  .channels(channelSid)");
console.log("  .transfers.create(transferData);");

// =============================================================================
// Example 3: TaskRouter - Bulk Statistics with JSON Payload  
// =============================================================================
console.log("\n" + "=".repeat(70));
console.log("3. TaskRouter - Bulk Statistics Request with JSON");

const taskRouterStatsData = {
  filters: {
    start_date: "2024-01-01T00:00:00Z",
    end_date: "2024-01-31T23:59:59Z",
    task_channels: ["voice", "chat", "video"],
    split_by_wait_time: true
  },
  granularity: "daily",
  metrics: ["tasks_entered", "tasks_completed", "avg_wait_time", "max_wait_time"]
};

console.log("📋 TaskRouter Bulk Statistics JSON Payload:");
console.log(JSON.stringify(taskRouterStatsData, null, 2));
console.log("\n💡 Usage:");
console.log("const stats = await twilio.taskrouter.v1");
console.log("  .workspaces(workspaceSid)");
console.log("  .taskQueues(taskQueueSid)");
console.log("  .bulkRealTimeStatistics().create(statsData);");

// =============================================================================
// Example 4: Messaging API - Channels Sender with JSON Payload
// =============================================================================
console.log("\n" + "=".repeat(70));
console.log("4. Messaging API - Channels Sender with JSON");

const messagingChannelsData = {
  senders: [
    {
      sender_id: "+1234567890",
      sender_type: "phone_number",
      country_code: "US"
    },
    {
      sender_id: "brand_name_123", 
      sender_type: "alphanumeric",
      country_code: "GB"
    }
  ],
  messaging_service_sid: "MESSAGING_SERVICE_SID_HERE", // Replace with actual SID
  configuration: {
    fallback_enabled: true,
    callback_url: "https://example.com/webhook",
    callback_method: "POST"
  }
};

console.log("📋 Messaging Channels Sender JSON Payload:");
console.log(JSON.stringify(messagingChannelsData, null, 2));
console.log("\n💡 Usage:");
console.log("const channelsSender = await twilio.messaging.v2.channelsSenders.create(data);");

// =============================================================================
// Example 5: Advanced Nested JSON Structure
// =============================================================================
console.log("\n" + "=".repeat(70));
console.log("5. Advanced Nested JSON Structure Example");

const complexNestedData = {
  name: "database_query_tool",
  description: "Advanced database querying tool", 
  type: "function",
  enabled: true,
  meta: {
    method: "POST",
    url: "https://api.database.com/query",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer token_here"
    },
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "object", 
          properties: {
            select: {
              type: "array",
              items: { type: "string" },
              description: "Fields to select"
            },
            from: {
              type: "string",
              description: "Table name"
            },
            where: {
              type: "object",
              properties: {
                conditions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      field: { type: "string" },
                      operator: { 
                        type: "string", 
                        enum: ["=", "!=", ">", "<", ">=", "<=", "LIKE"] 
                      },
                      value: { type: "string" }
                    },
                    required: ["field", "operator", "value"]
                  }
                },
                logic: {
                  type: "string",
                  enum: ["AND", "OR"],
                  default: "AND"
                }
              }
            }
          },
          required: ["select", "from"]
        }
      },
      required: ["query"]
    }
  },
  policy: {
    name: "database_access_policy",
    description: "Database access control policy",
    type: "data_access",
    policy_details: {
      allowed_tables: ["users", "products", "orders"],
      rate_limits: {
        requests_per_minute: 30,
        concurrent_requests: 5
      },
      access_controls: {
        require_approval: true,
        max_rows_returned: 1000
      }
    }
  }
};

console.log("📋 Complex Nested JSON Structure:");
console.log(JSON.stringify(complexNestedData, null, 2));
console.log("\n💡 Key Features:");
console.log("• Deep nesting supported (6+ levels)");
console.log("• Mixed data types (strings, arrays, objects, booleans)");
console.log("• Complex validation schemas");
console.log("• Policy configurations");

// =============================================================================
// Example 6: Custom Headers with JSON
// =============================================================================
console.log("\n" + "=".repeat(70));
console.log("6. JSON Payload with Custom Headers");

const jsonPayloadWithHeaders = {
  name: "webhook_tool",
  description: "Tool with custom headers",
  type: "webhook",
  enabled: true
};

const customHeaders = {
  "X-Custom-Header": "custom-value",
  "X-Request-ID": "req-123456",
  "X-API-Version": "2024-01-01",
  "X-Client-Name": "my-application"
};

console.log("📋 JSON Payload:");
console.log(JSON.stringify(jsonPayloadWithHeaders, null, 2));
console.log("\n📋 Custom Headers:");
console.log(JSON.stringify(customHeaders, null, 2));
console.log("\n💡 Usage with Custom Headers:");
console.log("const result = await twilio.assistants.v1.tools.create(");
console.log("  jsonPayload,");
console.log("  customHeaders");
console.log(");");

// =============================================================================
// Example 7: Error Handling Patterns
// =============================================================================
console.log("\n" + "=".repeat(70));
console.log("7. Error Handling with JSON Payloads");

console.log("💡 Promise-based Error Handling:");
console.log(`try {
  const result = await twilio.assistants.v1.tools.create(jsonData);
  console.log('Success:', result.sid);
} catch (error) {
  console.error('Error:', error.message);
  if (error.code === 20404) {
    console.error('Resource not found');
  } else if (error.code === 20001) {
    console.error('Authorization error');
  }
}`);

console.log("\n💡 Callback-based Error Handling:");
console.log(`twilio.assistants.v1.tools.create(jsonData, (error, result) => {
  if (error) {
    console.error('Error:', error.message, 'Code:', error.code);
    return;
  }
  console.log('Success:', result.sid);
});`);

// =============================================================================
// Summary and Best Practices
// =============================================================================
console.log("\n" + "=".repeat(70));
console.log("=== JSON Payload Summary ===");

console.log("\n✓ APIs Supporting JSON Payloads:");
console.log("  • AI Assistants API (tools, policies)");
console.log("  • Flex API (interactions, transfers)");
console.log("  • TaskRouter API (bulk operations)");
console.log("  • Messaging v2 API (channels, senders)");
console.log("  • Marketplace API (add-ons)");
console.log("  • And many more...");

console.log("\n✓ Key Features:");
console.log("  • Automatic Content-Type: application/json header");
console.log("  • Deep nested object support");
console.log("  • Array handling");
console.log("  • Custom headers support");
console.log("  • Both Promise and callback patterns");
console.log("  • Built-in validation");

console.log("\n✓ Best Practices:");
console.log("  • Validate JSON structure before sending");
console.log("  • Use proper error handling");
console.log("  • Follow API-specific schemas");
console.log("  • Include required fields");
console.log("  • Use environment variables for secrets");

if (!hasRealCredentials) {
  console.log("\n=== To Test with Real API Calls ===");
  console.log("export TWILIO_ACCOUNT_SID='ACxxxxx...'");
  console.log("export TWILIO_AUTH_TOKEN='your_auth_token'");
  console.log("# Replace placeholder SIDs with real values");
  console.log("node examples/json-payload-examples.js");
}

console.log("\n=== Documentation Links ===");
console.log("• Twilio API Docs: https://www.twilio.com/docs/api");
console.log("• AI Assistants: https://www.twilio.com/docs/assistants");
console.log("• Flex API: https://www.twilio.com/docs/flex");
console.log("• TaskRouter: https://www.twilio.com/docs/taskrouter");

// Export payloads for testing/reuse
module.exports = {
  assistantToolData,
  flexTransferData,
  taskRouterStatsData,
  messagingChannelsData,
  complexNestedData,
  jsonPayloadWithHeaders,
  customHeaders
};