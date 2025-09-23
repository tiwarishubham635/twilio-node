# Twilio Content API - JSON Payload Examples

This document provides comprehensive examples of using the Twilio Content API with JSON payloads in the Node.js helper library.

## Overview

The Twilio Content API allows you to create rich, structured messaging content that can be sent across multiple channels. Content is created as JSON payloads and can include various content types like text, media, cards, and interactive elements.

## Prerequisites

```javascript
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
```

## Content API Versions

- **v1**: Full featured API with all content types
- **v2**: Enhanced API with additional filtering and sorting capabilities

## Basic Content Creation

### Text Content (`twilio/text`)

The simplest content type for plain text messages.

```javascript
const textContent = await client.content.v1.contents.create({
  friendly_name: "Welcome Message",
  language: "en",
  types: {
    "twilio/text": {
      body: "Welcome to our service! Thank you for signing up."
    }
  }
});

console.log('Content SID:', textContent.sid);
```

**Response:**
```json
{
  "sid": "HXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "account_sid": "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "friendly_name": "Welcome Message",
  "language": "en",
  "date_created": "2023-08-15T10:30:00Z",
  "date_updated": "2023-08-15T10:30:00Z",
  "variables": {},
  "types": {
    "twilio/text": {
      "body": "Welcome to our service! Thank you for signing up."
    }
  },
  "url": "https://content.twilio.com/v1/Content/HXxxxxx",
  "links": {
    "approval_fetch": "https://content.twilio.com/v1/Content/HXxxxxx/ApprovalRequests",
    "approval_create": "https://content.twilio.com/v1/Content/HXxxxxx/ApprovalRequests"
  }
}
```

### Media Content (`twilio/media`)

For sending images, videos, or documents with optional text.

```javascript
const mediaContent = await client.content.v1.contents.create({
  friendly_name: "Product Showcase",
  language: "en",
  types: {
    "twilio/media": {
      body: "Check out our latest product!",
      media: [
        "https://example.com/product-image.jpg",
        "https://example.com/product-brochure.pdf"
      ]
    }
  }
});
```

## Interactive Content Types

### Quick Reply (`twilio/quick-reply`)

Provides buttons for quick responses.

```javascript
const quickReplyContent = await client.content.v1.contents.create({
  friendly_name: "Feedback Request",
  language: "en",
  types: {
    "twilio/quick-reply": {
      body: "How was your experience with us today?",
      actions: [
        {
          type: "QUICK_REPLY",
          title: "😊 Great",
          id: "feedback_great"
        },
        {
          type: "QUICK_REPLY", 
          title: "😐 Okay",
          id: "feedback_okay"
        },
        {
          type: "QUICK_REPLY",
          title: "😞 Poor",
          id: "feedback_poor"
        }
      ]
    }
  }
});
```

### Call to Action (`twilio/call-to-action`)

Includes action buttons for URLs, phone numbers, etc.

```javascript
const callToActionContent = await client.content.v1.contents.create({
  friendly_name: "Contact Support",
  language: "en",
  types: {
    "twilio/call-to-action": {
      body: "Need help? Contact our support team:",
      actions: [
        {
          type: "URL",
          title: "Visit Help Center",
          url: "https://help.example.com"
        },
        {
          type: "PHONE_NUMBER",
          title: "Call Support",
          phone: "+1-555-0123"
        }
      ]
    }
  }
});
```

### List Picker (`twilio/list-picker`)

Creates a menu of selectable options.

```javascript
const listPickerContent = await client.content.v1.contents.create({
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
          description: "Essential features for individuals"
        },
        {
          id: "service_pro",
          item: "Pro Plan", 
          description: "Advanced features for professionals"
        },
        {
          id: "service_enterprise",
          item: "Enterprise Plan",
          description: "Full-featured solution for large organizations"
        }
      ]
    }
  }
});
```

## Rich Content Types

### Card Content (`twilio/card`)

Structured content with title, subtitle, media, and actions.

```javascript
const cardContent = await client.content.v1.contents.create({
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
          url: "https://store.example.com/headphones/premium"
        },
        {
          type: "QUICK_REPLY",
          title: "Add to Cart",
          id: "add_to_cart_headphones"
        }
      ]
    }
  }
});
```

### Carousel Content (`twilio/carousel`)

Multiple cards in a horizontally scrollable view.

```javascript
const carouselContent = await client.content.v1.contents.create({
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
              url: "https://store.example.com/phone"
            }
          ]
        },
        {
          title: "Tablet",
          body: "Perfect for work and entertainment",
          media: "https://example.com/tablet.jpg", 
          actions: [
            {
              type: "URL",
              title: "Learn More",
              url: "https://store.example.com/tablet"
            }
          ]
        }
      ]
    }
  }
});
```

