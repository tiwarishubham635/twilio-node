/**
 * Pagination and Streaming Examples
 * 
 * This file demonstrates the different methods available for handling
 * API responses that return collections of resources in the Twilio Node.js SDK.
 */

const twilio = require('../lib');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

/**
 * Example 1: Using list() for small to medium datasets
 * Good when you need all records at once and memory isn't a concern
 */
async function exampleList() {
    console.log('\n=== Example 1: list() method ===');
    
    try {
        // Get all messages from the last 7 days
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const messages = await client.messages.list({
            dateSentAfter: weekAgo,
            limit: 50 // Limit to prevent too many results in example
        });

        console.log(`Retrieved ${messages.length} messages from the last 7 days`);
        
        // Process all messages at once
        const messagesByDirection = {
            inbound: 0,
            outbound: 0
        };

        messages.forEach(message => {
            if (message.direction === 'inbound') {
                messagesByDirection.inbound++;
            } else {
                messagesByDirection.outbound++;
            }
        });

        console.log('Message breakdown:');
        console.log(`- Inbound: ${messagesByDirection.inbound}`);
        console.log(`- Outbound: ${messagesByDirection.outbound}`);

    } catch (error) {
        console.error('Error in list() example:', error.message);
    }
}

/**
 * Example 2: Using each() for large datasets or memory efficiency
 * Good when you need to process records individually or might stop early
 */
