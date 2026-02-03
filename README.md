# Skillpal Real Estate

A full-stack real estate listing and lead management platform built with modern technologies.

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Google OAuth
- **File Storage**: DigitalOcean Spaces (S3-compatible)
- **Process Manager**: PM2

### Frontend
- **Framework**: Next.js 16
- **Styling**: TailwindCSS
- **UI Components**: Radix UI
- **Forms**: React Hook Form + Zod validation

## Project Structure

```
skillpal-real-estate/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── middlewares/     # Auth, validation, etc.
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helpers
│   ├── prisma/              # Database schema
│   └── ecosystem.config.js  # PM2 configuration
├── frontend/                # Next.js app
│   ├── src/
│   │   ├── app/             # App router pages
│   │   ├── components/      # React components
│   │   └── lib/             # Utilities
│   └── public/              # Static assets
├── deploy/                  # Deployment configs
│   └── nginx.conf           # Nginx reverse proxy
└── DEPLOYMENT.md            # Deployment guide
```

## Local Development

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials

npx prisma generate
npx prisma db push
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your API URL

npm run dev
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions on DigitalOcean.

## Environment Variables

### Backend
| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `DO_SPACES_KEY` | DigitalOcean Spaces access key |
| `DO_SPACES_SECRET` | DigitalOcean Spaces secret key |
| `DO_SPACES_BUCKET` | Spaces bucket name |
| `CLIENT_URL` | Frontend URL for CORS |

### Frontend
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_SITE_URL` | Frontend URL |

## License

MIT
