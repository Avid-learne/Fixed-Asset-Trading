# Fixed Asset Trading - Healthcare Fintech Platform

A comprehensive Next.js frontend application for a healthcare-fintech system that enables patients to tokenize physical assets and receive health benefits.

## System Overview

The platform allows patients to deposit physical assets which are then tokenized by hospitals. These tokens can be traded to generate returns and are redeemable for healthcare benefits.

### User Roles

- **Patient**: Deposit assets, view token balance, redeem benefits
- **Hospital_Staff**: Review and approve asset deposits
- **Hospital_Admin**: Approve deposits, mint tokens, run trading simulations
- **Bank_Officer**: Monitor policies, assets, and financial reports
- **Super_Admin**: Manage users, roles, and system settings

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI + Radix UI
- **State Management**: Zustand
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/
│   ├── patient/           # Patient portal pages
│   ├── hospital/          # Hospital portal pages
│   ├── bank/              # Bank portal pages
│   ├── admin/             # Admin portal pages
│   ├── auth/              # Authentication pages
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   ├── providers.tsx      # App providers
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   └── layout/            # Layout components
├── lib/
│   ├── api.ts             # API client
│   └── utils.ts           # Utility functions
├── services/              # API service modules
├── store/                 # Zustand state stores
└── types/                 # TypeScript type definitions
```

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local

# Run development server
npm run dev
```

## Environment Variables

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Features

### Patient Portal
- Dashboard with token balance and recent activity
- Asset deposit workflow with stepper
- Token balance tracking with charts
- Benefits marketplace with redemption
- Complete transaction history
- Profile settings and security

### Hospital Portal
- Dashboard with pending deposits and analytics
- Asset approval/rejection workflow
- Token minting interface
- Trading simulation with real-time charts
- Patient profile management
- Comprehensive audit logs

### Bank Portal
- Financial oversight dashboard
- Policy management
- Asset distribution analytics
- Compliance monitoring
- Risk assessment reports

### Super Admin Portal
- User management
- Role-based access control
- System configuration
- Global audit logs

## Key Components

### Authentication
- Role-based authentication with NextAuth
- Protected routes with middleware
- Session management
- Automatic role-based redirects

### API Integration
- Centralized API client with interceptors
- Automatic token refresh
- Error handling
- Type-safe service modules

### State Management
- Auth store for user session
- Notification store for real-time alerts
- Persistent state across navigation

### UI Components
- Button, Input, Card, Table, Modal
- Stepper for multi-step workflows
- Badge for status indicators
- Skeleton loaders for better UX
- Charts for data visualization

## Design System

### Colors
- Primary: #0A3D62 (Deep Blue)
- Secondary: #3C6382 (Steel Blue)
- Accent: #38ADA9 (Teal)
- Success: #27AE60 (Green)
- Warning: #E2B93B (Yellow)
- Error: #C0392B (Red)
- Background: #F8F9FA (Light Gray)

### Typography
- Font Family: Inter, IBM Plex Sans
- Responsive font sizes
- Consistent spacing

## API Endpoints

The frontend expects the following API structure:

```
/api/auth/login
/api/assets
/api/tokens
/api/benefits
/api/users
/api/audit-logs
```

## Development Guidelines

### Component Creation
- Use functional components with TypeScript
- Implement proper prop types
- Follow single responsibility principle
- Use composition over inheritance

### State Management
- Use Zustand for global state
- Keep local state in components when possible
- Implement proper error boundaries

### API Calls
- Use service modules for API calls
- Implement proper error handling
- Show loading states
- Handle edge cases

### Styling
- Use Tailwind utility classes
- Follow responsive design principles
- Maintain consistent spacing
- Use design system colors

## Security

- JWT-based authentication
- Role-based access control (RBAC)
- Protected API routes
- Secure session management
- Input validation
- XSS protection

## Performance

- Code splitting with Next.js
- Image optimization
- Lazy loading components
- Memoization where needed
- Optimized bundle size

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

Proprietary - All rights reserved

## Support

For support, email support@fixedassettrading.com