# WhatsApp Campaign Manager - Frontend

Next.js 15 frontend application for the WhatsApp Campaign Manager system.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Backend API running

### Installation

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your backend API URL

# Start development server
npm run dev

# Build for production
npm run build
npm start
```

## 🌐 Environment Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL="https://your-backend-domain.com/api"

# App Configuration
NEXT_PUBLIC_APP_NAME="WhatsApp Campaign Manager"
NEXT_PUBLIC_APP_URL="https://your-frontend-domain.com"

# WhatsApp Webhook URL (for setup wizard)
NEXT_PUBLIC_WEBHOOK_URL="https://your-backend-domain.com"
```

## 📱 Features

### Core Pages
- **Dashboard** (`/`) - Overview and quick actions
- **WhatsApp Setup** (`/waba-setup`) - 4-step API configuration wizard
- **Import Contacts** (`/import`) - CSV/Excel file upload and processing
- **Campaigns** (`/campaigns`) - Campaign management and tracking
- **Media Library** (`/media`) - Image and video upload management

### Key Components
- Responsive design with Tailwind CSS
- shadcn/ui component library
- React Query for API state management
- React Hook Form with Zod validation
- File upload with drag-and-drop
- Real-time progress tracking

## 🚀 Deployment

### Hostinger Deployment

1. Build the application:
```bash
npm run build
```

2. Upload the `out` folder (if using static export) or deploy the entire project

3. Configure environment variables in Hostinger control panel

4. Set up custom domain and SSL

### Static Export (for static hosting)

```bash
# Add to package.json scripts
"export": "next build && next export"

# Run export
npm run export
```

### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🔧 Configuration

### API Integration

The frontend connects to the backend API. Update the API base URL in `.env.local`:

```env
NEXT_PUBLIC_API_URL="https://your-backend-domain.com/api"
```

### Custom Branding

Update app name and URLs in environment variables:

```env
NEXT_PUBLIC_APP_NAME="Your Company WhatsApp Manager"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

## 🎨 Customization

### Styling
- Uses Tailwind CSS for styling
- shadcn/ui components for consistent design
- Dark/light theme support with next-themes
- Responsive design for all screen sizes

### Components
- Reusable UI components in `src/components/ui/`
- Custom hooks in `src/hooks/`
- Utility functions in `src/lib/`

## 📊 Performance

- Next.js 15 with App Router
- Turbopack for fast development builds
- React Query for efficient API caching
- Optimized images and assets
- Code splitting and lazy loading

## 🔒 Security

- Environment variable validation
- Input sanitization with Zod
- CORS protection (handled by backend)
- Secure API communication
- File upload validation

## 📝 License

MIT License - see LICENSE file for details.
