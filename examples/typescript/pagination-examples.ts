/**
 * Pagination and Streaming Examples (TypeScript)
 * 
 * This file demonstrates the different methods available for handling
 * API responses that return collections of resources in the Twilio Node.js SDK.
 */

import twilio from '../../lib';
import { CallInstance } from '../../lib/rest/api/v2010/account/call';
import { MessageInstance } from '../../lib/rest/api/v2010/account/message';
import { RecordingInstance } from '../../lib/rest/api/v2010/account/recording';

// Initialize Twilio client
const accountSid: string = process.env.TWILIO_ACCOUNT_SID || '';
const authToken: string = process.env.TWILIO_AUTH_TOKEN || '';
const client = twilio(accountSid, authToken);

/**
 * Example 1: Using list() for small to medium datasets
 * Good when you need all records at once and memory isn't a concern
 */
async function exampleList(): Promise<void> {
    console.log('\n=== Example 1: list() method ===');
    
    try {
        // Get all messages from the last 7 days
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const messages: MessageInstance[] = await client.messages.list({
            dateSentAfter: weekAgo,
            limit: 50 // Limit to prevent too many results in example
        });

        console.log(`Retrieved ${messages.length} messages from the last 7 days`);
        
        // Process all messages at once
        const messagesByDirection = {
            inbound: 0,
            outbound: 0
        };

        messages.forEach((message: MessageInstance) => {
            if (message.direction === 'inbound') {
                messagesByDirection.inbound++;
            } else {
                messagesByDirection.outbound++;
            }
        });

        console.log('Message breakdown:');
        console.log(`- Inbound: ${messagesByDirection.inbound}`);
        console.log(`- Outbound: ${messagesByDirection.outbound}`);

    } catch (error: any) {
        console.error('Error in list() example:', error.message);
    }
}

/**
 * Example 2: Using each() for large datasets or memory efficiency
 * Good when you need to process records individually or might stop early
 */
async function exampleEach(): Promise<void> {
    console.log('\n=== Example 2: each() method ===');
    
    try {
        let processedCount: number = 0;
        let errorCount: number = 0;
        const maxToProcess: number = 100; // Limit for example

        await new Promise<void>((resolve, reject) => {
            client.calls.each({
                pageSize: 20, // Fetch 20 records per API call
                limit: maxToProcess, // Stop after processing this many
                callback: (call: CallInstance, done: (err?: Error) => void) => {
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
                done: (error?: Error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                }
            });
        });

        console.log(`Processed ${processedCount} calls, found ${errorCount} failed calls`);

    } catch (error: any) {
        console.error('Error in each() example:', error.message);
    }
}

/**
 * Example 3: Using page() for manual pagination control
 * Good for building custom pagination UIs or when you need specific pages
 */
async function examplePage(): Promise<void> {
    console.log('\n=== Example 3: page() method ===');
    
    try {
        const pageSize: number = 10;
        let currentPageNum: number = 1;
        let hasMorePages: boolean = true;
        let totalRecords: number = 0;

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
            page.instances.forEach((recording: RecordingInstance, index: number) => {
                console.log(`  ${index + 1}. ${recording.sid} - Duration: ${recording.duration}s`);
            });

            // Check if there are more pages
            hasMorePages = !!page.nextPageUrl;
            currentPageNum++;
        }

        console.log(`\nTotal records processed: ${totalRecords}`);

    } catch (error: any) {
        console.error('Error in page() example:', error.message);
    }
}

/**
 * Example 4: Using getPage() to navigate between pages
 * Good when you have page URLs and need to navigate between them
 */
async function exampleGetPage(): Promise<void> {
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

    } catch (error: any) {
        console.error('Error in getPage() example:', error.message);
    }
}

/**
 * Example 5: Advanced pattern - Batch processing with each()
 * Process records in batches for efficiency
 */