### Location Content (`twilio/location`)

Share location information with recipients.

```javascript
const locationContent = await client.content.v1.contents.create({
  friendly_name: "Store Location",
  language: "en",
  types: {
    "twilio/location": {
      latitude: 37.7749,
      longitude: -122.4194,
      label: "Our San Francisco Store",
      address: "123 Market Street, San Francisco, CA 94103"
    }
  }
});
```

## Content with Variables

Content can include placeholder variables that are replaced when sent.

```javascript
const templateContent = await client.content.v1.contents.create({
  friendly_name: "Personalized Welcome",
  language: "en",
  variables: {
    "1": "customer_name",
    "2": "account_type"
  },
  types: {
    "twilio/text": {
      body: "Hello {{1}}! Welcome to your {{2}} account. We're excited to have you on board!"
    }
  }
});
```

## WhatsApp Specific Content Types

### WhatsApp Authentication (`whatsapp/authentication`)

For OTP and authentication flows on WhatsApp.

```javascript
const whatsappAuthContent = await client.content.v1.contents.create({
  friendly_name: "OTP Verification",
  language: "en",
  types: {
    "whatsapp/authentication": {
      add_security_recommendation: true,
      code_expiration_minutes: 10,
      body: "Your verification code is {{1}}. This code expires in 10 minutes."
    }
  }
});
```

## Using Content API v2

The v2 API provides enhanced filtering and sorting capabilities:

```javascript
// Create content using v2 API
const v2Content = await client.content.v2.contents.create({
  friendly_name: "V2 Text Content",
  language: "en",
  types: {
    "twilio/text": {
      body: "This content was created using the v2 API"
    }
  }
});

// List content with advanced filtering
const contentList = await client.content.v2.contents.list({
  sortByDate: 'desc',
  language: ['en', 'es'],
  contentType: ['twilio/text', 'twilio/media'],
  dateCreatedAfter: new Date('2023-01-01'),
  limit: 20
});
```

## Error Handling

Always implement proper error handling when working with the Content API:

```javascript
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
  console.log('Content created successfully:', content.sid);
} catch (error) {
  console.error('Error creating content:', error.message);
  
  // Handle specific error codes
  if (error.code === 20001) {
    console.error('Authentication failed');
  } else if (error.code === 21603) {
    console.error('Invalid content format');
  } else if (error.code === 21604) {
    console.error('Content validation failed');
  }
}
```

## Callback Pattern

All Content API methods also support callback patterns:

```javascript
client.content.v1.contents.create({
  friendly_name: "Callback Example",
  language: "en",
  types: {
    "twilio/text": {
      body: "This uses the callback pattern"
    }
  }
}, (error, content) => {
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Content SID:', content.sid);
  }
});
```

## Fetching and Managing Content

### Retrieve Content

```javascript
// Fetch a specific content item
const content = await client.content.v1.contents(contentSid).fetch();
console.log('Content details:', JSON.stringify(content.toJSON(), null, 2));

// List all content
const contents = await client.content.v1.contents.list({ limit: 10 });
contents.forEach(content => {
  console.log(`${content.friendlyName}: ${content.sid}`);
});
```

### Delete Content

```javascript
try {
  await client.content.v1.contents(contentSid).remove();
  console.log('Content deleted successfully');
} catch (error) {
  console.error('Error deleting content:', error.message);
}
```

## Content Approval Workflow

Some content types may require approval before use:

```javascript
// Check approval status
const approvalStatus = await client.content.v1.contents(contentSid).approvalFetch.list();
console.log('Approval status:', approvalStatus);

// Submit for approval
const approvalRequest = await client.content.v1.contents(contentSid).approvalCreate.create({
  name: "My Content Approval Request",
  category: "UTILITY"
});
```

## Best Practices

1. **Content Validation**: Always validate your JSON structure before submission
2. **Error Handling**: Implement comprehensive error handling for production use
3. **Content Reuse**: Create reusable content templates with variables
4. **Version Selection**: Use v2 API for enhanced filtering and sorting capabilities
5. **Resource Management**: Clean up unused content to avoid quota limits
6. **Testing**: Test content with different channel combinations before production

## API Documentation Links

- [Twilio Content API Documentation](https://www.twilio.com/docs/content-api)
- [Content Types Overview](https://www.twilio.com/docs/content-api/content-types-overview)
- [WhatsApp Content Templates](https://www.twilio.com/docs/whatsapp/tutorial/send-whatsapp-notification-messages-templates)

## Support

For additional help with the Content API:
1. Check the [Twilio Console](https://console.twilio.com) for your account limits
2. Review the [API documentation](https://www.twilio.com/docs/content-api) for detailed specifications
3. Use the [Twilio Support](https://support.twilio.com) for technical assistance