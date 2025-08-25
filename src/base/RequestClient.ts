import { HttpMethod } from "../interfaces";
import * as fs from "fs";
import * as HttpsProxyAgent from "https-proxy-agent";
import qs from "qs";
import * as https from "https";
import * as http from "http";
import { URL } from "url";
import Response from "../http/response";
import Request, {
  Headers,
  RequestOptions as LastRequestOptions,
} from "../http/request";
import AuthStrategy from "../auth_strategy/AuthStrategy";
import ValidationToken from "../jwt/validation/ValidationToken";
import { ValidationClientOptions } from "./ValidationClient";

const DEFAULT_CONTENT_TYPE = "application/x-www-form-urlencoded";
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_INITIAL_RETRY_INTERVAL_MILLIS = 100;
const DEFAULT_MAX_RETRY_DELAY = 3000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_MAX_SOCKETS = 20;
const DEFAULT_MAX_FREE_SOCKETS = 5;
const DEFAULT_MAX_TOTAL_SOCKETS = 100;

interface BackoffRequestConfig {
  /**
   * Current retry attempt performed by the HTTP client
   */
  retryCount?: number;
  method: HttpMethod;
  url: string;
  headers?: Headers;
  data?: any;
  params?: object;
  timeout?: number;
}

interface HttpRequestConfig {
  method: HttpMethod;
  url: string;
  headers?: Headers;
  data?: any;
  params?: object;
  timeout?: number;
  maxRedirects?: number;
  proxy?: boolean;
}

interface HttpResponse<T = any> {
  status: number;
  statusText: string;
  headers: any;
  data: T;
}

interface ExponentialBackoffResponseHandlerOptions {
  /**
   * Maximum retry delay in milliseconds
   */
  maxIntervalMillis: number;
  /**
   * Maximum number of request retries
   */
  maxRetries: number;
}

function getExponentialBackoffResponseHandler(
  httpClient: (config: HttpRequestConfig) => Promise<HttpResponse>,
  opts: ExponentialBackoffResponseHandlerOptions
) {
  const maxIntervalMillis = opts.maxIntervalMillis;
  const maxRetries = opts.maxRetries;

  return function (res: HttpResponse, config: BackoffRequestConfig): Promise<HttpResponse> | HttpResponse {
    if (res.status !== 429) {
      return res;
    }

    const retryCount = (config.retryCount || 0) + 1;
    if (retryCount <= maxRetries) {
      config.retryCount = retryCount;
      const baseDelay = Math.min(
        maxIntervalMillis,
        DEFAULT_INITIAL_RETRY_INTERVAL_MILLIS * Math.pow(2, retryCount)
      );
      const delay = Math.floor(baseDelay * Math.random()); // Full jitter backoff

      return new Promise((resolve: (value: Promise<HttpResponse>) => void) => {
        setTimeout(() => resolve(httpClient(config)), delay);
      });
    }
    return res;
  };
}

class RequestClient {
  defaultTimeout: number;
  agent: https.Agent | HttpsProxyAgent.HttpsProxyAgent;
  lastResponse?: Response<any>;
  lastRequest?: Request<any>;
  autoRetry: boolean;
  maxRetryDelay: number;
  maxRetries: number;
  keepAlive: boolean;
  validationClient?: ValidationClientOptions;
  defaultHeaders: Headers;
  // Compatibility property for tests
  axios: {
    defaults: {
      headers: {
        post: Headers;
      };
      httpsAgent: https.Agent | HttpsProxyAgent.HttpsProxyAgent;
    };
  };

