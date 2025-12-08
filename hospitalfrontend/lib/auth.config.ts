// lib/auth.config.ts
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const demoUsers = [
  {
    id: '1',
    email: 'ahmed.patient@lnh.com',
    password: 'password',
    name: 'Ahmed Patient',
    role: 'PATIENT'
  },
  {
    id: '2',
    email: 'staff@lnh.com',
    password: 'password',
    name: 'Jane Staff',
    role: 'HOSPITAL_STAFF'
  },
  {
    id: '3',
    email: 'admin@lnh.com',
    password: 'password',
    name: 'Admin User',
    role: 'HOSPITAL_ADMIN'
  },
  {
    id: '4',
    email: 'officer@nbp.com',
    password: 'password',
    name: 'Bank Officer',
    role: 'BANK_OFFICER'
  }
  ,
  {
    id: '5',
    email: 'superadmin@lnh.com',
    password: 'password',
    name: 'Super Admin',
    role: 'SUPER_ADMIN'
  }
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = demoUsers.find(
          u => u.email === credentials.email && u.password === credentials.password
        )

        if (!user) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role
      }
      return token
    },

    async session({ session, token }) {
      if (session && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
      }
      return session
    }
  },

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60
  },

  pages: {
    signIn: '/auth',
    error: '/auth/error'
  },

  debug: true,
  secret: process.env.NEXTAUTH_SECRET
}
