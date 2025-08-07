export const StatusCode = {
  Accepted: 202, // Accepted
  BadGateway: 502, // Bad Gateway
  BadRequest: 400, // Bad Request

  Conflict: 409, // Conflict
  Continue: 100, // Continue
  Created: 201, // Created
  Forbidden: 403, // Forbidden
  Found: 302, // Found

  GatewayTimeout: 504, // Gateway Timeout
  Gone: 410, // Gone
  InsufficientStorage: 507, // Insufficient Storage
  InternalServerError: 500, // Internal Server Error
  MailboxUnavailable: 550, // mailbox available

  MethodNotAllowed: 405, // Method Not Allowed
  MovedPermanently: 301, // Moved Permanently
  NoContent: 204, // No Content
  NotFound: 404, // Not Found
  NotImplemented: 501, // Not Implemented
  NotModified: 304, // Not Modified
  OK: 200, // OK
  Processing: 102, // Processing
  RequestTimeout: 408, // Request Timeout
  ResetContent: 205, // Reset Content
  SeeOther: 303, // See Other

  ServiceUnavailable: 503, // Service Unavailable
  SwitchingProtocols: 101, // Switching Protocols
  TemporaryRedirect: 307, // Temporary Redirect
  TooManyRequests: 429, // Too Many Requests
  Unauthorized: 401, // Unauthorized
  UnprocessableEntity: 422, // Unprocessable Entity
  UnsupportedMediaType: 415, // Unsupported Media Type
} as const;
export type StatusCode = (typeof StatusCode)[keyof typeof StatusCode];
