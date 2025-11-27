# Hospital Asset Platform - Setup Instructions

## Prerequisites
- Node.js 20.x or higher
- npm or pnpm
- MetaMask or another Web3 wallet

## Installation Steps

### 1. Install Dependencies
```bash
cd hospital-frontend
npm install
```

This will install:
- Next.js 16
- React 19
- Tailwind CSS 4
- bcryptjs for password hashing
- TypeScript

### 2. Run Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 3. Initial Setup

1. Navigate to `http://localhost:3000`
2. Click "Register" to create an account
3. Choose your role (Patient, Bank, or Hospital)
4. Enter your details:
   - Full Name
   - Wallet Address (format: 0x...)
   - Password (minimum 6 characters)

### 4. Login

After registration, you'll be redirected to the login page where you can sign in with your wallet address and password.

## Default Test Accounts

For testing purposes, you can create accounts with these wallet addresses:

**Patient:**
- Address: `0x742d35Cc6634C0532925a3b844Bc9e7595f7f4e8f`
- Role: patient

**Bank:**
- Address: `0x9a3c7d2b8f1e4c6a5d8b7c9e2f4a6b8c1d3e5f7a`
- Role: bank

**Hospital:**
- Address: `0x1f8e3c9a7b5d2f4c6e8a1b3c5d7e9f2a4b6c8d1e`
- Role: hospital

## Security Notes

1. **Password Hashing**: All passwords are hashed using bcryptjs before storage
2. **Session Management**: Sessions expire after 24 hours
3. **Role-Based Access**: Each role can only access their designated portal
4. **Wallet Validation**: Ethereum address format is validated on registration

## Features

### Authentication System
- Secure registration with password hashing
- Role-based login (Patient, Bank, Hospital)
- Session management with automatic expiration
- Protected routes

### User Interface
- Professional, minimal design
- Responsive layout for all devices
- Dark/light mode support
- Smooth animations and transitions

### Dashboards
- **Patient Portal**: View tokens, deposit assets, redeem benefits
- **Bank Portal**: Verify deposits, mint asset tokens
- **Hospital Portal**: Record trades, distribute health tokens

## Troubleshooting

### "Module not found: Can't resolve 'bcryptjs'"
```bash
npm install bcryptjs @types/bcryptjs
```

### "Session not found" errors
Clear your browser's localStorage:
```javascript
localStorage.clear()
```

### Port already in use
```bash
# Use a different port
npm run dev -- -p 3001
```

## Production Deployment

For production, you should:
1. Use a proper database (PostgreSQL, MongoDB)
2. Implement server-side session management
3. Add JWT tokens for API authentication
4. Enable HTTPS
5. Add rate limiting
6. Implement proper error logging

## Smart Contract Integration

To connect with your Hardhat contracts:
1. Deploy contracts using the deploy script
2. Copy contract addresses to `lib/utils/constants.ts`
3. Import ABIs from the artifacts folder
4. Use ethers.js to interact with contracts

## Support

For issues or questions, refer to the project documentation or create an issue in the repository.