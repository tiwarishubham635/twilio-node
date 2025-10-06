# Pagination and Streaming Methods

The Twilio Node.js SDK provides several methods for handling API responses that return collections of resources. Understanding when and how to use each method is crucial for building efficient applications.

## Overview

When working with Twilio APIs that return collections (like messages, calls, recordings, etc.), you have several options for retrieving and processing the data:

- **`list()`** - Eagerly fetch all records and return as an array
- **`each()`** - Stream records lazily, processing one at a time  
- **`page()`** - Get a specific page of results with manual pagination
- **`getPage()`** - Navigate to a specific page by URL
- **`stream()`** - Real-time streaming (different from pagination)

## Method Details

### `list()` - Eager Loading

The `list()` method fetches **all** records matching your criteria and returns them as an array. It handles pagination automatically behind the scenes.

**Use Cases:**
- When you need all records at once
- Small to medium datasets that fit comfortably in memory
- Simple operations where you don't need streaming
- When you need to know the total count before processing

**Example:**
```javascript
const client = require('twilio')(accountSid, authToken);

// Get all messages (automatically handles pagination)
const messages = await client.messages.list();
console.log(`Total messages: ${messages.length}`);
messages.forEach(message => {
    console.log(`${message.from} -> ${message.to}: ${message.body}`);
});

// With filters and limits
const recentMessages = await client.messages.list({
    dateSentAfter: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    limit: 100 // Limit to 100 messages max
});
```

**Pros:**
- Simple to use
- Automatic pagination handling
- Can easily get total count

**Cons:**
- Memory intensive for large datasets
- Slower for large collections
- May hit memory limits with very large datasets

### `each()` - Lazy Streaming

The `each()` method processes records one at a time, loading pages as needed. This is memory efficient and allows for early termination.

**Use Cases:**
- Large datasets that don't fit comfortably in memory
- When you need to process records individually
- When you might want to stop processing early
- Memory-constrained environments

**Example:**
```javascript
const client = require('twilio')(accountSid, authToken);

// Process each call individually
let processedCount = 0;
await new Promise((resolve, reject) => {
    client.calls.each({
        pageSize: 50, // Fetch 50 records per API call
        callback: (call, done) => {
            console.log(`Processing call: ${call.sid}`);
            processedCount++;
            
            // Example: Stop after processing 1000 calls
            if (processedCount >= 1000) {
                done(); // Stop processing
                return;
            }
            
            // Example: Stop if we find a specific call
            if (call.from === '+1234567890') {
                console.log('Found the call we were looking for!');
                done();
                return;
            }
        },
        done: (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        }
    });
});

console.log(`Processed ${processedCount} calls`);
```

**Alternative syntax:**
```javascript
// Simpler syntax when you don't need early termination
client.calls.each((call) => {
    console.log(`Call from ${call.from} to ${call.to}`);
});
```

**Pros:**
- Memory efficient
- Can handle very large datasets
- Allows early termination
- Processes data as it arrives

**Cons:**
- More complex than `list()`
- No easy way to get total count upfront
- Callback-based (though can be wrapped in Promise)

### `page()` - Manual Pagination

The `page()` method gives you complete control over pagination, returning a `Page` object with the current page's records and navigation information.

**Use Cases:**
- Building custom pagination UI
- When you need fine-grained control over paging
- When you want to implement caching per page
- API endpoints where you need specific page numbers

**Example:**
```javascript
const client = require('twilio')(accountSid, authToken);

// Get the first page
let page = await client.messages.page({
    pageSize: 20,
    pageNumber: 1
});

console.log(`Page has ${page.instances.length} messages`);
page.instances.forEach(message => {
    console.log(`${message.from}: ${message.body}`);
});

// Navigate to next page if available
if (page.nextPageUrl) {
    const nextPage = await client.messages.getPage(page.nextPageUrl);
    console.log(`Next page has ${nextPage.instances.length} messages`);
}

// Implement custom pagination
let currentPage = 1;
const pageSize = 50;
let hasMorePages = true;

while (hasMorePages && currentPage <= 10) { // Limit to 10 pages
    const page = await client.calls.page({
        pageSize: pageSize,
        pageNumber: currentPage
    });
    
    console.log(`Page ${currentPage}: ${page.instances.length} calls`);
    
    // Process the calls on this page
    page.instances.forEach(call => {
        console.log(`Call: ${call.sid} - ${call.status}`);
    });
    
    // Check if there are more pages
    hasMorePages = !!page.nextPageUrl;
    currentPage++;
}
```

**Pros:**
- Complete control over pagination
- Good for building custom UIs
- Can implement caching strategies
- Know exactly which page you're on

**Cons:**
- More code required
- Need to handle pagination logic yourself
- More API calls if you need to traverse many pages

### `getPage()` - Navigate by URL

