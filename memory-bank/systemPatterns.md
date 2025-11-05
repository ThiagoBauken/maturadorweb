# System Architecture Patterns

## Core Architecture
```mermaid
flowchart TD
    UI[React Frontend] <---> API[Express Backend API]
    API <---> DB[(PostgreSQL)]
    API <---> Redis[(Redis Cache)]
    API <---> Evolution[Evolution API v2]
    API <---> OAI[OpenAI API]

    subgraph "Implemented Backend Services"
        AuthService[Authentication Service]
        SessionManager[Session Management]
        VerifierService[Number Verification]
        WarmerService[Account Warming]
        BulkSenderService[Bulk Messaging]
        TaskQueue[Task Queue]
        RateLimiter[Rate Limiting System]
    end

    API --> ImplementedBackendServices
    Evolution --> WhatsApp[WhatsApp Network]

    UI -->|Real-time Updates| WS[WebSockets]
```

## Implemented Data Flows

1. **Session Management Flow**:
   ```mermaid
   sequenceDiagram
       participant Client as Frontend
       participant API as Express API
       participant EvAPI as Evolution API

       Client->>API: Create Session Request
       API->>EvAPI: Initialize Session
       EvAPI->>API: Return QR Code
       API->>Client: Send QR Code for Scanning

       Note over Client: User Scans QR Code

       API->>EvAPI: Check Connection Status
       EvAPI->>API: Session Connected
       API->>Client: Session Active Confirmation

       loop Status Monitoring
           API->>EvAPI: Get Session Status
           EvAPI->>API: Return Status
           API->>Client: Update Status UI
       end
   ```

2. **Number Verification Pipeline**:
   ```mermaid
   sequenceDiagram
       participant Client as Frontend
       participant API as Express API
       participant Queue as Task Queue
       participant Cache as Redis Cache
       participant EvAPI as Evolution API

       Client->>API: Upload Numbers CSV
       API->>API: Format & Deduplicate
       API->>API: Create Verification Campaign

       Client->>API: Start Campaign

       loop Batch Processing
           API->>Queue: Process Batch with Semaphore
           Queue->>API: Approve Process Start

           loop For Each Number
               API->>Cache: Check if Result Cached

               alt Cache Hit
                   Cache->>API: Return Cached Result
               else Cache Miss
                   API->>EvAPI: Check Number Exists
                   EvAPI->>API: Return Status
                   API->>Cache: Store Result (24h TTL)
               end

               API->>API: Update Database Records
               API->>API: Apply Random Delay
           end

           API->>Queue: Release Semaphore
           API->>Client: Update Progress
       end

       API->>Client: Campaign Complete
   ```

3. **Warming Sequence**:
   ```mermaid
   sequenceDiagram
       participant Client as Frontend
       participant API as Express API
       participant Queue as Task Queue
       participant GenAI as OpenAI API
       participant EvAPI as Evolution API

       Client->>API: Create Warming Configuration

       alt AI Enabled
           API->>GenAI: Generate Conversation Patterns
           GenAI->>API: Return Conversation Data
           API->>API: Process & Store Conversations
       end

       Client->>API: Activate Warmer

       loop Scheduled Periods
           API->>API: Check If Schedule Active

           loop For Each Message
               API->>Queue: Request Semaphore
               Queue->>API: Grant Permission

               API->>API: Calculate Random Delay
               Note over API: Apply Delay (30-90s)

               API->>EvAPI: Send Warming Message
               EvAPI->>API: Confirm Sent

               API->>Queue: Release Semaphore
               API->>API: Update Warming Progress
           end
       end

       API->>Client: Warming Complete
   ```

4. **Bulk Messaging Flow** (In Progress):
   ```mermaid
   sequenceDiagram
       participant Client as Frontend
       participant API as Express API
       participant Queue as Task Queue
       participant Cache as Redis Cache
       participant EvAPI as Evolution API

       Client->>API: Create Campaign & Upload Recipients
       Client->>API: Configure Message Template
       Client->>API: Start Campaign

       API->>Queue: Process With Rate Limiting

       loop For Each Recipient Batch
           API->>Queue: Acquire Semaphore
           Queue->>API: Grant Permission

           loop For Each Message (with session rotation)
               API->>API: Apply Random Delay (40-200s)
               API->>API: Select Session (Round-Robin)
               API->>EvAPI: Send Message
               EvAPI->>API: Delivery Status

               API->>API: Update Send Statistics

               alt Every 10 Messages
                   Note over API: Apply 120s Pause
               end
           end

           API->>Queue: Release Semaphore
           API->>Client: Update Progress
       end

       API->>Client: Campaign Complete
   ```

## Rate Limiting Implementation
```mermaid
flowchart TD
    Operations[Operation Request] --> ThrottleCheck[Check Redis Semaphore Count]
    ThrottleCheck -->|Below Limit| IncrementCounter[Increment Counter]
    ThrottleCheck -->|At Limit| QueueOperation[Queue in Memory]

    IncrementCounter --> ExecuteOperation[Execute Operation]
    ExecuteOperation --> ApplyDelay[Apply Random Delay]
    ApplyDelay --> CountCheck[Check Operation Count]

    CountCheck -->|Every N ops| LongPause[Apply Extended Pause]
    CountCheck -->|Normal| DecCounter[Decrement Counter]

    LongPause --> DecCounter

    DecCounter --> ProcessNext[Process Next in Queue]
    ProcessNext -->|Queue Empty| Complete[Complete]
    ProcessNext -->|Items in Queue| DequeueNext[Dequeue Next Operation]
    DequeueNext --> IncrementCounter

    QueueOperation --> WaitForAvailable[Wait for Available Slot]
    WaitForAvailable --> DequeueNext
```

