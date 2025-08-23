# WhatsApp Campaign Manager - Backend API

Express.js backend API for the WhatsApp Campaign Manager system.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Redis (for production)

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run db:generate
npm run db:push

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## 📡 API Endpoints

### WhatsApp Configuration
- `POST /api/waba/config` - Save WhatsApp Business API credentials
- `POST /api/waba/status` - Test WhatsApp connection

### Campaign Management
- `POST /api/campaigns/batch` - Create batch campaign with auto-splitting
- `GET /api/campaigns` - List all campaigns

### Contact Import
- `POST /api/import/parse` - Parse CSV/Excel files
- `POST /api/import/validate` - Validate contact data
- `POST /api/import/contacts` - Import contacts to database

### Media Management
- `POST /api/media/upload` - Upload images/videos
- `GET /api/media` - List media assets

### Health Check
- `GET /health` - Server health status

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/whatsapp_campaigns"

# Server
PORT=3001
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL="https://your-frontend-domain.com"

# Encryption
ENCRYPTION_KEY="your-32-character-encryption-key"

# Redis (for production queue management)
REDIS_URL="redis://localhost:6379"

# WhatsApp Business API
WHATSAPP_API_URL="https://graph.facebook.com/v18.0"
```

## 🚀 Deployment

### GitHub Deployment

1. Push code to GitHub repository
2. Set up environment variables in your hosting platform
3. Configure build and start commands:
   - Build: `npm run build`
   - Start: `npm start`

### Database Migration

```bash
# Production database setup
npm run db:migrate
```

## 🔒 Security Features

- CORS protection
- Helmet security headers
- Input validation with Zod
- Encrypted credential storage
- File upload validation
- Rate limiting ready

## 📊 Monitoring

The API includes structured logging and error handling. Integrate with:
- Sentry for error tracking
- Prometheus for metrics
- Custom logging solutions

## 🤝 API Integration

### Frontend Integration

Configure your frontend to point to this backend:

```javascript
const API_BASE_URL = 'https://your-backend-domain.com/api'
```

### WhatsApp Integration

The backend handles WhatsApp Business API integration:
- Credential management
- Message sending
- Media upload
- Webhook handling

## 📝 License

MIT License - see LICENSE file for details.