async function exampleEach() {
    console.log('\n=== Example 2: each() method ===');
    
    try {
        let processedCount = 0;
        let errorCount = 0;
        const maxToProcess = 100; // Limit for example

        await new Promise((resolve, reject) => {
            client.calls.each({
                pageSize: 20, // Fetch 20 records per API call
                limit: maxToProcess, // Stop after processing this many
                callback: (call, done) => {
                    processedCount++;
                    
                    // Process each call individually
                    console.log(`Processing call ${processedCount}: ${call.sid} (${call.status})`);
                    
                    // Example: Count failed calls
                    if (call.status === 'failed') {
                        errorCount++;
                    }
                    
                    // Example: Stop early if we find too many errors
                    if (errorCount >= 5) {
                        console.log('Found too many failed calls, stopping early');
                        done(); // Stop processing
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

        console.log(`Processed ${processedCount} calls, found ${errorCount} failed calls`);

    } catch (error) {
        console.error('Error in each() example:', error.message);
    }
}

/**
 * Example 3: Using page() for manual pagination control
 * Good for building custom pagination UIs or when you need specific pages
 */
async function examplePage() {
    console.log('\n=== Example 3: page() method ===');
    
    try {
        const pageSize = 10;
        let currentPageNum = 1;
        let hasMorePages = true;
        let totalRecords = 0;

        console.log(`Fetching recordings with page size: ${pageSize}`);

        while (hasMorePages && currentPageNum <= 3) { // Limit to 3 pages for example
            console.log(`\nFetching page ${currentPageNum}...`);
            
            const page = await client.recordings.page({
                pageSize: pageSize,
                pageNumber: currentPageNum
            });

            console.log(`Page ${currentPageNum}: ${page.instances.length} recordings`);
            totalRecords += page.instances.length;

            // Process recordings on this page
            page.instances.forEach((recording, index) => {
                console.log(`  ${index + 1}. ${recording.sid} - Duration: ${recording.duration}s`);
            });

            // Check if there are more pages
            hasMorePages = !!page.nextPageUrl;
            currentPageNum++;
        }

        console.log(`\nTotal records processed: ${totalRecords}`);

    } catch (error) {
        console.error('Error in page() example:', error.message);
    }
}

/**
 * Example 4: Using getPage() to navigate between pages
 * Good when you have page URLs and need to navigate between them
 */
async function exampleGetPage() {
    console.log('\n=== Example 4: getPage() method ===');
    
    try {
        // Get the first page
        console.log('Getting first page...');
        const firstPage = await client.messages.page({ pageSize: 5 });
        console.log(`First page: ${firstPage.instances.length} messages`);

        // Navigate to next page using URL
        if (firstPage.nextPageUrl) {
            console.log('Getting next page using URL...');
            const secondPage = await client.messages.getPage(firstPage.nextPageUrl);
            console.log(`Second page: ${secondPage.instances.length} messages`);

            // Navigate back to previous page
            if (secondPage.previousPageUrl) {
                console.log('Going back to previous page...');
                const backToFirst = await client.messages.getPage(secondPage.previousPageUrl);
                console.log(`Back to first page: ${backToFirst.instances.length} messages`);
            }
        } else {
            console.log('No next page available');
        }

    } catch (error) {
        console.error('Error in getPage() example:', error.message);
    }
}

/**
 * Example 5: Advanced pattern - Batch processing with each()
 * Process records in batches for efficiency
 */
async function exampleBatchProcessing() {
    console.log('\n=== Example 5: Batch processing with each() ===');
    
    try {
        const batchSize = 10;
        let batch = [];
        let batchNumber = 1;

        await new Promise((resolve) => {
            client.messages.each({
                pageSize: 50, // Fetch many records per API call for efficiency
                limit: 30, // Limit total for example
                callback: (message, done) => {
                    batch.push(message);
                    
                    // Process batch when it's full
                    if (batch.length >= batchSize) {
                        processBatch(batch, batchNumber);
                        batch = [];
                        batchNumber++;
                    }
                },
                done: () => {
                    // Process final batch if there are remaining items
                    if (batch.length > 0) {
                        processBatch(batch, batchNumber);
                    }
                    resolve();
                }
            });
        });

        function processBatch(messages, batchNum) {
            console.log(`Processing batch ${batchNum} with ${messages.length} messages`);
            
            // Example batch processing: count messages by status
            const statusCount = {};
            messages.forEach(message => {
                statusCount[message.status] = (statusCount[message.status] || 0) + 1;
            });
            
            console.log(`  Status breakdown:`, statusCount);
        }

    } catch (error) {
        console.error('Error in batch processing example:', error.message);
    }
}

/**
 * Example 6: Search and stop pattern
 * Find specific records and stop processing when found
 */
async function exampleSearchAndStop() {
    console.log('\n=== Example 6: Search and stop pattern ===');
    
    try {
        let foundCalls = [];
        const targetNumber = '+1234567890'; // Change to a number in your account
        
        console.log(`Searching for calls from ${targetNumber}...`);

        await new Promise((resolve) => {
            client.calls.each({
                callback: (call, done) => {
                    if (call.from === targetNumber) {
                        foundCalls.push(call);
                        console.log(`Found call: ${call.sid} at ${call.dateCreated}`);
                        
                        // Stop after finding 3 calls
                        if (foundCalls.length >= 3) {
                            console.log('Found enough calls, stopping search');
                            done();
                            return;
                        }
                    }
                },
                done: resolve
            });
        });

        console.log(`Search complete. Found ${foundCalls.length} calls from ${targetNumber}`);

    } catch (error) {
        console.error('Error in search and stop example:', error.message);
    }
}

/**
 * Example 7: Error handling patterns
 * Demonstrate proper error handling with different methods
 */
async function exampleErrorHandling() {
    console.log('\n=== Example 7: Error handling ===');

    // Error handling with list()
    try {
        console.log('Testing error handling with list()...');
        const messages = await client.messages.list({
            // This might cause an error if the date format is invalid
            dateSentAfter: 'invalid-date'
        });
        console.log(`Retrieved ${messages.length} messages`);
    } catch (error) {
        console.log(`Caught error in list(): ${error.message}`);
    }

    // Error handling with each()
    try {
        console.log('Testing error handling with each()...');
        await new Promise((resolve, reject) => {
            client.calls.each({
                limit: 5,
                callback: (call, done) => {
                    try {
                        // Simulate processing that might throw an error
                        if (call.sid.includes('invalid')) {
                            throw new Error('Invalid call SID');
                        }
                        console.log(`Processed call: ${call.sid}`);
                    } catch (error) {
                        done(error); // Pass error to done callback
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
    } catch (error) {
        console.log(`Caught error in each(): ${error.message}`);
    }
}

/**
 * Run all examples
 */
async function runAllExamples() {
    console.log('='.repeat(60));
    console.log('Twilio Node.js SDK - Pagination and Streaming Examples');
    console.log('='.repeat(60));

    if (!accountSid || !authToken) {
        console.error('Please set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables');
        return;
    }

    await exampleList();
    await exampleEach();
    await examplePage();
    await exampleGetPage();
    await exampleBatchProcessing();
    await exampleSearchAndStop();
    await exampleErrorHandling();

    console.log('\n=== All examples completed ===');
}

// Run examples if this file is executed directly
if (require.main === module) {
    runAllExamples().catch(console.error);
}

module.exports = {
    exampleList,
    exampleEach,
    examplePage,
    exampleGetPage,
    exampleBatchProcessing,
    exampleSearchAndStop,
    exampleErrorHandling
};