/**
 * Twilio Content API Examples
 *
 * This file demonstrates how to use the Twilio Content API with JSON payloads
 * to create various types of rich messaging content.
 *
 * Prerequisites:
 * - Set environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
 * - Install twilio package: npm install twilio
 */

const Twilio = require("../lib");

// Initialize Twilio client
const client = new Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

console.log("=== Twilio Content API Examples ===\n");

// Check if we have credentials
const hasCredentials =
  process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;

if (!hasCredentials) {
  console.log(
    "⚠️  Demo Mode: Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to run live examples"
  );
  console.log(
    "📖 The examples below show Content API JSON payload structures\n"
  );
}

// Example JSON payloads for different content types
const contentExamples = {
  // 1. Basic Text Content
  textContent: {
    friendly_name: "Welcome Message",
    language: "en",
    types: {
      "twilio/text": {
        body: "Welcome to our service! Thank you for signing up.",
      },
    },
  },

  // 2. Media Content with Images
  mediaContent: {
    friendly_name: "Product Showcase",
    language: "en",
    types: {
      "twilio/media": {
        body: "Check out our latest product!",
        media: [
          "https://example.com/product-image.jpg",
          "https://example.com/product-brochure.pdf",
        ],
      },
    },
  },

  // 3. Quick Reply Interactive Content
  quickReplyContent: {
    friendly_name: "Feedback Request",
    language: "en",
    types: {
      "twilio/quick-reply": {
        body: "How was your experience with us today?",
        actions: [
          {
            type: "QUICK_REPLY",
            title: "😊 Great",
            id: "feedback_great",
          },
          {
            type: "QUICK_REPLY",
            title: "😐 Okay",
            id: "feedback_okay",
          },
          {
            type: "QUICK_REPLY",
            title: "😞 Poor",
            id: "feedback_poor",
          },
        ],
      },
    },
  },

  // 4. Call to Action Content
  callToActionContent: {
    friendly_name: "Contact Support",
    language: "en",
    types: {
      "twilio/call-to-action": {
        body: "Need help? Contact our support team:",
        actions: [
          {
            type: "URL",
            title: "Visit Help Center",
            url: "https://help.example.com",
          },
          {
            type: "PHONE_NUMBER",
            title: "Call Support",
            phone: "+1-555-0123",
          },
        ],
      },
    },
  },

  // 5. List Picker Content
  listPickerContent: {
    friendly_name: "Service Selection",
    language: "en",
    types: {
      "twilio/list-picker": {
        body: "Which service would you like to learn more about?",
        button: "Choose Service",
        items: [
          {
            id: "service_basic",
            item: "Basic Plan",
            description: "Essential features for individuals",
          },
          {
            id: "service_pro",
            item: "Pro Plan",
            description: "Advanced features for professionals",
          },
          {
            id: "service_enterprise",
            item: "Enterprise Plan",
            description: "Full-featured solution for large organizations",
          },
        ],
      },
    },
  },

  // 6. Card Content
  cardContent: {
    friendly_name: "Product Card",
    language: "en",
    types: {
      "twilio/card": {
        title: "Premium Wireless Headphones",
        subtitle: "High-quality audio with noise cancellation",
        media: ["https://example.com/headphones.jpg"],
        actions: [
          {
            type: "URL",
            title: "View Details",
            url: "https://store.example.com/headphones/premium",
          },
          {
            type: "QUICK_REPLY",
            title: "Add to Cart",
            id: "add_to_cart_headphones",
          },
        ],
      },
    },
  },

  // 7. Carousel Content
  carouselContent: {
    friendly_name: "Product Carousel",
    language: "en",
    types: {
      "twilio/carousel": {
        body: "Check out our featured products:",
        cards: [
          {
            title: "Smartphone",
            body: "Latest model with advanced features",
            media: "https://example.com/phone.jpg",
            actions: [
              {
                type: "URL",
                title: "Learn More",
                url: "https://store.example.com/phone",
              },
            ],
          },
          {
            title: "Tablet",
            body: "Perfect for work and entertainment",
            media: "https://example.com/tablet.jpg",
            actions: [
              {
                type: "URL",
                title: "Learn More",
                url: "https://store.example.com/tablet",
              },
            ],
          },
        ],
      },
    },
  },

  // 8. Location Content
  locationContent: {
    friendly_name: "Store Location",
    language: "en",
    types: {
      "twilio/location": {
        latitude: 37.7749,
        longitude: -122.4194,
        label: "Our San Francisco Store",
        address: "123 Market Street, San Francisco, CA 94103",
      },
    },
  },

  // 9. Content with Variables
  templateContent: {
    friendly_name: "Personalized Welcome",
    language: "en",
    variables: {
      1: "customer_name",
      2: "account_type",
    },
    types: {
      "twilio/text": {
        body: "Hello {{1}}! Welcome to your {{2}} account. We're excited to have you on board!",
      },
    },
  },

  // 10. WhatsApp Authentication Content
  whatsappAuthContent: {
    friendly_name: "OTP Verification",
    language: "en",
    types: {
      "whatsapp/authentication": {
        add_security_recommendation: true,
        code_expiration_minutes: 10,
        body: "Your verification code is {{1}}. This code expires in 10 minutes.",
      },
    },
  },
};

