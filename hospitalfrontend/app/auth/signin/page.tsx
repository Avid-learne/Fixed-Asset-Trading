// src/app/auth/signin/page.tsx
'use client'

import React, { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Button } from '@/components/ui/button'
import { Coins } from 'lucide-react'
import { roleToPath } from '@/lib/roleToPath'
import { UserRole } from '@/types'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error.includes('CredentialsSignin')) {
          setError('Invalid email or password')
        } else {
          setError(`Authentication failed: ${result.error}`)
        }
      } else if (result?.ok) {
        // Successful login, get session to find user's role
        const session = await getSession()
        if (session?.user?.role) {
          const redirectPath = roleToPath(session.user.role as UserRole)
          router.push(redirectPath)
          router.refresh() // Refresh to ensure layout gets new session
        } else {
          // Fallback if role is not in session for some reason
          router.push(callbackUrl)
          router.refresh()
        }
      }
    } catch (error: any) {
      console.error('Sign in error:', error)
      setError(error.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    // Clear error when user starts typing
    if (error) setError('')
  }

  // Demo account helper function
  const fillDemoAccount = (email: string, password: string = 'password') => {
    setFormData({ email, password })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-secondary flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Coins className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Fixed Asset Trading</CardTitle>
          <p className="text-sm text-gray-500 mt-2">
            Sign in to your account to continue
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-error/10 border border-error text-error text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <FormField
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

            <FormField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="font-medium mb-2">Demo Accounts (click to fill):</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemoAccount('patient@example.com')}
                className="block w-full p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <span className="font-medium">Patient:</span> patient@example.com / password
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('staff@example.com')}
                className="block w-full p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <span className="font-medium">Hospital Staff:</span> staff@example.com / password
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('admin@example.com')}
                className="block w-full p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <span className="font-medium">Hospital Admin:</span> admin@example.com / password
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('bank@example.com')}
                className="block w-full p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <span className="font-medium">Bank Officer:</span> bank@example.com / password
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount('superadmin@example.com', 'password')}
                className="block w-full p-2 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                <span className="font-medium">Super Admin:</span> superadmin@example.com / password
              </button>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                All demo accounts use <code className="bg-gray-100 px-1 rounded">password</code> as password
              </p>
              <p className="text-xs text-gray-500 mt-1">
                After login, you'll be redirected to your role-specific dashboard
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}