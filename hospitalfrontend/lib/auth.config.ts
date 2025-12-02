// lib/auth.config.ts
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Define your demo users
const demoUsers = [
  {
    id: '1',
    email: 'patient@example.com',
    password: 'password',
    name: 'John Patient',
    role: 'PATIENT'
  },
  {
    id: '2',
    email: 'staff@example.com',
    password: 'password',
    name: 'Jane Staff',
    role: 'HOSPITAL_STAFF'
  },
  {
    id: '3',
    email: 'admin@example.com',
    password: 'password',
    name: 'Admin User',
    role: 'HOSPITAL_ADMIN'
  },
  {
    id: '4',
    email: 'bank@example.com',
    password: 'password',
    name: 'Bank Officer',
    role: 'BANK_OFFICER'
  }
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        try {
          // Simple demo authentication
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = demoUsers.find(
            user => user.email === credentials.email && user.password === credentials.password
          )

          if (!user) {
            throw new Error('Invalid email or password')
          }

          // Return user object without password
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Add role to token on initial sign in
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      // Add role to session
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  debug: true, // Enable debug in development
  secret: process.env.NEXTAUTH_SECRET,
}