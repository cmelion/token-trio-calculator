// src/components/tests/msw-server.ts
import { setupServer } from 'msw/node';
import { handlers } from "@/mocks/handlers.ts";

// Logging configuration
let mswLoggingEnabled = false;

// Set up the server with our test handlers
export const server = setupServer(...handlers);

// Format object for logging with indentation
const formatObject = (obj: unknown) => JSON.stringify(obj, null, 2);

// Format headers for better readability
const formatHeaders = (headers: Headers): Record<string, string> => {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

// Request started event
server.events.on('request:start', ({ request }) => {
  if (!mswLoggingEnabled) return;

  const url = request.url;
  const method = request.method;

  console.log(`\n🔹 MSW INTERCEPTED: ${method} ${url}`);

  // Log request details when applicable
  try {
    if (request.headers) {
      console.log(`  Headers: ${formatObject(formatHeaders(request.headers))}`);
    }

    // For specific API endpoints, log more details
    if (url.includes('/asset/erc20')) {
      console.log(`  Token API request detected: ${url}`);
    }
  } catch (error) {
    console.error(`  Error logging request details: ${error}`);
  }
});

// Request matched handler
server.events.on('request:match', ({ request, requestId }) => {
  if (!mswLoggingEnabled) return;
  console.log(`✅ MSW matched handler: ${request.method} ${request.url} (ID: ${requestId})`);
});

// Unhandled request
server.events.on('request:unhandled', ({ request }) => {
  if (!mswLoggingEnabled) return;
  console.warn(`⚠️ MSW NO HANDLER: ${request.method} ${request.url}`);
});

// Mocked response
server.events.on('response:mocked', async ({ response, request }) => {
  if (!mswLoggingEnabled) return;

  console.log(`📤 MSW RESPONSE: ${request.method} ${request.url} (Status: ${response.status})`);

  try {
    // Clone the response to extract the body without consuming it
    const clonedResponse = response.clone();
    const contentType = response.headers.get('content-type') || '';

    console.log(`  Content-Type: ${contentType}`);

    // Extract and log response body based on content type
    if (contentType.includes('application/json')) {
      const responseBody = await clonedResponse.json();
      console.log(`  Response Body:\n${formatObject(responseBody)}`);
    } else if (contentType.includes('text/')) {
      const responseText = await clonedResponse.text();
      console.log(`  Response Text: ${responseText}`);
    } else if (contentType.includes('image/')) {
      console.log(`  [Image Content]`);
    } else {
      console.log(`  [Response body not shown: ${contentType}]`);
    }

    // Log response headers
    console.log(`  Response Headers:\n${formatObject(formatHeaders(response.headers))}`);
  } catch (error) {
    console.error(`  Error extracting response data: ${error}`);
  }
});

// Export function to enable/disable logging
export const setMswLogging = (enabled: boolean) => {
  mswLoggingEnabled = enabled;
  console.log(`MSW logging ${enabled ? 'enabled' : 'disabled'}`);
};

// Export for use in test setup
export { handlers };