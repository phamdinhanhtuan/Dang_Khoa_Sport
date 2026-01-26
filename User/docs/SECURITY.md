# Security Implementation

This document outlines the security measures implemented in the Đăng Khoa Sport application.

## 1. Network Security
- **Nginx Reverse Proxy**: Hides the backend infrastructure and handles SSL termination (when configured).
- **Helmet**: Sets various HTTP headers to secure the app:
  - `Content-Security-Policy`: Restricts sources of scripts/images.
  - `X-Frame-Options`: Prevents clickjacking.
  - `X-XSS-Protection`: Enables browser XSS filtering.

## 2. Authentication & Authorization
- **JWT (JSON Web Tokens)**: Stateless authentication mechanism.
  - Tokens signed with strong secret.
  - Expiration times enforced.
  - Stored in HTTP-only cookies to prevent access via client-side scripts.
- **Password Hashing**: `bcryptjs` is used with salts to hash passwords before storage.
- **Role-Based Access Control (RBAC)**:
  - `protect` middleware: Verifies JWT.
  - `restrictTo` middleware: Checks user role (`admin`, `user`) before granting access to sensitive routes.

## 3. Input Validation & Sanitization
- **Mongo/NoSQL Injection**: `express-mongo-sanitize` strips keys containing `$` or `.`.
- **XSS (Cross-Site Scripting)**: `xss-clean` sanitizes user input to prevent script injection.
- **Parameter Pollution**: `hpp` protects against HTTP Parameter Pollution attacks by whitelisting specific query parameters.
- **Rate Limiting**: `express-rate-limit` restricts API calls from a single IP to prevent brute-force and DoS attacks (100 reqs/hour default).

## 4. Data Protection
- **Environment Variables**: Sensitive keys (DB URI, Secrets) are stored in `.env` and never committed to version control.
- **CORS**: `cors` middleware configured to restrict cross-origin access.

## 5. Future Recommendations available for Enterprise
- **SSL/TLS**: Enforce HTTPS in production via Nginx / Certbot.
- **2FA**: Implement Two-Factor Authentication for Admin accounts.
- **Audit Logs**: Persist admin action logs to an external immutable storage.
