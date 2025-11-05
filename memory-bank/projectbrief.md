# Project Brief: AquecedorWeb

## Core Objective
Develop a comprehensive web platform for managing WhatsApp interactions including phone number verification campaigns, account warming sequences, and bulk messaging, integrating with Evolution API v2 for WhatsApp communication capabilities.

## Key Features

1. **WhatsApp Session Management**
   - Connect multiple WhatsApp accounts via QR
   - Session health monitoring and recovery
   - Connection status tracking

2. **Verification System**
   - Multi-step verification wizards
   - Bulk number processing (up to 2500 per session/12hrs)
   - Verification campaign management
   - CSV import/export functionality

3. **Account Warming System**
   - Standard and group warming configurations
   - AI-generated conversation patterns
   - Scheduled message delivery with smart delays
   - Progressive warming intensity

4. **Bulk Messaging**
   - Campaign creation and management
   - Message templating and personalization
   - Media attachments (images, videos, documents)
   - Intelligent rate-limited delivery

5. **Analytics Dashboard**
   - Real-time campaign performance tracking
   - Session health monitoring
   - Verification success metrics
   - Message delivery statistics

6. **Security**
   - JWT-based authentication
   - Role-based access control
   - Secure API integrations
   - Data encryption

## Technical Scope

### Frontend
- React 18 + TypeScript
- Vite Build System
- Shadcn/ui Component Library
- Tailwind CSS
- React Router
- Zustand for state management

### Backend
- Node.js Express server
- PostgreSQL database
- Redis for caching and queue management
- Evolution API v2 integration
- OpenAI API integration for conversation generation
- Semaphore-based task queue system

### Key Technical Requirements
- Rate limiting with variable delays (40-200s for bulk, 30-90s for warming)
- Concurrency management (max 25 simultaneous operations)
- Session rotation for operation distribution
- Intelligent failure handling with automatic retries
- Robust error monitoring and operation pausing

## Project Timeline
Backend development is estimated to take 6 weeks, divided into:
- Foundation (1 week)
- Core Services (1 week)
- WhatsApp Integration Features (2 weeks)
- Analytics & Monitoring (1 week)
- Integration & Testing (1 week)