  /**
   * Make http request
   * @param opts - The options passed to https.Agent
   * @param opts.timeout - https.Agent timeout option. Used as the socket timeout, AND as the default request timeout.
   * @param opts.keepAlive - https.Agent keepAlive option
   * @param opts.keepAliveMsecs - https.Agent keepAliveMsecs option
   * @param opts.maxSockets - https.Agent maxSockets option
   * @param opts.maxTotalSockets - https.Agent maxTotalSockets option
   * @param opts.maxFreeSockets - https.Agent maxFreeSockets option
   * @param opts.scheduling - https.Agent scheduling option
   * @param opts.autoRetry - Enable auto-retry requests with exponential backoff on 429 responses. Defaults to false.
   * @param opts.maxRetryDelay - Max retry delay in milliseconds for 429 Too Many Request response retries. Defaults to 3000.
   * @param opts.maxRetries - Max number of request retries for 429 Too Many Request responses. Defaults to 3.
   * @param opts.validationClient - Validation client for PKCV
   */
  constructor(opts?: RequestClient.RequestClientOptions) {
    opts = opts || {};
    this.defaultTimeout = opts.timeout || DEFAULT_TIMEOUT;
    this.autoRetry = opts.autoRetry || false;
    this.maxRetryDelay = opts.maxRetryDelay || DEFAULT_MAX_RETRY_DELAY;
    this.maxRetries = opts.maxRetries || DEFAULT_MAX_RETRIES;
    this.keepAlive = opts.keepAlive !== false;
    this.validationClient = opts.validationClient;

    // construct an https agent
    let agentOpts: https.AgentOptions = {
      timeout: this.defaultTimeout,
      keepAlive: this.keepAlive,
      keepAliveMsecs: opts.keepAliveMsecs,
      maxSockets: opts.maxSockets || DEFAULT_MAX_SOCKETS, // no of sockets open per host
      maxTotalSockets: opts.maxTotalSockets || DEFAULT_MAX_TOTAL_SOCKETS, // no of sockets open in total
      maxFreeSockets: opts.maxFreeSockets || DEFAULT_MAX_FREE_SOCKETS, // no of free sockets open per host
      scheduling: opts.scheduling,
      ca: opts.ca,
    };

    // sets https agent CA bundle if defined in CA bundle filepath env variable
    if (process.env.TWILIO_CA_BUNDLE !== undefined) {
      if (agentOpts.ca === undefined) {
        agentOpts.ca = fs.readFileSync(process.env.TWILIO_CA_BUNDLE);
      }
    }

    if (process.env.HTTP_PROXY) {
      // Note: if process.env.HTTP_PROXY is set, we're not able to apply the given
      // socket timeout. See: https://github.com/TooTallNate/node-https-proxy-agent/pull/96
      this.agent = new HttpsProxyAgent.HttpsProxyAgent(process.env.HTTP_PROXY);
    } else {
      this.agent = new https.Agent(agentOpts);
    }

    // Set default headers
    this.defaultHeaders = {
      "Content-Type": DEFAULT_CONTENT_TYPE,
    };

    // Compatibility object for tests
    this.axios = {
      defaults: {
        headers: {
          post: this.defaultHeaders,
        },
        httpsAgent: this.agent,
      },
    };
  }