// Function to demonstrate content creation
async function demonstrateContentCreation() {
  console.log("📝 Content Creation Examples\n");

  // Example 1: Text Content
  console.log("1️⃣  Text Content Example:");
  console.log("JSON Payload:");
  console.log(JSON.stringify(contentExamples.textContent, null, 2));

  if (hasCredentials) {
    try {
      const textContent = await client.content.v1.contents.create(
        contentExamples.textContent
      );
      console.log("✅ Created Content SID:", textContent.sid);
    } catch (error) {
      console.log("❌ Error:", error.message);
    }
  }
  console.log("\n" + "─".repeat(80) + "\n");

  // Example 2: Quick Reply Content
  console.log("2️⃣  Quick Reply Content Example:");
  console.log("JSON Payload:");
  console.log(JSON.stringify(contentExamples.quickReplyContent, null, 2));

  if (hasCredentials) {
    try {
      const quickReplyContent = await client.content.v1.contents.create(
        contentExamples.quickReplyContent
      );
      console.log("✅ Created Content SID:", quickReplyContent.sid);
    } catch (error) {
      console.log("❌ Error:", error.message);
    }
  }
  console.log("\n" + "─".repeat(80) + "\n");

  // Example 3: Card Content
  console.log("3️⃣  Card Content Example:");
  console.log("JSON Payload:");
  console.log(JSON.stringify(contentExamples.cardContent, null, 2));

  if (hasCredentials) {
    try {
      const cardContent = await client.content.v1.contents.create(
        contentExamples.cardContent
      );
      console.log("✅ Created Content SID:", cardContent.sid);
    } catch (error) {
      console.log("❌ Error:", error.message);
    }
  }
  console.log("\n" + "─".repeat(80) + "\n");
}

// Function to demonstrate content listing and filtering
async function demonstrateContentListing() {
  console.log("📋 Content Listing Examples\n");

  // Using Content API v1
  console.log("Content API v1 - Basic Listing:");
  if (hasCredentials) {
    try {
      const contents = await client.content.v1.contents.list({ limit: 5 });
      console.log(`Found ${contents.length} content items:`);
      contents.forEach((content) => {
        console.log(`- ${content.friendlyName} (${content.sid})`);
      });
    } catch (error) {
      console.log("❌ Error:", error.message);
    }
  } else {
    console.log("// List content items");
    console.log(
      "const contents = await client.content.v1.contents.list({ limit: 5 });"
    );
  }
  console.log("\n");

  // Using Content API v2 with advanced filtering
  console.log("Content API v2 - Advanced Filtering:");
  if (hasCredentials) {
    try {
      const v2Contents = await client.content.v2.contents.list({
        sortByDate: "desc",
        language: ["en"],
        contentType: ["twilio/text"],
        limit: 5,
      });
      console.log(`Found ${v2Contents.length} filtered content items:`);
      v2Contents.forEach((content) => {
        console.log(`- ${content.friendlyName} (${content.language})`);
      });
    } catch (error) {
      console.log("❌ Error:", error.message);
    }
  } else {
    console.log("// List content with filtering");
    console.log("const contents = await client.content.v2.contents.list({");
    console.log('  sortByDate: "desc",');
    console.log('  language: ["en"],');
    console.log('  contentType: ["twilio/text"],');
    console.log("  limit: 5");
    console.log("});");
  }
  console.log("\n" + "─".repeat(80) + "\n");
}

