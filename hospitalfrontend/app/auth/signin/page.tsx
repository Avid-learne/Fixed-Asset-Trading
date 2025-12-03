// src/app/auth/signin/page.tsx
'use client'

import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Coins } from 'lucide-react'

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
        // Successful login - determine redirect based on user role
        let redirectPath = '/'
        
        // Determine role from email (for demo purposes)
        // In production, you would get this from the session or token
        const email = formData.email.toLowerCase()
        
        if (email.includes('patient')) {
          redirectPath = '/patient'
        } else if (email.includes('staff') || email.includes('admin@example.com')) {
          redirectPath = '/hospital'
        } else if (email.includes('bank')) {
          redirectPath = '/bank'
        } else if (email.includes('super')) {
          redirectPath = '/admin'
        } else {
          // Default fallback - try to use callbackUrl if it's not the landing page
          redirectPath = callbackUrl !== '/' ? callbackUrl : '/patient'
        }
        
        // Add small delay to ensure session is set
        setTimeout(() => {
          router.push(redirectPath)
          router.refresh()
        }, 100)
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

            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

            <Input
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
              loading={loading}
            >
              Sign In
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