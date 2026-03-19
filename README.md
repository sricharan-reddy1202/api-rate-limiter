# API Rate Limiter (Production-Grade Backend System)

A highly scalable and configurable API Rate Limiter built using **Node.js, Express, and Redis**, supporting multiple rate limiting strategies.

---

## Features

* Multiple Rate Limiting Strategies:

  * Fixed Window
  * Sliding Window
  * Token Bucket
*  Redis-based distributed system
*  Middleware-based integration (Express)
*  Configurable per-route limits
*  Rate limit headers support:

  * X-RateLimit-Limit
  * X-RateLimit-Remaining
  * Retry-After
*  Prevents abuse and DDoS patterns
*  Clean architecture using Strategy Pattern

---

##  Tech Stack

* Node.js
* Express.js
* Redis
* Docker (optional)

---

##  Installation

```bash
git clone https://github.com/sricharan-reddy1202/api-rate-limiter.git
cd api-rate-limiter
npm install
```

---

## Run the Project

```bash
npm run dev
```

---

## Redis Setup

Using Docker:

```bash
docker run -d -p 6379:6379 redis
```

---

##  API Endpoints

### Sliding Window

```
GET /sliding
```

### Token Bucket

```
GET /token
```

### Fixed Window

```
GET /fixed
```

---

##  Example Response Headers

```
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 2
Retry-After: 15
```

---

##  System Design Highlights

* Used Redis for distributed rate limiting
* Implemented atomic operations to avoid race conditions
* Strategy Pattern for flexible algorithm selection
* TTL-based cleanup to prevent memory leaks

---

##  Use Cases

* API Gateway rate limiting
* Login request protection
* Preventing brute-force attacks
* SaaS platform usage control

---

##  Future Enhancements

* User-based rate limiting (JWT/API key)
* Dashboard for monitoring
* Distributed logging system
* Rate limiting per API tier

---

##  Author

**Pinreddy Sricharan Reddy**
