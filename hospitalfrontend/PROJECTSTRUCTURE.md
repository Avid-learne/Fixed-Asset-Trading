# Fixed Asset Trading - Project Structure

## Complete File Tree

```
fixed-asset-trading/
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── .env.local
├── README.md
├── PROJECT_STRUCTURE.md
│
├── public/
│   ├── favicon.ico
│   └── assets/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout with providers
│   │   ├── providers.tsx                 # NextAuth provider wrapper
│   │   ├── globals.css                   # Global styles and Tailwind
│   │   ├── page.tsx                      # Landing page
│   │   │
│   │   ├── auth/
│   │   │   ├── signin/
│   │   │   │   └── page.tsx             # Sign in page
│   │   │   ├── signup/
│   │   │   │   └── page.tsx             # Sign up page
│   │   │   └── error/
│   │   │       └── page.tsx             # Auth error page
│   │   │
│   │   ├── patient/
│   │   │   ├── layout.tsx               # Patient portal layout
│   │   │   ├── page.tsx                 # Patient dashboard
│   │   │   ├── deposit/
│   │   │   │   └── page.tsx            # Asset deposit workflow
│   │   │   ├── tokens/
│   │   │   │   └── page.tsx            # Token balance page
│   │   │   ├── benefits/
│   │   │   │   └── page.tsx            # Benefits marketplace
│   │   │   ├── history/
│   │   │   │   └── page.tsx            # Transaction history
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx            # Notifications center
│   │   │   └── settings/
│   │   │       └── page.tsx            # Account settings
│   │   │
│   │   ├── hospital/
│   │   │   ├── layout.tsx               # Hospital portal layout
│   │   │   ├── page.tsx                 # Hospital dashboard
│   │   │   ├── deposits/
│   │   │   │   └── page.tsx            # Approve/reject deposits
│   │   │   ├── minting/
│   │   │   │   └── page.tsx            # Token minting interface
│   │   │   ├── trading/
│   │   │   │   └── page.tsx            # Trading simulation
│   │   │   ├── patients/
│   │   │   │   ├── page.tsx            # Patient list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Patient profile
│   │   │   ├── audit/
│   │   │   │   └── page.tsx            # Audit logs
│   │   │   └── settings/
│   │   │       └── page.tsx            # Hospital settings
│   │   │
│   │   ├── bank/
│   │   │   ├── layout.tsx               # Bank portal layout
│   │   │   ├── page.tsx                 # Bank dashboard
│   │   │   ├── policies/
│   │   │   │   └── page.tsx            # Policy management
│   │   │   ├── assets/
│   │   │   │   └── page.tsx            # Tokenized assets view
│   │   │   └── reports/
│   │   │       └── page.tsx            # Financial reports
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx               # Admin portal layout
│   │   │   ├── page.tsx                 # Admin dashboard
│   │   │   ├── users/
│   │   │   │   ├── page.tsx            # User management
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx        # Edit user
│   │   │   ├── audit/
│   │   │   │   └── page.tsx            # System audit logs
│   │   │   └── settings/
│   │   │       └── page.tsx            # System settings
│   │   │
│   │   └── api/
│   │       └── auth/
│   │           └── [...nextauth]/
│   │               └── route.ts         # NextAuth configuration
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx               # Button component
│   │   │   ├── Input.tsx                # Input component
│   │   │   ├── Card.tsx                 # Card component
│   │   │   ├── Table.tsx                # Table component
│   │   │   ├── Modal.tsx                # Modal dialog
│   │   │   ├── Badge.tsx                # Badge component
│   │   │   ├── Skeleton.tsx             # Loading skeleton
│   │   │   └── Stepper.tsx              # Multi-step workflow
│   │   │
│   │   └── layout/
│   │       ├── Sidebar.tsx              # Navigation sidebar
│   │       ├── Header.tsx               # Top header with user menu
│   │       └── Footer.tsx               # Footer component
│   │
│   ├── lib/
│   │   ├── api.ts                       # Axios API client
│   │   └── utils.ts                     # Utility functions
│   │
│   ├── services/
│   │   ├── assetService.ts              # Asset API calls
│   │   ├── tokenService.ts              # Token API calls
│   │   ├── benefitService.ts            # Benefit API calls
│   │   ├── userService.ts               # User API calls
│   │   └── auditService.ts              # Audit log API calls
│   │
│   ├── store/
│   │   ├── authStore.ts                 # Authentication state
│   │   └── notificationStore.ts         # Notification state
│   │
│   └── types/
│       └── index.ts                     # TypeScript definitions
│
└── .next/                                # Next.js build output (gitignored)
```

