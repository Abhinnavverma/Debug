export type Log = {
  service: string;
  content: string;
};

export type Explanation = {
  reasoning: string;

  redHerrings: string;
  seniorIntuition: string;
};

export type Problem = {
  id: string;
  title: string;
  description: string;
  systemOverview: string;
  logs: Log[];
  evaluationRubric: string;
  explanation: Explanation;
  tags: string[];
};

export const problems: Problem[] = [
  {
    id: 'auth-latency',
    title: 'Authentication Service Latency',
    description:
      'Users are reporting intermittent slow login times, sometimes leading to timeouts. Investigate the authentication service and its dependencies to find the root cause of the latency.',
    systemOverview:
      'The system consists of a public-facing API Gateway, an Authentication Service, a User Database, and a Caching Service. The Auth Service is responsible for verifying user credentials against the User Database and generating session tokens. The Caching service is used to cache session tokens.',
    logs: [
      {
        service: 'api-gateway',
        content: `
[2023-10-27 10:00:01] INFO: Request received for /login
[2023-10-27 10:00:01] INFO: Forwarding request to auth-service
[2023-10-27 10:00:08] ERROR: Upstream service request timed out after 7000ms for /login
[2023-10-27 10:01:15] INFO: Request received for /login
[2023-10-27 10:01:15] INFO: Forwarding request to auth-service
[2023-10-27 10:01:16] INFO: Request successful for /login
[2023-10-27 10:02:30] INFO: Request received for /status - successful
`,
      },
      {
        service: 'auth-service',
        content: `
[2023-10-27 10:00:01] INFO: Login request for user 'testuser1'
[2023-10-27 10:00:01] INFO: Querying user database for 'testuser1'
[2023-10-27 10:00:07] WARN: Database query took 6000ms
[2023-10-27 10:00:07] INFO: User 'testuser1' authenticated successfully
[2023-10-27 10:01:15] INFO: Login request for user 'testuser2'
[2023-10-27 10:01:15] INFO: Cache hit for user 'testuser2' session token.
[2023-10-27 10:01:15] INFO: User 'testuser2' authenticated successfully
[2023-10-27 10:03:00] WARN: Cache service connection failure. Falling back to DB.
`,
      },
      {
        service: 'user-database',
        content: `
[2023-10-27 10:00:01] INFO: Connection received from auth-service
[2023-10-27 10:00:01] INFO: Executing query: SELECT * FROM users WHERE username = 'testuser1'
[2023-10-27 10:00:07] INFO: Query executed in 5998ms. 1 row returned.
[2023-10-27 10:00:07] INFO: optimizer_search_depth=0
[2023-10-27 10:00:07] WARNING: Query executed without index. Full table scan performed on 'users' table.
[2023-10-27 10:01:15] INFO: Connection received from auth-service
[2023-10-27 10:01:15] INFO: Executing query: SELECT * FROM users WHERE username = 'testuser2'
[2023-10-27 10:01:15] INFO: Query executed in 50ms. 1 row returned.
[2023-10-27 10:04:01] ERROR: Connection refused: too many connections.
`,
      },
    ],
    evaluationRubric:
      'Candidate should identify the slow database query as the root cause. Bonus points for mentioning the lack of index on the `users` table as the reason for the slow query.',
    explanation: {
      reasoning:
        "The root cause is a slow database query in the 'user-database'. The log `WARNING: Query executed without index. Full table scan performed on 'users' table.` is the key signal. This causes the `auth-service` to wait for 6 seconds, which in turn causes the `api-gateway` to time out.",
      redHerrings:
        "The problem is intermittent. This might suggest a network issue or a problem with a specific service instance. The 'too many connections' error or 'Cache service connection failure' are meant to be distractors. While they are issues to be noted, the primary cause of the timeout is the unindexed query.",
      seniorIntuition:
        "A senior engineer would immediately suspect a database issue when seeing a high, consistent latency number like 6000ms. They would check database logs for slow query warnings or use a database monitoring tool to inspect query performance. The lack of an index on a frequently queried column like 'username' is a common and critical performance bug.",
    },
    tags: ['database', 'performance', 'authentication'],
  },
  {
    id: 'image-processor-oom',
    title: 'Image Processor OOM Errors',
    description:
      'An image processing service is crashing with Out of Memory (OOM) errors. This happens sporadically, but seems to be related to high-resolution image uploads. Find the memory leak.',
    systemOverview:
      'A web application allows users to upload images. Uploaded images are sent to a queue. An "Image Processor" service picks up jobs from the queue, resizes the images into several formats (thumbnail, medium, large), and saves them to a cloud storage bucket.',
    logs: [
      {
        service: 'image-processor',
        content: `
[2023-11-01 14:20:05] INFO: New job received. Image: 'large-image-a.jpg', size: 15MB.
[2023-11-01 14:20:05] INFO: Starting processing for 'large-image-a.jpg'.
[2023-11-01 14:20:06] INFO: Reading image into memory.
[2023-11-01 14:20:08] INFO: Resizing to thumbnail.
[2023-11-01 14:20:09] INFO: Resizing to medium.
[2023-11-01 14:20:12] INFO: Resizing to large.
[2023-11-01 14:20:13] INFO: Processing complete for 'large-image-a.jpg'.
[2023-11-01 14:21:00] INFO: New job received. Image: 'small-image-c.png', size: 1MB.
[2023-11-01 14:21:01] INFO: Processing complete for 'small-image-c.png'.
[2023-11-01 14:22:10] INFO: New job received. Image: 'huge-image-b.tiff', size: 150MB.
[2023-11-01 14:22:11] INFO: Starting processing for 'huge-image-b.tiff'.
[2023-11-01 14:22:12] INFO: Reading image into memory.
[2023-11-01 14:22:15] WARN: Cloud storage latency detected. Upload may be slow.
[2023-11-01 14:22:18] INFO: Resizing to thumbnail.
[2023-11-01 14:22:25] INFO: Resizing to medium.
[2023-11-01 14:22:35] FATAL: Process terminating due to Out of Memory.
`,
      },
      {
        service: 'application-metrics',
        content: `
[2023-11-01 14:20:00] INFO: image-processor-instance-1 | Memory Usage: 128MB / 512MB
[2023-11-01 14:20:10] INFO: image-processor-instance-1 | Memory Usage: 256MB / 512MB
[2023-11-01 14:20:14] INFO: image-processor-instance-1 | Memory Usage: 130MB / 512MB
[2023-11-01 14:21:05] INFO: image-processor-instance-1 | Memory Usage: 130MB / 512MB
[2023-11-01 14:22:00] INFO: image-processor-instance-1 | Memory Usage: 129MB / 512MB
[2023-11-01 14:22:15] INFO: image-processor-instance-1 | Memory Usage: 480MB / 512MB
[2023-11-01 14:22:20] INFO: image-processor-instance-1 | Memory Usage: 495MB / 512MB
[2023-11-01 14:22:30] INFO: image-processor-instance-1 | Memory Usage: 510MB / 512MB
`,
      },
      {
        service: 'queue-service',
        content: `
[2023-11-01 14:20:04] INFO: Message sent to queue: { image: 'large-image-a.jpg' }
[2023-11-01 14:20:05] INFO: Message received by consumer: 'image-processor-instance-1'
[2023-11-01 14:20:14] INFO: Message acknowledged: { image: 'large-image-a.jpg' }
[2023-11-01 14:21:00] INFO: Message sent to queue: { image: 'small-image-c.png' }
[2023-11-01 14:21:00] INFO: Message received by consumer: 'image-processor-instance-1'
[2023-11-01 14:21:02] INFO: Message acknowledged: { image: 'small-image-c.png' }
[2023-11-01 14:22:09] INFO: Message sent to queue: { image: 'huge-image-b.tiff' }
[2023-11-01 14:22:10] INFO: Message received by consumer: 'image-processor-instance-1'
`,
      },
    ],
    evaluationRubric:
      'Candidate must identify that loading the entire image into memory before resizing is the issue, especially for large files. Correct solution involves streaming the image or using a library that processes it in chunks.',
    explanation: {
      reasoning:
        "The 'image-processor' log shows it reads the entire image into memory. The 'application-metrics' log confirms this: memory usage spikes dramatically when processing the 150MB TIFF file, exceeding the 512MB limit and causing the OOM crash. The process for the smaller 15MB file completes successfully, and memory is reclaimed, indicating it's not a classic leak but a resource exhaustion problem.",
      redHerrings:
        "The term 'memory leak' in the description might mislead one to look for un-freed resources after a job is done. The 'Cloud storage latency' warning is also a distraction. The metrics show memory usage returning to normal after the successful job, pointing away from a traditional leak and towards resource exhaustion during processing.",
      seniorIntuition:
        'A senior developer would be wary of any process that loads an entire user-provided file into memory without constraints. The first thought would be to check how the image is being read and processed. The solution is almost always to use streams or chunked processing for large files to keep memory usage predictable and low, regardless of input file size.',
    },
    tags: ['memory', 'performance', 'media', 'backend'],
  },
  {
    id: 'payment-cascade',
    title: 'Payment Service Cascade Failure',
    description:
      'Orders are failing intermittently during checkout. The payment service is returning 500 errors, but only for some users. Customer support is overwhelmed with complaints about failed purchases.',
    systemOverview:
      'The e-commerce platform has an Order Service that calls a Payment Gateway Service, which in turn calls a third-party payment processor. A Circuit Breaker sits between the Payment Gateway and the external processor. There is also a Notification Service that sends order confirmation emails.',
    logs: [
      {
        service: 'order-service',
        content: `
[2024-03-15 09:00:12] INFO: Order #ORD-4821 created for user 'alice@example.com'
[2024-03-15 09:00:12] INFO: Calling payment-gateway for Order #ORD-4821, amount: $149.99
[2024-03-15 09:00:13] ERROR: Payment failed for Order #ORD-4821: upstream_error
[2024-03-15 09:00:13] INFO: Order #ORD-4821 status set to FAILED
[2024-03-15 09:01:30] INFO: Order #ORD-4822 created for user 'bob@example.com'
[2024-03-15 09:01:30] INFO: Calling payment-gateway for Order #ORD-4822, amount: $29.99
[2024-03-15 09:01:30] INFO: Payment successful for Order #ORD-4822
[2024-03-15 09:01:30] INFO: Order #ORD-4822 status set to CONFIRMED
[2024-03-15 09:02:45] INFO: Order #ORD-4823 created for user 'charlie@example.com'
[2024-03-15 09:02:45] INFO: Calling payment-gateway for Order #ORD-4823, amount: $599.00
[2024-03-15 09:02:46] ERROR: Payment failed for Order #ORD-4823: upstream_error
[2024-03-15 09:03:10] INFO: Order #ORD-4824 created for user 'diana@example.com'
[2024-03-15 09:03:10] INFO: Calling payment-gateway for Order #ORD-4824, amount: $75.50
[2024-03-15 09:03:11] ERROR: Payment failed for Order #ORD-4824: upstream_error
`,
      },
      {
        service: 'payment-gateway',
        content: `
[2024-03-15 09:00:12] INFO: Processing payment for Order #ORD-4821, amount: $149.99
[2024-03-15 09:00:12] INFO: Route: using processor 'stripe-primary'
[2024-03-15 09:00:13] ERROR: Processor 'stripe-primary' returned HTTP 503 Service Unavailable
[2024-03-15 09:00:13] WARN: Circuit breaker for 'stripe-primary' tripped. State: OPEN. Threshold: 5 failures in 60s.
[2024-03-15 09:00:13] ERROR: No fallback processor configured. Returning upstream_error.
[2024-03-15 09:01:30] INFO: Processing payment for Order #ORD-4822, amount: $29.99
[2024-03-15 09:01:30] INFO: Route: using processor 'stripe-primary'
[2024-03-15 09:01:30] INFO: Circuit breaker for 'stripe-primary' state: HALF-OPEN. Allowing probe request.
[2024-03-15 09:01:30] INFO: Processor 'stripe-primary' returned HTTP 200 OK
[2024-03-15 09:01:30] INFO: Circuit breaker for 'stripe-primary' state: CLOSED.
[2024-03-15 09:02:45] INFO: Processing payment for Order #ORD-4823, amount: $599.00
[2024-03-15 09:02:45] INFO: Route: using processor 'stripe-primary'
[2024-03-15 09:02:46] ERROR: Processor 'stripe-primary' returned HTTP 503 Service Unavailable
[2024-03-15 09:02:46] WARN: Circuit breaker for 'stripe-primary' tripped. State: OPEN.
[2024-03-15 09:02:46] ERROR: No fallback processor configured. Returning upstream_error.
[2024-03-15 09:03:10] WARN: Circuit breaker for 'stripe-primary' state: OPEN. Rejecting request immediately.
[2024-03-15 09:03:10] ERROR: No fallback processor configured. Returning upstream_error.
`,
      },
      {
        service: 'notification-service',
        content: `
[2024-03-15 09:01:31] INFO: Sending order confirmation email for Order #ORD-4822 to bob@example.com
[2024-03-15 09:01:32] INFO: Email sent successfully.
[2024-03-15 09:00:14] INFO: Sending order failure email for Order #ORD-4821 to alice@example.com
[2024-03-15 09:00:15] WARN: Email template 'order_failed' has a typo in subject line.
[2024-03-15 09:00:15] INFO: Email sent successfully.
`,
      },
    ],
    evaluationRubric:
      'Candidate should identify that the circuit breaker is opening due to intermittent 503s from the third-party Stripe processor, and that the lack of a fallback payment processor means all requests fail when the circuit opens. The fix is to either add a fallback processor or tune the circuit breaker thresholds. The notification service email typo is a red herring.',
    explanation: {
      reasoning:
        "The payment-gateway logs show the circuit breaker pattern in action. When 'stripe-primary' returns 503 errors, the circuit breaker trips to OPEN state, rejecting all subsequent requests immediately without even trying the processor. When it transitions to HALF-OPEN and a probe request succeeds, it closes again — explaining why some payments work. The core issue is: no fallback processor is configured, so an OPEN circuit = 100% failure.",
      redHerrings:
        "The notification service email template typo is cosmetic and unrelated to payment failures. The varying order amounts might suggest a fraud filter, but the pattern is purely timing-based (circuit state), not amount-based. Bob's $29.99 succeeding while Alice's $149.99 fails is coincidence — it was the HALF-OPEN probe that succeeded.",
      seniorIntuition:
        "A senior engineer would immediately recognize the circuit breaker pattern from the logs and check three things: (1) Is the upstream processor actually down or just flaky? (2) Are the circuit breaker thresholds appropriate? (3) Is there a fallback? The intermittent nature screams circuit breaker or retry logic issues, not a bug in the payment code itself.",
    },
    tags: ['distributed-systems', 'reliability', 'payments', 'circuit-breaker'],
  },
  {
    id: 'k8s-crashloop',
    title: 'Kubernetes CrashLoopBackOff',
    description:
      'A recently deployed microservice is stuck in CrashLoopBackOff on Kubernetes. The deployment passed CI/CD and the container builds fine, but the pods keep restarting. The team is blocked on shipping the new release.',
    systemOverview:
      'A Node.js API service is deployed on Kubernetes via a CI/CD pipeline. The Deployment has 3 replicas, health checks (liveness and readiness probes), and connects to a PostgreSQL database and a Redis cache. A ConfigMap provides environment variables.',
    logs: [
      {
        service: 'kubectl-events',
        content: `
LAST SEEN   TYPE      REASON              OBJECT                          MESSAGE
2m          Normal    Scheduled           pod/api-server-7f8b9c6d4-x2k9p  Successfully assigned default/api-server-7f8b9c6d4-x2k9p to node-3
2m          Normal    Pulled              pod/api-server-7f8b9c6d4-x2k9p  Container image "gcr.io/myproject/api-server:v2.3.1" already present on machine
2m          Normal    Created             pod/api-server-7f8b9c6d4-x2k9p  Created container api-server
2m          Normal    Started             pod/api-server-7f8b9c6d4-x2k9p  Started container api-server
90s         Warning   Unhealthy           pod/api-server-7f8b9c6d4-x2k9p  Readiness probe failed: HTTP probe failed with statuscode: 503
60s         Warning   Unhealthy           pod/api-server-7f8b9c6d4-x2k9p  Liveness probe failed: HTTP probe failed with statuscode: 503
55s         Normal    Killing             pod/api-server-7f8b9c6d4-x2k9p  Container api-server failed liveness probe, will be restarted
50s         Normal    Pulled              pod/api-server-7f8b9c6d4-x2k9p  Container image "gcr.io/myproject/api-server:v2.3.1" already present on machine
45s         Warning   BackOff             pod/api-server-7f8b9c6d4-x2k9p  Back-off restarting failed container
`,
      },
      {
        service: 'pod-logs',
        content: `
[2024-06-10 11:30:01] INFO: API Server v2.3.1 starting...
[2024-06-10 11:30:01] INFO: Loading configuration from environment...
[2024-06-10 11:30:01] INFO: DATABASE_URL: postgres://api-user:****@postgres-svc:5432/myapp
[2024-06-10 11:30:01] INFO: REDIS_URL: redis://redis-svc:6379
[2024-06-10 11:30:01] INFO: NEW_FEATURE_FLAG: enabled
[2024-06-10 11:30:02] INFO: Connecting to PostgreSQL...
[2024-06-10 11:30:02] INFO: PostgreSQL connected successfully.
[2024-06-10 11:30:02] INFO: Connecting to Redis...
[2024-06-10 11:30:02] INFO: Redis connected successfully.
[2024-06-10 11:30:03] INFO: Running database migrations...
[2024-06-10 11:30:08] INFO: Migration complete. Applied 3 new migrations.
[2024-06-10 11:30:08] INFO: Initializing feature flag module...
[2024-06-10 11:30:08] ERROR: Failed to load feature configuration: Missing required key 'NEW_FEATURE_CONFIG_JSON' in environment
[2024-06-10 11:30:08] WARN: Feature flag module failed to initialize. Server starting in degraded mode.
[2024-06-10 11:30:08] INFO: Server listening on port 3000
[2024-06-10 11:30:08] INFO: Health check endpoint /healthz returning 503 (degraded mode)
`,
      },
      {
        service: 'configmap-yaml',
        content: `
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-server-config
  namespace: default
data:
  DATABASE_URL: "postgres://api-user:secretpass@postgres-svc:5432/myapp"
  REDIS_URL: "redis://redis-svc:6379"
  NEW_FEATURE_FLAG: "enabled"
  LOG_LEVEL: "info"
  # NOTE: NEW_FEATURE_CONFIG_JSON was in the PR but removed during code review
  #       because "it looked like test data". Need to add it back.
`,
      },
    ],
    evaluationRubric:
      "Candidate should trace the CrashLoopBackOff to the liveness probe failing, which fails because the server returns 503 in degraded mode, which happens because the feature flag module can't initialize due to missing NEW_FEATURE_CONFIG_JSON environment variable in the ConfigMap. The comment in the ConfigMap is the smoking gun.",
    explanation: {
      reasoning:
        "The chain is: missing ConfigMap key → feature module fails → server starts in degraded mode → health endpoint returns 503 → liveness probe fails → Kubernetes kills the pod → CrashLoopBackOff. The pod-logs clearly show the server starts fine (DB and Redis connect), but the feature flag module errors on a missing env var. The ConfigMap YAML even has a comment explaining it was removed during code review.",
      redHerrings:
        "The database migrations running successfully might waste investigation time. Redis and PostgreSQL both connect fine, so it's not a networking or secrets issue. The fact that the container builds and starts correctly rules out image/build problems. The key insight is that the app starts but in a degraded state that the health check catches.",
      seniorIntuition:
        "A senior engineer seeing CrashLoopBackOff would first check pod logs (not just events) to see if the app is crashing or starting unhealthy. Seeing '503 degraded mode' immediately points to a configuration issue, not a code bug. They'd diff the ConfigMap between the working version and v2.3.1 to find what changed. The comment in the YAML is a common real-world scenario — config removed accidentally during review.",
    },
    tags: ['kubernetes', 'devops', 'configuration', 'deployment'],
  },
  {
    id: 'api-rate-limit-leak',
    title: 'Third-Party API Rate Limit Exhaustion',
    description:
      'Your application is hitting rate limits on a third-party geocoding API, causing address lookups to fail for users. This started after a "minor refactor" was deployed yesterday. No new features were added.',
    systemOverview:
      'A delivery logistics app uses a Geocoding API to convert addresses to coordinates. The Address Service caches results in Redis (24h TTL). A background Batch Processor also geocodes new addresses from bulk CSV uploads. Both share the same API key with a 1000 requests/hour limit.',
    logs: [
      {
        service: 'address-service',
        content: `
[2024-08-20 14:00:01] INFO: Geocode request for "123 Main St, Springfield"
[2024-08-20 14:00:01] INFO: Cache MISS for "123 Main St, Springfield"
[2024-08-20 14:00:01] INFO: Calling geocoding API...
[2024-08-20 14:00:02] INFO: API response: 200 OK. Coordinates: (39.7817, -89.6501)
[2024-08-20 14:00:02] INFO: Cached result with key "geo:123_main_st_springfield" TTL=86400s
[2024-08-20 14:05:00] INFO: Geocode request for "456 Oak Ave, Portland"
[2024-08-20 14:05:00] INFO: Cache MISS for "456 Oak Ave, Portland"
[2024-08-20 14:05:00] INFO: Calling geocoding API...
[2024-08-20 14:05:00] ERROR: API response: 429 Too Many Requests. Rate limit exceeded.
[2024-08-20 14:05:00] ERROR: Geocoding failed for "456 Oak Ave, Portland"
[2024-08-20 14:10:15] INFO: Geocode request for "123 Main St, Springfield"
[2024-08-20 14:10:15] INFO: Cache MISS for "123 Main St, Springfield"
[2024-08-20 14:10:15] INFO: Calling geocoding API...
[2024-08-20 14:10:15] ERROR: API response: 429 Too Many Requests.
`,
      },
      {
        service: 'batch-processor',
        content: `
[2024-08-20 13:55:00] INFO: Batch job started. Processing CSV: 'new_addresses_aug20.csv' (850 rows)
[2024-08-20 13:55:00] INFO: Processing row 1/850: "789 Pine Rd, Seattle"
[2024-08-20 13:55:00] INFO: Cache MISS. Calling geocoding API...
[2024-08-20 13:55:01] INFO: API response: 200 OK.
[2024-08-20 13:55:01] INFO: Processing row 2/850: "321 Elm St, Denver"
[2024-08-20 13:55:01] INFO: Cache MISS. Calling geocoding API...
[2024-08-20 13:55:01] INFO: API response: 200 OK.
...
[2024-08-20 13:58:30] INFO: Processing row 650/850: "555 Birch Ln, Austin"
[2024-08-20 13:58:30] WARN: API response: 429 Too Many Requests. Retrying in 1s...
[2024-08-20 13:58:31] WARN: API response: 429. Retrying in 2s...
[2024-08-20 13:58:33] WARN: API response: 429. Retrying in 4s...
[2024-08-20 13:58:37] ERROR: Max retries exceeded for row 650. Skipping.
[2024-08-20 13:58:37] INFO: Processing row 651/850...
`,
      },
      {
        service: 'redis-monitor',
        content: `
[2024-08-20 14:00:01] "GET" "geo:123_main_st_springfield" -> (nil)
[2024-08-20 14:00:02] "SETEX" "geo:123_main_st_springfield" "86400" "(39.7817,-89.6501)"
[2024-08-20 14:10:15] "GET" "geo:123_main_st_springfield" -> (nil)
[2024-08-20 14:10:15] -- NOTE: Key expired or evicted. maxmemory-policy: allkeys-lru
[2024-08-20 14:10:15] -- INFO: Current memory: 498MB / 512MB (97.3% full)
[2024-08-20 14:00:00] "INFO" "server" -> connected_clients: 847, used_memory: 498MB, maxmemory: 512MB, evicted_keys_last_hour: 12847
`,
      },
    ],
    evaluationRubric:
      'Candidate should identify TWO compounding issues: (1) The batch processor consumed most of the rate limit budget (850 rows with no rate limiting), but the real bug is (2) Redis cache eviction — the cache is 97% full with an allkeys-lru policy, meaning cached geocode results are being evicted almost immediately, turning every request into a cache miss that hits the API again. The "minor refactor" likely reduced Redis memory or added more data. The address was cached at 14:00:02 but missed again at 14:10:15 because it was evicted.',
    explanation: {
      reasoning:
        "Two issues compound: The batch processor fires 850 API calls in minutes with no rate limiting, consuming the hourly budget. But the deeper bug is in Redis — at 97.3% memory with allkeys-lru eviction policy, cached geocode results are being evicted within minutes. The log shows '123 Main St' was cached at 14:00:02 but returns (nil) at 14:10:15 — only 10 minutes later, despite the 24h TTL. This means the cache is effectively useless, turning every request into an API call.",
      redHerrings:
        "The batch processor's retry logic (exponential backoff) looks like good engineering and might distract from the real issue. The 'minor refactor' framing suggests a code bug, but the actual problem is infrastructure (Redis memory). The address-service logs look like a simple rate limit issue, but the re-miss of a recently cached key is the critical clue.",
      seniorIntuition:
        "A senior engineer would be suspicious the moment they see a cache MISS for a key that was just cached 10 minutes ago with a 24h TTL. That immediately points to eviction. Checking Redis memory usage confirms it. The fix involves: (1) increasing Redis memory or moving to a dedicated geocode cache, (2) adding rate limiting to the batch processor, and (3) possibly using a separate Redis instance for high-value cache entries.",
    },
    tags: ['caching', 'rate-limiting', 'redis', 'third-party-api'],
  },
  {
    id: 'dns-resolution-microservices',
    title: 'Intermittent DNS Resolution Failures',
    description:
      'A microservices platform is experiencing random connection failures between services. The errors are sporadic and affect different service pairs at different times. Infrastructure team says "nothing changed." SRE is escalating.',
    systemOverview:
      'A Kubernetes-based microservices platform with 12 services communicating via internal DNS (service-name.namespace.svc.cluster.local). CoreDNS handles cluster DNS resolution. Services use HTTP clients with default connection pooling. A new monitoring sidecar was recently added to all pods.',
    logs: [
      {
        service: 'user-service',
        content: `
[2024-09-05 16:00:01] INFO: Handling GET /users/42
[2024-09-05 16:00:01] INFO: Calling profile-service.default.svc.cluster.local:8080/profiles/42
[2024-09-05 16:00:01] ERROR: ENOTFOUND profile-service.default.svc.cluster.local
[2024-09-05 16:00:01] ERROR: Failed to fetch profile for user 42. Returning partial response.
[2024-09-05 16:00:15] INFO: Handling GET /users/42
[2024-09-05 16:00:15] INFO: Calling profile-service.default.svc.cluster.local:8080/profiles/42
[2024-09-05 16:00:15] INFO: Profile fetched successfully for user 42. 200 OK.
[2024-09-05 16:01:00] INFO: Handling GET /users/99
[2024-09-05 16:01:00] INFO: Calling profile-service.default.svc.cluster.local:8080/profiles/99
[2024-09-05 16:01:00] INFO: Profile fetched successfully for user 99. 200 OK.
[2024-09-05 16:02:30] INFO: Calling notification-service.default.svc.cluster.local:8080/send
[2024-09-05 16:02:30] ERROR: ENOTFOUND notification-service.default.svc.cluster.local
`,
      },
      {
        service: 'coredns-logs',
        content: `
[2024-09-05 16:00:01] [INFO] 10.244.3.15:53214 - 47821 "A IN profile-service.default.svc.cluster.local. udp 59 false 512" SERVFAIL qr,aa,rd 59 0.003s
[2024-09-05 16:00:01] [ERROR] plugin/errors: 2 profile-service.default.svc.cluster.local. A: read udp 10.96.0.10:53->10.244.1.2:53: i/o timeout
[2024-09-05 16:00:15] [INFO] 10.244.3.15:53218 - 47825 "A IN profile-service.default.svc.cluster.local. udp 59 false 512" NOERROR qr,aa,rd 111 0.001s
[2024-09-05 15:59:50] [WARNING] plugin/cache: capacity exceeded, evicting entries. Cache size: 10000/10000
[2024-09-05 16:00:00] [INFO] CoreDNS memory usage: 487MB RSS (limit: 512MB)
[2024-09-05 16:00:00] [WARNING] high query rate: 8,547 queries/sec (baseline: 1,200 queries/sec)
`,
      },
      {
        service: 'monitoring-sidecar',
        content: `
[2024-09-05 16:00:00] INFO: Metrics collector started. Polling interval: 100ms
[2024-09-05 16:00:00] INFO: Discovering services via DNS...
[2024-09-05 16:00:00] INFO: Resolving user-service.default.svc.cluster.local
[2024-09-05 16:00:00] INFO: Resolving profile-service.default.svc.cluster.local
[2024-09-05 16:00:00] INFO: Resolving notification-service.default.svc.cluster.local
[2024-09-05 16:00:00] INFO: Resolving payment-service.default.svc.cluster.local
[2024-09-05 16:00:00] INFO: Resolving order-service.default.svc.cluster.local
[2024-09-05 16:00:00] INFO: Resolving inventory-service.default.svc.cluster.local
[2024-09-05 16:00:00] INFO: Resolving shipping-service.default.svc.cluster.local
[2024-09-05 16:00:00] INFO: Resolving analytics-service.default.svc.cluster.local
[2024-09-05 16:00:00] INFO: Resolving search-service.default.svc.cluster.local
[2024-09-05 16:00:00] INFO: Resolving recommendation-service.default.svc.cluster.local
[2024-09-05 16:00:00] INFO: Resolving auth-service.default.svc.cluster.local
[2024-09-05 16:00:00] INFO: Resolving gateway-service.default.svc.cluster.local
[2024-09-05 16:00:00] INFO: Service discovery complete. 12 services found.
[2024-09-05 16:00:00] INFO: Next poll in 100ms...
[2024-09-05 16:00:00] INFO: Resolving user-service.default.svc.cluster.local
...
`,
      },
    ],
    evaluationRubric:
      "Candidate should identify that the newly added monitoring sidecar is polling DNS for all 12 services every 100ms, generating 12 * 10 * pod_count DNS queries per second. With ~70 pods, that's ~8,400 extra queries/sec, matching the 'high query rate: 8,547 queries/sec' vs baseline 1,200. This overwhelms CoreDNS (487MB/512MB memory, cache full), causing intermittent SERVFAIL responses. The fix is to increase the sidecar polling interval or add DNS caching to the sidecar.",
    explanation: {
      reasoning:
        "The monitoring sidecar resolves all 12 services via DNS every 100ms — that's 120 DNS queries per second per pod. With the platform running ~70 pods (each with the sidecar), that's ~8,400 queries/sec of additional DNS load. CoreDNS logs confirm: query rate jumped to 8,547/sec from a baseline of 1,200. CoreDNS is at 487MB/512MB memory with a full cache, causing intermittent SERVFAIL responses when it can't handle the load.",
      redHerrings:
        "The errors affecting 'different service pairs at different times' suggests a network routing issue, but it's actually random CoreDNS overload. The 'infrastructure team says nothing changed' is technically true for infra, but the sidecar was added to application deployments. The i/o timeout in CoreDNS logs might suggest network problems, but it's actually CoreDNS being too overwhelmed to respond in time.",
      seniorIntuition:
        "A senior SRE would immediately check CoreDNS metrics when seeing ENOTFOUND errors that resolve on retry — that pattern screams DNS overload, not missing service records. The 7x query rate increase is the smoking gun. They'd correlate the timing with the sidecar rollout. The fix is straightforward: increase polling interval to 30s+ or have the sidecar cache DNS results locally.",
    },
    tags: ['kubernetes', 'dns', 'networking', 'observability', 'sre'],
  },
];
