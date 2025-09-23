# JSON Payload Examples

This directory contains examples demonstrating how to use JSON payloads with the Twilio Node.js Helper Library (v5.0.0+).

## Files

- **`simple-json-examples.js`** - Basic examples showing the most common JSON payload patterns
- **`json-payload-examples.js`** - Comprehensive examples covering various APIs and complex structures
- **`content-api-examples.js`** - Dedicated Content API examples with all content types
- **`CONTENT_API_EXAMPLES.md`** - Comprehensive Content API documentation with JSON payload examples

## Prerequisites

1. Set environment variables:
   ```bash
   export TWILIO_ACCOUNT_SID="your_account_sid"
   export TWILIO_AUTH_TOKEN="your_auth_token"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Examples

### Simple Examples (Recommended for beginners)
```bash
node examples/simple-json-examples.js
```

### Comprehensive Examples
node examples/json-payload-examples.js
```

### Content API Examples
```bash
node examples/content-api-examples.js
```

## What's Covered

### Simple Examples
- Basic JSON payload structure
- Nested JSON objects
- JSON arrays in payloads
- Using callbacks vs promises
- Custom headers with JSON

### Comprehensive Examples
- AI Assistants API (tools creation)
- Flex API (interaction transfers)
- TaskRouter API (bulk statistics)
- Messaging API (channels)
- Complex nested JSON structures
- Error handling patterns

### Content API Examples
- Text content creation (`twilio/text`)
- Media content with images/files (`twilio/media`)
- Interactive quick replies (`twilio/quick-reply`)
- Call-to-action buttons (`twilio/call-to-action`)
- List picker menus (`twilio/list-picker`)
- Rich card content (`twilio/card`)
- Carousel with multiple cards (`twilio/carousel`)
- Location sharing (`twilio/location`)
- WhatsApp authentication templates
- Content with variable substitution
- Content approval workflows
- Advanced filtering and sorting (v2 API)

## APIs That Support JSON Payloads

The following Twilio APIs support JSON payloads (non-exhaustive list):

- **Content API** - Rich messaging content creation and management
- **AI Assistants** - Creating and managing AI tools
- **Flex API** - Contact center interactions and transfers
- **TaskRouter** - Bulk operations and complex statistics
- **Messaging v2** - Advanced messaging configurations
- **Marketplace** - Add-on management
- **And many more...**

## Key Points

1. **Automatic Content-Type**: The library automatically sets `Content-Type: application/json` when needed
2. **No Special Configuration**: JSON payloads work out of the box
3. **Full JSON Support**: Complex nested objects, arrays, and all JSON data types are supported
4. **Same Patterns**: Both promise and callback patterns work identically with JSON
5. **Custom Headers**: You can include custom headers alongside JSON payloads

## Example Usage Pattern

```javascript
const twilio = new Twilio(accountSid, authToken);

// Simple JSON payload
const jsonData = {
  name: "my_tool",
  description: "A useful tool",
  enabled: true,
  config: {
    timeout: 30,
    retries: 3
  }
};

// Using promises
const result = await twilio.assistants.v1.tools.create(jsonData);

// Using callbacks
twilio.assistants.v1.tools.create(jsonData, (error, result) => {
  if (error) {
    console.error(error);
  } else {
    console.log(result.sid);
  }
});
```

## Testing with Real Data

To test these examples with real Twilio resources:

1. Replace placeholder SIDs (like `ASSISTANT_SID_HERE`) with actual resource SIDs
2. Ensure you have the necessary Twilio services enabled in your account
3. Check API documentation for specific requirements and limitations

## Error Handling

Always implement proper error handling in production:

```javascript
try {
  const result = await twilio.assistants.v1.tools.create(jsonData);
  console.log('Success:', result.sid);
} catch (error) {
  console.error('Error:', error.message);
  // Handle specific error types
  if (error.code === 20404) {
    console.error('Resource not found');
  }
}
```

## API Documentation

For detailed API documentation and JSON schemas:
- [Twilio API Documentation](https://www.twilio.com/docs/api)
- [Content API Documentation](https://www.twilio.com/docs/content-api)
- [Content Types Overview](https://www.twilio.com/docs/content-api/content-types-overview)
- [AI Assistants API](https://www.twilio.com/docs/assistants)
- [Flex API](https://www.twilio.com/docs/flex)
- [TaskRouter API](https://www.twilio.com/docs/taskrouter)

## Support

If you encounter issues with JSON payloads:
1. Check that you're using library version 5.0.0 or later
2. Verify your JSON structure matches API requirements
3. Review the error message for specific validation issues
4. Consult the API documentation for the specific endpoint