# Pagination and Streaming Examples

This directory contains examples demonstrating the different methods available for handling collections of resources in the Twilio Node.js SDK.

## Quick Reference

| Method | Purpose | Memory Usage | Best For |
|--------|---------|--------------|----------|
| `list()` | Get all records as array | High | Small-medium datasets |
| `each()` | Process records one by one | Low | Large datasets, streaming |
| `page()` | Manual pagination control | Low | Custom pagination UI |
| `getPage()` | Navigate by URL | Low | Page navigation |
| `stream()` | Real-time streaming | Low | Audio/video streaming |

## Available Examples

### JavaScript Examples
- `pagination-examples.js` - Comprehensive examples of all pagination methods

### TypeScript Examples  
- `typescript/pagination-examples.ts` - TypeScript versions with proper typing

## Running the Examples

**Prerequisites:**
```bash
# Set your Twilio credentials
export TWILIO_ACCOUNT_SID=your_account_sid
export TWILIO_AUTH_TOKEN=your_auth_token
```

**JavaScript:**
```bash
node examples/pagination-examples.js
```

**TypeScript:**
```bash
# Build first
npm run build

# Then run the compiled version
node lib/examples/typescript/pagination-examples.js
```

## Individual Example Functions

Each example file exports individual functions that you can run separately:

```javascript
const examples = require('./pagination-examples');

// Run specific examples
await examples.exampleList();
await examples.exampleEach();
await examples.examplePage();
```

## Complete Documentation

For comprehensive documentation including:
- Detailed explanations of each method
- Advanced usage patterns
- Performance considerations
- Error handling strategies

See: [PAGINATION_AND_STREAMING.md](../PAGINATION_AND_STREAMING.md)

## Common Use Cases

### 1. Process All Messages
```javascript
// Get all messages at once
const messages = await client.messages.list();
console.log(`Total: ${messages.length}`);
```

### 2. Stream Large Datasets
```javascript
// Memory-efficient processing
client.calls.each((call) => {
    console.log(`${call.from} -> ${call.to}`);
});
```

### 3. Build Pagination UI
```javascript
// Get specific page
const page = await client.messages.page({
    pageSize: 20,
    pageNumber: 1
});

// Navigate to next page
if (page.nextPageUrl) {
    const nextPage = await client.messages.getPage(page.nextPageUrl);
}
```

### 4. Search and Stop
```javascript
// Find specific records and stop early
let found = null;
await new Promise((resolve) => {
    client.calls.each({
        callback: (call, done) => {
            if (call.from === targetNumber) {
                found = call;
                done(); // Stop searching
            }
        },
        done: resolve
    });
});
```

## Tips

1. **Use `list()` for small datasets** - Simple and straightforward
2. **Use `each()` for large datasets** - Memory efficient and allows early termination
3. **Use `page()` for UIs** - When you need pagination controls
4. **Always handle errors** - Network calls can fail
5. **Set appropriate `pageSize`** - Balance between API calls and memory usage
6. **Use `limit` parameter** - Prevent accidentally processing huge datasets

## Need Help?

- Check the [main documentation](../PAGINATION_AND_STREAMING.md)
- View the [Twilio API documentation](https://www.twilio.com/docs/api)
- See the [auto-generated library docs](https://www.twilio.com/docs/libraries/reference/twilio-node/)