async function exampleBatchProcessing(): Promise<void> {
    console.log('\n=== Example 5: Batch processing with each() ===');
    
    try {
        const batchSize: number = 10;
        let batch: MessageInstance[] = [];
        let batchNumber: number = 1;

        await new Promise<void>((resolve) => {
            client.messages.each({
                pageSize: 50, // Fetch many records per API call for efficiency
                limit: 30, // Limit total for example
                callback: (message: MessageInstance, done: (err?: Error) => void) => {
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

        function processBatch(messages: MessageInstance[], batchNum: number): void {
            console.log(`Processing batch ${batchNum} with ${messages.length} messages`);
            
            // Example batch processing: count messages by status
            const statusCount: { [key: string]: number } = {};
            messages.forEach((message: MessageInstance) => {
                const status = message.status;
                statusCount[status] = (statusCount[status] || 0) + 1;
            });
            
            console.log(`  Status breakdown:`, statusCount);
        }

    } catch (error: any) {
        console.error('Error in batch processing example:', error.message);
    }
}

/**
 * Example 6: Search and stop pattern
 * Find specific records and stop processing when found
 */
async function exampleSearchAndStop(): Promise<void> {
    console.log('\n=== Example 6: Search and stop pattern ===');
    
    try {
        let foundCalls: CallInstance[] = [];
        const targetNumber: string = '+1234567890'; // Change to a number in your account
        
        console.log(`Searching for calls from ${targetNumber}...`);

        await new Promise<void>((resolve) => {
            client.calls.each({
                callback: (call: CallInstance, done: (err?: Error) => void) => {
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

    } catch (error: any) {
        console.error('Error in search and stop example:', error.message);
    }
}

/**
 * Example 7: Error handling patterns
 * Demonstrate proper error handling with different methods
 */
async function exampleErrorHandling(): Promise<void> {
    console.log('\n=== Example 7: Error handling ===');

    // Error handling with list()
    try {
        console.log('Testing error handling with list()...');
        const messages: MessageInstance[] = await client.messages.list({
            limit: 5 // Keep it small for the example
        });
        console.log(`Retrieved ${messages.length} messages`);
    } catch (error: any) {
        console.log(`Caught error in list(): ${error.message}`);
    }

    // Error handling with each()
    try {
        console.log('Testing error handling with each()...');
        await new Promise<void>((resolve, reject) => {
            client.calls.each({
                limit: 5,
                callback: (call: CallInstance, done: (err?: Error) => void) => {
                    try {
                        // Simulate processing that might throw an error
                        if (call.sid.includes('invalid')) {
                            throw new Error('Invalid call SID');
                        }
                        console.log(`Processed call: ${call.sid}`);
                    } catch (error: any) {
                        done(error); // Pass error to done callback
                    }
                },
                done: (error?: Error) => {
                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                }
            });
        });
    } catch (error: any) {
        console.log(`Caught error in each(): ${error.message}`);
    }
}

/**
 * Utility class for pagination management
 */
class MessagePaginator {
    private client: any;
    private pageSize: number;
    private currentPage: any = null;

    constructor(client: any, pageSize: number = 20) {
        this.client = client;
        this.pageSize = pageSize;
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

    getCurrentPage() {
        return this.currentPage;
    }
}

/**
 * Example 8: Using the utility paginator class
 */
async function examplePaginatorClass(): Promise<void> {
    console.log('\n=== Example 8: Paginator utility class ===');
    
    try {
        const paginator = new MessagePaginator(client, 5);
        
        // Get first page
        console.log('Getting first page...');
        let page = await paginator.getFirstPage();
        console.log(`First page: ${page.instances.length} messages`);
        
        // Get next page
        console.log('Getting next page...');
        page = await paginator.getNextPage();
        if (page) {
            console.log(`Next page: ${page.instances.length} messages`);
        } else {
            console.log('No next page available');
        }
        
        // Go back to previous page
        console.log('Going back to previous page...');
        page = await paginator.getPreviousPage();
        if (page) {
            console.log(`Previous page: ${page.instances.length} messages`);
        } else {
            console.log('No previous page available');
        }
        
    } catch (error: any) {
        console.error('Error in paginator class example:', error.message);
    }
}

/**
 * Run all examples
 */
async function runAllExamples(): Promise<void> {
    console.log('='.repeat(60));
    console.log('Twilio Node.js SDK - Pagination and Streaming Examples (TypeScript)');
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
    await examplePaginatorClass();

    console.log('\n=== All examples completed ===');
}

// Export functions for use in other modules
export {
    exampleList,
    exampleEach,
    examplePage,
    exampleGetPage,
    exampleBatchProcessing,
    exampleSearchAndStop,
    exampleErrorHandling,
    examplePaginatorClass,
    MessagePaginator
};

// Run examples if this file is executed directly
if (require.main === module) {
    runAllExamples().catch(console.error);
}