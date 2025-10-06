// Import the main CJS module
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const TwilioSDK = require("../lib/index.js");

// Re-export everything for ESM compatibility
export default TwilioSDK;

// Named exports for better ESM experience
export const Twilio = TwilioSDK.Twilio;
export const jwt = TwilioSDK.jwt;
export const twiml = TwilioSDK.twiml;
export const RequestClient = TwilioSDK.RequestClient;
export const ClientCredentialProviderBuilder = TwilioSDK.ClientCredentialProviderBuilder;
export const OrgsCredentialProviderBuilder = TwilioSDK.OrgsCredentialProviderBuilder;
export const NoAuthCredentialProvider = TwilioSDK.NoAuthCredentialProvider;
export const validateBody = TwilioSDK.validateBody;
export const validateRequest = TwilioSDK.validateRequest;
export const validateRequestWithBody = TwilioSDK.validateRequestWithBody;
export const validateExpressRequest = TwilioSDK.validateExpressRequest;
export const validateIncomingRequest = TwilioSDK.validateIncomingRequest;
export const getExpectedBodyHash = TwilioSDK.getExpectedBodyHash;
export const getExpectedTwilioSignature = TwilioSDK.getExpectedTwilioSignature;
export const webhook = TwilioSDK.webhook;