  private makeHttpRequest(config: HttpRequestConfig): Promise<HttpResponse> {
    return new Promise((resolve, reject) => {
      let url: URL;
      try {
        // Try to parse as a full URL first
        url = new URL(config.url);
      } catch (e) {
        // If it fails, assume it's a path and add a default protocol
        url = new URL('https://' + config.url);
      }
      
      const isHttps = url.protocol === 'https:';
      const httpModule = isHttps ? https : http;
      
      const options: https.RequestOptions | http.RequestOptions = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: config.method.toUpperCase(),
        headers: config.headers || {},
        timeout: config.timeout || this.defaultTimeout,
      };

      // Only set agent for HTTPS requests or when using proxy
      if (isHttps || this.agent instanceof HttpsProxyAgent.HttpsProxyAgent) {
        (options as https.RequestOptions).agent = this.agent;
      }

      const req = httpModule.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          let parsedData: any = data;
          
          // Try to parse JSON response
          try {
            if (res.headers['content-type']?.includes('application/json')) {
              parsedData = JSON.parse(data);
            }
          } catch (e) {
            // Keep original data if JSON parsing fails
          }
          
          resolve({
            status: res.statusCode || 0,
            statusText: res.statusMessage || '',
            headers: res.headers,
            data: parsedData,
          });
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error(`Request timeout after ${config.timeout || this.defaultTimeout}ms`));
      });

      // Write request data if present
      if (config.data) {
        if (typeof config.data === 'string') {
          req.write(config.data);
        } else {
          req.write(JSON.stringify(config.data));
        }
      }

      req.end();
    });
  }

  /**
   * Make http request
   * @param opts - The options argument
   * @param opts.method - The http method
   * @param opts.uri - The request uri
   * @param opts.username - The username used for auth
   * @param opts.password - The password used for auth
   * @param opts.authStrategy - The authStrategy for API call
   * @param opts.headers - The request headers
   * @param opts.params - The request params
   * @param opts.data - The request data
   * @param opts.timeout - The request timeout in milliseconds (default 30000)
   * @param opts.allowRedirects - Should the client follow redirects
   * @param opts.forever - Set to true to use the forever-agent
   * @param opts.logLevel - Show debug logs
   */
  async request<TData>(
    opts: RequestClient.RequestOptions<TData>
  ): Promise<Response<TData>> {
    if (!opts.method) {
      throw new Error("http method is required");
    }

    if (!opts.uri) {
      throw new Error("uri is required");
    }

    let headers = { ...(opts.headers || {}) };

    // Only add default Content-Type for POST requests or when explicitly set
    if ((opts.method.toLowerCase() === 'post' || opts.headers?.["Content-Type"]) && !headers["Content-Type"]) {
      headers["Content-Type"] = DEFAULT_CONTENT_TYPE;
    }

    if (!headers.Connection && !headers.connection)
      headers.Connection = this.keepAlive ? "keep-alive" : "close";

    let auth = undefined;

    if (opts.username && opts.password) {
      auth = Buffer.from(opts.username + ":" + opts.password).toString(
        "base64"
      );
      headers.Authorization = "Basic " + auth;
    } else if (opts.authStrategy) {
      headers.Authorization = await opts.authStrategy.getAuthString();
    }

    // Apply validation client header if configured
    if (this.validationClient) {
      try {
        const config = {
          method: opts.method,
          url: opts.uri,
          headers: headers,
          data: opts.data,
        };
        headers["Twilio-Client-Validation"] = new ValidationToken(
          this.validationClient
        ).fromHttpRequest(config);
      } catch (err) {
        console.log("Error creating Twilio-Client-Validation header:", err);
        throw err;
      }
    }

    let url = opts.uri;
    
    // Add query parameters to URL
    if (opts.params) {
      const queryString = qs.stringify(opts.params, { arrayFormat: "repeat" });
      url += (url.includes('?') ? '&' : '?') + queryString;
    }

    const config: HttpRequestConfig = {
      timeout: opts.timeout || this.defaultTimeout,
      url: url,
      method: opts.method,
      headers: headers,
    };

    // Handle request data
    if (opts.data) {
      if (headers["Content-Type"] === "application/x-www-form-urlencoded") {
        config.data = qs.stringify(opts.data, { arrayFormat: "repeat" });
      } else if (headers["Content-Type"] === "application/json") {
        config.data = opts.data;
      } else {
        config.data = opts.data;
      }
    }

    const requestOptions: LastRequestOptions<TData> = {
      method: opts.method,
      url: opts.uri,
      auth: auth,
      params: opts.params,
      data: opts.data,
      headers: headers,
    };

    if (opts.logLevel === "debug") {
      this.logRequest(requestOptions);
    }

    const _this = this;
    this.lastResponse = undefined;
    this.lastRequest = new Request(requestOptions);

    // Make the HTTP request with optional retry logic
    const makeRequest = async (requestConfig: BackoffRequestConfig): Promise<HttpResponse> => {
      const response = await this.makeHttpRequest(requestConfig);
      
      if (this.autoRetry) {
        const retryHandler = getExponentialBackoffResponseHandler(
          (config) => this.makeHttpRequest(config),
          {
            maxIntervalMillis: this.maxRetryDelay,
            maxRetries: this.maxRetries,
          }
        );
        
        const retryResult = retryHandler(response, requestConfig);
        if (retryResult instanceof Promise) {
          return await retryResult;
        }
        return retryResult;
      }
      
      return response;
    };

    try {
      const response = await makeRequest({ ...config, retryCount: 0 });
      
      if (opts.logLevel === "debug") {
        console.log(`response.statusCode: ${response.status}`);
        console.log(`response.headers: ${JSON.stringify(response.headers)}`);
      }
      
      _this.lastResponse = new Response(
        response.status,
        response.data,
        response.headers
      );
      
      return {
        statusCode: response.status,
        body: response.data,
        headers: response.headers,
      };
    } catch (error) {
      _this.lastResponse = undefined;
      throw error;
    }
  }

  filterLoggingHeaders(headers: Headers) {
    return Object.keys(headers).filter((header) => {
      return !"authorization".includes(header.toLowerCase());
    });
  }

  /**
   * ValidationInterceptor adds the Twilio-Client-Validation header to the request
   * @param validationClient - The validation client for PKCV
   * @deprecated This method is kept for backward compatibility. Validation is now handled inline in the request method.
   */
  validationInterceptor(validationClient: ValidationClientOptions) {
    return function (config: any) {
      config.headers = config.headers || {};
      try {
        config.headers["Twilio-Client-Validation"] = new ValidationToken(
          validationClient
        ).fromHttpRequest(config);
      } catch (err) {
        console.log("Error creating Twilio-Client-Validation header:", err);
        throw err;
      }
      return config;
    };
  }

  private logRequest<TData>(options: LastRequestOptions<TData>) {
    console.log("-- BEGIN Twilio API Request --");
    console.log(`${options.method} ${options.url}`);

    if (options.params) {
      console.log("Querystring:");
      console.log(options.params);
    }

    if (options.headers) {
      console.log("Headers:");
      const filteredHeaderKeys = this.filterLoggingHeaders(
        options.headers as Headers
      );
      filteredHeaderKeys.forEach((header) =>
        console.log(`${header}: ${options.headers?.header}`)
      );
    }

    console.log("-- END Twilio API Request --");
  }
}

