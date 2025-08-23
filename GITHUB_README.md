# WhatsApp Campaign Manager

A production-grade WhatsApp marketing campaign management system built with modern web technologies. This system allows businesses to import contacts, create campaigns, send multimedia messages, and track performance while maintaining full compliance with WhatsApp Business API guidelines.

## 🚀 Features

### Core Functionality
- **Contact Import**: Upload CSV/Excel files with automatic validation and E.164 formatting
- **Auto-Batching**: Automatically split large contact lists into campaigns of 400 contacts each
- **Media Support**: Send images (≤5MB) and videos (≤16MB) with messages
- **WhatsApp Integration**: Complete WhatsApp Business API setup wizard
- **Real-time Tracking**: Monitor delivery, read receipts, and campaign performance
- **Compliance**: Enforces opt-in requirements and WhatsApp guidelines

### Technical Features
- **Scalable Architecture**: Separate backend API and frontend for independent deployment
- **Modern Stack**: Next.js 15, Express.js, TypeScript, Prisma, PostgreSQL
- **Security**: Encrypted credential storage, input validation, CORS protection
- **Queue Management**: BullMQ for message processing with retry logic
- **Responsive Design**: Mobile-first UI with Tailwind CSS and shadcn/ui

## 📦 Project Structure

This repository contains two main packages:

### Backend (`/backend`)
- **Express.js API** server with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Queue Management**: BullMQ with Redis
- **Security**: Helmet, CORS, input validation
- **Deployment**: Ready for GitHub hosting

### Frontend (`/frontend`)
- **Next.js 15** application with App Router
- **UI**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query for API caching
- **Forms**: React Hook Form with Zod validation
- **Deployment**: Ready for Hostinger or Vercel

## 🛠 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Redis (for production)
- WhatsApp Business API credentials

### Backend Setup

```bash
# Extract and navigate to backend
unzip backend.zip
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run db:generate
npm run db:push

# Start server
npm run dev
```

### Frontend Setup

```bash
# Extract and navigate to frontend
unzip frontend.zip
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your backend API URL

# Start development server
npm run dev
```

## 🌐 Deployment

### Backend Deployment (GitHub/Railway/Heroku)

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/whatsapp-backend.git
git push -u origin main
```

2. **Environment Variables**:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/whatsapp_campaigns"
PORT=3001
NODE_ENV=production
FRONTEND_URL="https://your-frontend-domain.com"
ENCRYPTION_KEY="your-32-character-encryption-key"
REDIS_URL="redis://localhost:6379"
```

3. **Build Commands**:
- Build: `npm run build`
- Start: `npm start`

### Frontend Deployment (Hostinger)

1. **Build for Production**:
```bash
npm run build
```

2. **Upload to Hostinger**:
- Upload the entire project or use the `out` folder for static export
- Configure environment variables in hosting control panel

3. **Environment Variables**:
```env
NEXT_PUBLIC_API_URL="https://your-backend-domain.com/api"
NEXT_PUBLIC_APP_NAME="WhatsApp Campaign Manager"
NEXT_PUBLIC_WEBHOOK_URL="https://your-backend-domain.com"
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

## 🔧 Configuration

### WhatsApp Business API Setup

1. **Facebook Developer Account**: Create a Facebook App with WhatsApp Business API access
2. **Business Account**: Set up WhatsApp Business Account (WABA)
3. **Phone Number**: Add and verify a phone number
4. **Webhooks**: Configure webhook URL and verify token
5. **Permissions**: Ensure `whatsapp_business_messaging` permissions

### Database Schema

The system uses the following main models:
- **User**: System users with role-based access
- **Team**: Organization/team management
- **WabaConfig**: WhatsApp Business API configuration
- **Contact**: Contact information with opt-in status
- **BatchCampaign**: Campaign container for auto-batching
- **Campaign**: Individual campaign (max 400 contacts)
- **MessageJob**: Individual message sending jobs
- **MediaAsset**: Uploaded media files

## 🔒 Security & Compliance

### Security Features
- **Encrypted Storage**: Sensitive credentials encrypted at rest
- **Input Validation**: Zod schemas for all API inputs
- **CORS Protection**: Configurable CORS policies
- **Rate Limiting**: Built-in rate limiting for API endpoints
- **Secure Headers**: Helmet.js security headers

### WhatsApp Compliance
- **Opt-in Enforcement**: Only send to opted-in contacts
- **Template Usage**: Enforce approved templates outside 24h sessions
- **Rate Limits**: Respect WhatsApp's sending rate limits
- **Auto-batching**: Automatic campaign splitting for large lists
- **Delivery Tracking**: Complete message lifecycle tracking

## 📊 Monitoring & Analytics

### Built-in Features
- Campaign performance metrics
- Message delivery tracking
- Error logging and reporting
- Real-time progress indicators

### Integration Ready
- **Sentry**: Error tracking and monitoring
- **Prometheus**: Metrics collection
- **Custom Analytics**: API endpoints for custom dashboards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [WhatsApp Cloud API Documentation](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)

### Common Issues
1. **Database Connection**: Ensure PostgreSQL is running and connection string is correct
2. **WhatsApp API**: Verify all credentials and webhook configuration
3. **CORS Issues**: Check frontend URL in backend CORS configuration
4. **File Uploads**: Ensure proper file size limits and MIME type validation

### Getting Help
- Create an issue for bugs or feature requests
- Check existing issues for solutions
- Review the documentation for setup instructions

---

**Built with ❤️ for modern WhatsApp marketing campaigns**