## Key Directories Explained

### `/src/app`
Contains all Next.js App Router pages and layouts. Each portal (patient, hospital, bank, admin) has its own directory with dedicated pages.

### `/src/components`
Reusable React components divided into:
- **ui**: Generic UI components (Button, Card, Table, etc.)
- **layout**: Layout-specific components (Sidebar, Header, Footer)

### `/src/lib`
Utility libraries:
- **api.ts**: Centralized API client with interceptors
- **utils.ts**: Helper functions for formatting, validation, etc.

### `/src/services`
API service modules that encapsulate all backend communication. Each service handles a specific domain (assets, tokens, benefits, etc.).

### `/src/store`
Zustand state management stores for global application state.

### `/src/types`
TypeScript type definitions and interfaces used throughout the application.

## File Naming Conventions

- **Pages**: `page.tsx` (Next.js convention)
- **Layouts**: `layout.tsx` (Next.js convention)
- **Components**: PascalCase (e.g., `Button.tsx`, `CardHeader.tsx`)
- **Services**: camelCase with Service suffix (e.g., `assetService.ts`)
- **Stores**: camelCase with Store suffix (e.g., `authStore.ts`)
- **Types**: camelCase (e.g., `index.ts`)

## Route Structure

### Patient Portal Routes
- `/patient` - Dashboard
- `/patient/deposit` - Deposit asset workflow
- `/patient/tokens` - Token balance
- `/patient/benefits` - Benefits marketplace
- `/patient/history` - Transaction history
- `/patient/notifications` - Notifications
- `/patient/settings` - Account settings

### Hospital Portal Routes
- `/hospital` - Dashboard
- `/hospital/deposits` - Approve/reject deposits
- `/hospital/minting` - Token minting
- `/hospital/trading` - Trading simulation
- `/hospital/patients` - Patient management
- `/hospital/audit` - Audit logs
- `/hospital/settings` - Settings

### Bank Portal Routes
- `/bank` - Dashboard
- `/bank/policies` - Policy management
- `/bank/assets` - Tokenized assets
- `/bank/reports` - Financial reports

### Admin Portal Routes
- `/admin` - Dashboard
- `/admin/users` - User management
- `/admin/audit` - System audit logs
- `/admin/settings` - System settings

## API Integration Points

All services connect to backend endpoints at `NEXT_PUBLIC_API_URL`:

- `/api/auth/login` - Authentication
- `/api/assets` - Asset management
- `/api/tokens` - Token operations
- `/api/benefits` - Benefit management
- `/api/users` - User management
- `/api/audit-logs` - Audit trail

## State Management Architecture

### Auth Store
Manages user authentication state, role information, and session data.

### Notification Store
Handles real-time notifications, unread counts, and notification lifecycle.

## Component Hierarchy

```
App Layout
├── SessionProvider
│   ├── Portal Layout (Patient/Hospital/Bank/Admin)
│   │   ├── Sidebar
│   │   ├── Header
│   │   │   └── User Menu
│   │   │   └── Notifications
│   │   └── Main Content
│   │       └── Page Components
│   │           ├── Cards
│   │           ├── Tables
│   │           ├── Charts
│   │           └── Modals
```

## Build & Deployment

```bash
# Development
npm run dev

# Production build
npm run build

# Production server
npm start
```

## Environment Configuration

Required environment variables:
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - Session secret
- `NEXT_PUBLIC_API_URL` - Backend API URL

## TypeScript Configuration

The project uses strict TypeScript with:
- Strict null checks
- No implicit any
- Path aliases (@/ for src/)
- JSX support for React

## Styling Architecture

- **Tailwind CSS** for utility-first styling
- **Custom theme** in tailwind.config.ts
- **Design system** with consistent colors, spacing, and typography
- **Responsive** design patterns throughout

## Testing Structure (To Implement)

```
__tests__/
├── components/
├── pages/
├── services/
└── utils/
```

## Recommended VS Code Extensions

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

## Code Quality Tools

- ESLint for linting
- Prettier for code formatting
- TypeScript for type checking
- Husky for pre-commit hooks (optional)

This structure ensures scalability, maintainability, and clear separation of concerns across the entire frontend application.