namespace RequestClient {
  export interface RequestOptions<TData = any, TParams = object> {
    /**
     * The HTTP method
     */
    method: HttpMethod;
    /**
     * The request URI
     */
    uri: string;
    /**
     * The username used for auth
     */
    username?: string;
    /**
     * The password used for auth
     */
    password?: string;
    /**
     * The AuthStrategy for API Call
     */
    authStrategy?: AuthStrategy;
    /**
     * The request headers
     */
    headers?: Headers;
    /**
     * The object of params added as query string to the request
     */
    params?: TParams;
    /**
     * The form data that should be submitted
     */
    data?: TData;
    /**
     * The request timeout in milliseconds
     */
    timeout?: number;
    /**
     * Should the client follow redirects
     */
    allowRedirects?: boolean;
    /**
     * Set to true to use the forever-agent
     */
    forever?: boolean;
    /**
     * Set to 'debug' to enable debug logging
     */
    logLevel?: string;
  }

  export interface RequestClientOptions {
    /**
     * A timeout in milliseconds. This will be used as the HTTPS agent's socket
     * timeout, AND as the default request timeout.
     */
    timeout?: number;
    /**
     * https.Agent keepAlive option
     */
    keepAlive?: boolean;
    /**
     * https.Agent keepAliveMSecs option
     */
    keepAliveMsecs?: number;
    /**
     * https.Agent maxSockets option
     */
    maxSockets?: number;
    /**
     * https.Agent maxTotalSockets option
     */
    maxTotalSockets?: number;
    /**
     * https.Agent maxFreeSockets option
     */
    maxFreeSockets?: number;
    /**
     * https.Agent scheduling option
     */
    scheduling?: "fifo" | "lifo" | undefined;
    /**
     * The private CA certificate bundle (if private SSL certificate)
     */
    ca?: string | Buffer;
    /**
     * Enable auto-retry with exponential backoff when receiving 429 Errors from
     * the API. Disabled by default.
     */
    autoRetry?: boolean;
    /**
     * Maximum retry delay in milliseconds for 429 Error response retries.
     * Defaults to 3000.
     */
    maxRetryDelay?: number;
    /**
     * Maximum number of request retries for 429 Error responses. Defaults to 3.
     */
    maxRetries?: number;
    /**
     * Validation client for Public Key Client Validation
     * On setting this with your credentials, Twilio validates:
     <ul>
        <li>The request comes from a sender who is in control of the private key.</li>
        <li>The message has not been modified in transit.</li>
     </ul>
     * That the message has not been modified in transit.
     * Refer our doc for details - https://www.twilio.com/docs/iam/pkcv
     */
    validationClient?: ValidationClientOptions;
  }
}
export = RequestClient;