The `getPage()` method fetches a specific page using a URL, typically obtained from a previous page's `nextPageUrl` or `previousPageUrl`.

**Example:**
```javascript
const client = require('twilio')(accountSid, authToken);

// Get first page
const firstPage = await client.messages.page({ pageSize: 10 });

// Navigate using URLs
if (firstPage.nextPageUrl) {
    const secondPage = await client.messages.getPage(firstPage.nextPageUrl);
    console.log(`Second page: ${secondPage.instances.length} messages`);
}

if (secondPage.previousPageUrl) {
    const backToFirst = await client.messages.getPage(secondPage.previousPageUrl);
    console.log(`Back to first page: ${backToFirst.instances.length} messages`);
}
```

### `stream()` - Real-time Streaming

The `stream()` method is **not** related to pagination. It's used for real-time streaming of audio/video data during active calls.

**Use Cases:**
- Real-time audio processing during calls
- Call recording streaming
- Live transcription
- Voice analysis

**Example:**
```javascript
const client = require('twilio')(accountSid, authToken);

// Start streaming on an active call
const stream = await client.calls('CA1234567890abcdef1234567890abcdef')
    .streams
    .create({
        url: 'wss://your-server.com/stream',
        name: 'Example Stream'
    });

console.log(`Stream SID: ${stream.sid}`);
console.log(`Stream Status: ${stream.status}`);
```

## Choosing the Right Method

| Method | Dataset Size | Memory Usage | Control Level | Use Case |
|--------|-------------|--------------|---------------|-----------|
| `list()` | Small-Medium | High | Low | Simple operations, need all data |
| `each()` | Any | Low | Medium | Large datasets, memory efficient |
| `page()` | Any | Low | High | Custom pagination, UI building |
| `getPage()` | Any | Low | High | Navigation by URL |
| `stream()` | N/A | Low | High | Real-time audio/video streaming |

## Performance Considerations

### Memory Usage
- **`list()`**: Memory usage grows with dataset size
- **`each()`**: Constant memory usage regardless of dataset size
- **`page()`**: Memory usage per page only

### API Calls
- **`list()`**: Multiple API calls (handled automatically)
- **`each()`**: Multiple API calls (as needed)
- **`page()`**: One API call per page
- **`getPage()`**: One API call per page

### Speed
- **`list()`**: Fastest for small datasets, slower for large ones
- **`each()`**: Consistent speed, good for large datasets
- **`page()`**: Fast per page, depends on how many pages you fetch

## Common Patterns

### Pattern 1: Search and Stop
```javascript
// Find a specific message and stop
let foundMessage = null;
await new Promise((resolve) => {
    client.messages.each({
        callback: (message, done) => {
            if (message.body.includes('urgent')) {
                foundMessage = message;
                done(); // Stop searching
            }
        },
        done: resolve
    });
});
```

### Pattern 2: Batch Processing
```javascript
// Process messages in batches
const batchSize = 100;
let batch = [];

await new Promise((resolve) => {
    client.messages.each({
        callback: (message, done) => {
            batch.push(message);
            
            if (batch.length >= batchSize) {
                processBatch(batch);
                batch = [];
            }
        },
        done: () => {
            if (batch.length > 0) {
                processBatch(batch); // Process final batch
            }
            resolve();
        }
    });
});

function processBatch(messages) {
    console.log(`Processing batch of ${messages.length} messages`);
    // Your batch processing logic here
}
```

### Pattern 3: Pagination with UI
```javascript
class MessagePaginator {
    constructor(client, pageSize = 20) {
        this.client = client;
        this.pageSize = pageSize;
        this.currentPage = null;
    }
    
    async getFirstPage() {
        this.currentPage = await this.client.messages.page({
            pageSize: this.pageSize
        });
        return this.currentPage;
    }
    
    async getNextPage() {
        if (this.currentPage?.nextPageUrl) {
            this.currentPage = await this.client.messages.getPage(
                this.currentPage.nextPageUrl
            );
            return this.currentPage;
        }
        return null;
    }
    
    async getPreviousPage() {
        if (this.currentPage?.previousPageUrl) {
            this.currentPage = await this.client.messages.getPage(
                this.currentPage.previousPageUrl
            );
            return this.currentPage;
        }
        return null;
    }
}
```

## Error Handling

All methods support error handling through try/catch blocks or callback error parameters:

```javascript
// With async/await
try {
    const messages = await client.messages.list();
    console.log(`Retrieved ${messages.length} messages`);
} catch (error) {
    console.error('Error fetching messages:', error);
}

// With each() method
client.messages.each({
    callback: (message, done) => {
        try {
            // Process message
            console.log(message.sid);
        } catch (error) {
            done(error); // Pass error to done callback
        }
    },
    done: (error) => {
        if (error) {
            console.error('Error processing messages:', error);
        }
    }
});
```