## Implemented Database Schema
```mermaid
erDiagram
    User {
        uuid id PK
        string name
        string email
        string password
        string role
        boolean active
        datetime lastLogin
        datetime createdAt
        datetime updatedAt
    }

    Session {
        uuid id PK
        uuid userId FK
        string name
        string instanceName
        string phoneNumber
        string status
        json connectionData
        datetime lastActive
        json settings
        json metrics
        datetime createdAt
        datetime updatedAt
    }

    VerificationCampaign {
        uuid id PK
        uuid userId FK
        string name
        string status
        integer totalNumbers
        integer processedCount
        integer validCount
        json settings
        datetime startedAt
        datetime completedAt
        integer estimatedTimeRemaining
        datetime createdAt
        datetime updatedAt
    }

    PhoneNumber {
        uuid id PK
        uuid campaignId FK
        string number
        string status
        json metadata
        datetime verifiedAt
        integer attemptCount
        datetime lastAttempt
        string errorMessage
        datetime createdAt
        datetime updatedAt
    }

    Warmer {
        uuid id PK
        uuid userId FK
        string name
        string type
        string status
        json settings
        json schedule
        datetime startedAt
        datetime completedAt
        datetime lastWarmedAt
        integer warmedCount
        datetime createdAt
        datetime updatedAt
    }

    BulkCampaign {
        uuid id PK
        uuid userId FK
        string name
        string status
        text messageTemplate
        json messageVariations
        json mediaAttachments
        json schedule
        json settings
        integer totalRecipients
        integer sentCount
        integer failedCount
        datetime startedAt
        datetime completedAt
        datetime estimatedCompletionTime
        datetime createdAt
        datetime updatedAt
    }

    Recipient {
        uuid id PK
        uuid campaignId FK
        string number
        string status
        string messageId
        datetime sentAt
        integer attemptCount
        datetime lastAttempt
        string errorMessage
        uuid sessionId
        datetime createdAt
        datetime updatedAt
    }

    User ||--o{ Session : owns
    User ||--o{ VerificationCampaign : creates
    User ||--o{ Warmer : configures
    User ||--o{ BulkCampaign : manages
    VerificationCampaign ||--o{ PhoneNumber : contains
    BulkCampaign ||--o{ Recipient : targets
    Session ||--o{ Recipient : sends_via
```

## Critical Task Processing Pattern
```mermaid
sequenceDiagram
    participant Client as Frontend
    participant API as Backend API
    participant Queue as Task Queue (Redis)
    participant Evolution as Evolution API

    Client->>API: Operation Request
    API->>Queue: executeWithSemaphore(operationType)

    alt Semaphore Available
        Queue->>API: Grant Operation Slot
        API->>Evolution: Perform Operation

        alt Operation Success
            Evolution->>API: Success Response
            API->>Queue: Decrement Semaphore Count
            API->>Client: Operation Result
        else Operation Failure
            Evolution->>API: Error Response
            API->>Queue: trackOperationResult(failure)

            alt Failure Rate > 25%
                Queue->>API: shouldPause = true
                API->>Client: Service Temporarily Unavailable
            else Retry Available
                API->>Evolution: Retry Operation
            end

            API->>Queue: Decrement Semaphore Count
        end

        Queue->>Queue: Process Next Task in Queue
    else Semaphore Full
        Queue->>Queue: Add to Queue
        API->>Client: Operation Queued
    end
```

## API Endpoint Structure
```mermaid
flowchart TD
    API[API Routes] --> Auth[/auth]
    API --> Sessions[/sessions]
    API --> Verifier[/verifier]
    API --> Warmers[/warmers]
    API --> BulkSender[/bulk]
    API --> Analytics[/analytics]

    Auth --> Register[POST /register]
    Auth --> Login[POST /login]
    Auth --> Me[GET /me]

    Sessions --> GetAll[GET /]
    Sessions --> Create[POST /]
    Sessions --> GetOne[GET /:id]
    Sessions --> Delete[DELETE /:id]
    Sessions --> Status[GET /:id/status]
    Sessions --> QR[GET /:id/qr]
    Sessions --> Restart[POST /:id/restart]

    Verifier --> Campaigns[GET /]
    Verifier --> NewCampaign[POST /]
    Verifier --> GetCampaign[GET /:id]
    Verifier --> Start[POST /:id/start]
    Verifier --> Pause[POST /:id/pause]
    Verifier --> Numbers[GET /:id/numbers]
    Verifier --> Export[GET /:id/export]

    Warmers --> AllWarmers[GET /]
    Warmers --> NewWarmer[POST /]
    Warmers --> GetWarmer[GET /:id]
    Warmers --> Status[PUT /:id/status]
    Warmers --> Restart[POST /:id/restart]
    Warmers --> Delete[DELETE /:id]

    BulkSender --> Campaigns[GET /]
    BulkSender --> Create[POST /]
    BulkSender --> Get[GET /:id]
    BulkSender --> Start[POST /:id/start]
    BulkSender --> Pause[POST /:id/pause]
    BulkSender --> Recipients[GET /:id/recipients]
    BulkSender --> Stats[GET /:id/stats]