// Function to demonstrate error handling
function demonstrateErrorHandling() {
  console.log("⚠️  Error Handling Examples\n");

  console.log("Example with try/catch:");
  console.log(`
try {
  const content = await client.content.v1.contents.create({
    friendly_name: "Test Content",
    language: "en",
    types: {
      "twilio/text": {
        body: "Test message"
      }
    }
  });
  console.log('Content created:', content.sid);
} catch (error) {
  console.error('Error creating content:', error.message);
  
  // Handle specific error codes
  switch (error.code) {
    case 20001:
      console.error('Authentication failed');
      break;
    case 21603:
      console.error('Invalid content format');
      break;
    case 21604:
      console.error('Content validation failed');
      break;
    default:
      console.error('Unexpected error occurred');
  }
}
  `);

  console.log("Example with callbacks:");
  console.log(`
client.content.v1.contents.create(contentData, (error, content) => {
  if (error) {
    console.error('Error:', error.message);
    console.error('Error Code:', error.code);
  } else {
    console.log('Content SID:', content.sid);
  }
});
  `);

  console.log("\n" + "─".repeat(80) + "\n");
}

// Function to show all content type examples
function showAllContentTypes() {
  console.log("🎨 All Content Type Examples\n");

  Object.entries(contentExamples).forEach(([name, payload], index) => {
    console.log(
      `${index + 1}. ${name
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())}:`
    );
    console.log(JSON.stringify(payload, null, 2));
    console.log("\n" + "─".repeat(40) + "\n");
  });
}

// Main execution
async function main() {
  console.log("🚀 Twilio Content API JSON Payload Examples");
  console.log(
    "📚 This script demonstrates various Content API usage patterns\n"
  );

  if (hasCredentials) {
    console.log("✅ Credentials found - will create actual content");
    console.log("🔧 Using Account SID:", process.env.TWILIO_ACCOUNT_SID);
  } else {
    console.log("📖 Demo mode - showing JSON payload examples only");
    console.log(
      "💡 Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to create real content"
    );
  }

  console.log("\n" + "═".repeat(80) + "\n");

  try {
    await demonstrateContentCreation();
    await demonstrateContentListing();
    demonstrateErrorHandling();

    console.log("📚 Key Features of Content API:");
    console.log(
      "• Multiple content types (text, media, cards, carousels, etc.)"
    );
    console.log("• Rich interactive elements (buttons, quick replies, lists)");
    console.log("• Variable substitution for personalization");
    console.log("• WhatsApp-specific content types");
    console.log("• Content approval workflow support");
    console.log("• Enhanced filtering in v2 API");
    console.log("• JSON payload structure validation");
    console.log("• Comprehensive error handling\n");

    console.log("🔗 Documentation Links:");
    console.log("• Content API Docs: https://www.twilio.com/docs/content-api");
    console.log(
      "• Content Types: https://www.twilio.com/docs/content-api/content-types-overview"
    );
    console.log("• Node.js Helper: https://www.twilio.com/docs/libraries/node");
  } catch (error) {
    console.error("❌ Error running examples:", error.message);
  }
}

// Export for reuse
module.exports = {
  contentExamples,
  demonstrateContentCreation,
  demonstrateContentListing,
  demonstrateErrorHandling,
  showAllContentTypes,
};

// Run if called directly
if (require.main === module) {
  main();
}
