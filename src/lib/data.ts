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
[2023-10-27 10:01:15] INFO: Querying user database for 'testuser2'
[2023-10-27 10:01:15] INFO: User 'testuser2' authenticated successfully
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
`,
      },
    ],
    evaluationRubric:
      'Candidate should identify the slow database query as the root cause. Bonus points for mentioning the lack of index on the `users` table as the reason for the slow query.',
    explanation: {
      reasoning:
        "The root cause is a slow database query in the 'user-database'. The log `WARNING: Query executed without index. Full table scan performed on 'users' table.` is the key signal. This causes the `auth-service` to wait for 6 seconds, which in turn causes the `api-gateway` to time out.",
      redHerrings:
        "The problem is intermittent. This might suggest a network issue or a problem with a specific service instance. However, the logs point directly to a database performance problem.",
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
[2023-11-01 14:22:10] INFO: New job received. Image: 'huge-image-b.tiff', size: 150MB.
[2023-11-01 14:22:11] INFO: Starting processing for 'huge-image-b.tiff'.
[2023-11-01 14:22:12] INFO: Reading image into memory.
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
        "The term 'memory leak' in the description might mislead one to look for un-freed resources after a job is done. However, the metrics show memory usage returning to normal after the successful job, pointing away from a traditional leak.",
      seniorIntuition:
        'A senior developer would be wary of any process that loads an entire user-provided file into memory without constraints. The first thought would be to check how the image is being read and processed. The solution is almost always to use streams or chunked processing for large files to keep memory usage predictable and low, regardless of input file size.',
    },
    tags: ['memory', 'performance', 'media', 'backend'],
  },
];
