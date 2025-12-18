# 🌤️ Weather Agent using LangChain.js & LangGraph.js

Intelligent weather notification system with AI agent orchestration, automated scheduling via BullMQ, and Redis-backed job queues.

## ✨ Features

- 🤖 **LangGraph AI Workflow** - State graph orchestration for weather operations
- ⏰ **Scheduled Emails** - Cron-based recurring emails with BullMQ
- 🌍 **Real-time Weather** - OpenWeatherMap API integration
- 📧 **Email Notifications** - Gmail SMTP delivery
- 📊 **Job Queue System** - BullMQ + Redis for reliable processing
- 🎯 **Type-safe** - TypeScript + Zod validation

## 🔧 Tech Stack

- Node.js, TypeScript, Express.js
- LangChain.js, LangGraph.js
- BullMQ 5.65+, IORedis, Redis
- OpenWeatherMap API, Gmail SMTP
- Zod validation

## 📋 Prerequisites

- Node.js 18+
- pnpm
- **Redis Server** - [Install](https://redis.io/docs/getting-started/)
- [OpenWeatherMap API Key](https://openweathermap.org/api)
- [Gmail App Password](https://myaccount.google.com/apppasswords)

## 🚀 Quick Start

```bash
# 1. Install
git clone https://github.com/yourusername/weather-agent.git
cd weather-agent/backend
pnpm install

# 2. Start Redis
brew services start redis  # macOS
# OR: sudo systemctl start redis  # Linux
# OR: docker run -d -p 6379:6379 redis:latest

# 3. Configure .env
cat > .env << EOF
PORT=5001
OPENWEATHER_API_KEY=your_api_key
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password
REDIS_HOST=localhost
REDIS_PORT=6379
EOF

# 4. Run
pnpm run dev
```

## 📡 API Endpoints

### Instant Weather Email

```bash
POST /api/weatherEmail/sendWeatherEmail
```

```json
{
  "city": "Mumbai",
  "recipientEmail": "user@example.com"
}
```

### Scheduler Management

**Create Schedule**

```bash
POST /api/weatherEmailScheduler/create
```

```json
{
  "city": "New York",
  "recipientEmail": "user@example.com",
  "pattern": "0 17 * * *"
}
```

**Cron Pattern Examples:**

- `"0 17 * * *"` - Daily at 5 PM
- `"0 9 * * 1-5"` - Weekdays at 9 AM
- `"*/30 * * * *"` - Every 30 minutes

**Other Endpoints:**

- `GET /api/weatherEmailScheduler/list` - List all schedules
- `DELETE /api/weatherEmailScheduler/delete/:schedulerId` - Delete specific schedule
- `DELETE /api/weatherEmailScheduler/delete-all-schedules` - Delete all schedules

## 🏗️ Architecture

```
Express API → LangGraph Agent → Tools (Fetch Weather, Format, Send)
    ↓
BullMQ Queue (Redis) → Worker → Agent → Email Sent
```

**LangGraph Workflow:** `START → Fetch Weather → Format Email → Send Email → END`

## 🎯 Microservice Architecture Explained

This project follows a **microservice architecture** with a **monorepo structure** using Turborepo. Here's what each component does:

### **1️⃣ `apps/backend/` - Authentication & API Service**

**Purpose:** Handles user authentication and general API operations

**Responsibilities:**

- User authentication (signup, login, session management)
- User management (CRUD operations)
- Acts as the authentication gateway for all services

**Example Endpoints:**

```
POST /api/auth/sign-up          # User registration
POST /api/auth/sign-in          # User login
GET  /api/auth/get-session      # Get current session
GET  /api/users/:id             # User profile
```

**Tech Stack:** Express.js + better-auth + MongoDB

---

### **2️⃣ `apps/agent-service/` - AI Weather Service**

**Purpose:** AI-powered weather intelligence and email automation

**Responsibilities:**

- LangGraph AI agent orchestration for weather operations
- BullMQ job queue processing for scheduled emails
- Weather data fetching and formatting
- Email delivery via Gmail SMTP

**Example Endpoints:**

```
POST /api/weatherEmail/sendWeatherEmail              # Instant weather email
POST /api/weatherEmailScheduler/create               # Schedule recurring emails
GET  /api/weatherEmailScheduler/list                 # List all schedules
DELETE /api/weatherEmailScheduler/delete/:id         # Remove schedule
```

**Tech Stack:** Express.js + LangChain.js + LangGraph.js + BullMQ + Redis + OpenWeatherMap API

---

### **3️⃣ `packages/` - Shared Code Library**

**Purpose:** Reusable code shared across all microservices

**Contains:**

- **Better-auth configuration** - Shared authentication setup
- **Database models** - User, WeatherEmail, Session schemas
- **Common middleware** - Auth middleware, validation, error handling
- **Shared types** - TypeScript interfaces and types
- **Utilities** - Helper functions used by multiple services

**Why separate packages?**

- Ensures consistent authentication across all services
- Avoids code duplication (DRY principle)
- Single source of truth for database schemas
- Type safety across the entire monorepo

---

### **🔄 How Services Work Together**

```
┌─────────────────────────────────────────────────────────────┐
│                      USER REQUEST                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ↓
         ┌──────────────────────────────────────┐
         │   Kubernetes Ingress / API Gateway   │
         └──────────────────────────────────────┘
                    │                  │
        ┌───────────┘                  └────────────┐
        ↓                                           ↓
┌─────────────────────┐                  ┌──────────────────────┐
│  apps/backend/      │                  │ apps/agent-service/  │
│  (Auth Service)     │                  │ (Weather AI Service) │
├─────────────────────┤                  ├──────────────────────┤
│ • User signup       │                  │ • AI agent execution │
│ • User login        │                  │ • Email scheduling   │
│ • Session mgmt      │                  │ • BullMQ workers     │
│ • User CRUD         │                  │ • Weather fetching   │
└─────────────────────┘                  └──────────────────────┘
        │                                           │
        └────────────────┬──────────────────────────┘
                         ↓
               ┌──────────────────┐
               │   packages/      │
               ├──────────────────┤
               │ • Auth config    │
               │ • User model     │
               │ • Middlewares    │
               │ • Shared types   │
               └──────────────────┘
                         ↓
               ┌──────────────────┐
               │   MongoDB        │
               │ • users          │
               │ • sessions       │
               │ • weatherEmails  │
               └──────────────────┘
```

---

### **🔐 Authentication Flow Example**

Both services use the same authentication system from `packages/`:

```typescript
// 1. User signs up via backend service
POST http://localhost:5001/api/auth/sign-up
→ Creates user in MongoDB
→ Returns session token

// 2. User requests weather email via agent-service service
POST http://localhost:XXXX/api/weatherEmail/sendWeatherEmail
Headers: { Authorization: "Bearer <token>" }

// 3. Weather-agent verifies token using shared auth middleware
import { authMiddleware } from '@weather-agent/shared/middlewares';

router.post('/sendWeatherEmail',
  authMiddleware,  // ← Verifies session from packages/
  weatherController.send
);
```

---

### **🌟 Microservice Benefits**

| Benefit                    | Description                                                       |
| -------------------------- | ----------------------------------------------------------------- |
| **Independent Scaling**    | Scale agent-service separately from backend based on demand       |
| **Technology Isolation**   | Backend doesn't need LangChain; agent-service doesn't handle auth |
| **Team Separation**        | Different teams can work on auth vs AI features independently     |
| **Fault Isolation**        | If AI crashes, authentication service stays operational           |
| **Independent Deployment** | Deploy weather features without touching auth code                |
| **Code Reusability**       | Both services share auth, models, and utilities from packages     |

## 📁 Project Structure

```
weather-ai-app/
│
├── apps/                              # Your microservices
│   ├── web/                           # React frontend
│   │   ├── src/
│   │   ├── Dockerfile
│   │   ├── nginx.conf
│   │   └── package.json
│   │
│   ├── backend/                       # Auth + API service
│   │   ├── src/
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── agent-service/                 # LangGraph service
│       ├── src/
│       ├── Dockerfile
│       └── package.json
│
├── packages/                          # Shared code
│   ├── common/                        # Types & validations
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   └── validations.ts
│   │   └── package.json
│   │
│   └── database/                      # MongoDB models
│       ├── src/
│       │   └── models/
│       └── package.json
│
├── k8s/                               # Kubernetes configs
│   ├── web.yaml                       # Web deployment + service
│   ├── backend.yaml                   # Backend deployment + service
│   ├── agent-service.yaml             # Agent deployment + service
│   ├── mongo.yaml                     # MongoDB StatefulSet
│   ├── redis.yaml                     # Redis deployment
│   └── ingress.yaml                   # Nginx Ingress routing
│
├── terraform/                         # Infrastructure (pick ONE cloud)
│   ├── main.tf                        # EKS/GKE cluster
│   ├── variables.tf
│   └── outputs.tf
│
├── .github/
│   └── workflows/
│       └── deploy.yaml                # Single simple CI/CD
│
├── docker-compose.yml                 # Local development
├── package.json                       # Root package.json
├── pnpm-workspace.yaml                # Workspace definition
├── turbo.json                         # Build config
└── README.md
```

## 📧 Email Output

```
Dear User,

Here's your daily weather update for Mumbai:

🌡️ Temperature: 31.99°C
🤔 Feels Like: 30.09°C
☁️ Conditions: smoke
💧 Humidity: 22%
💨 Wind Speed: 3.6 m/s

Have a great day!
```

## � Troubleshooting

| Issue                            | Solution                                                |
| -------------------------------- | ------------------------------------------------------- |
| OpenWeather API error            | Check `OPENWEATHER_API_KEY` in `.env`                   |
| Email send failed                | Use Gmail App Password, not regular password            |
| Redis connection failed          | Run `redis-cli ping` to verify Redis is running         |
| "Job belongs to scheduler" error | Use `/delete-all-schedules` endpoint to properly remove |

## 📝 License

Apache License 2.0

---

**Built with ❤️ using LangChain.js, LangGraph.js, and BullMQ**
