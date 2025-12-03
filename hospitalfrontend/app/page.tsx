'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Coins, Shield, Building, TrendingUp, Users, CheckCircle } from 'lucide-react'

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Coins className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-primary">Fixed Asset Trading</span>
          </div>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Secure Healthcare Financing Through Asset Tokenization
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Convert your physical assets into health tokens. Access premium healthcare services while maintaining financial flexibility.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/auth/signin">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600">A transparent, secure system backed by blockchain technology</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-primary" />
              </div>
              <CardTitle>Deposit Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Submit your physical assets for professional valuation and secure custody with our partner hospitals.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-accent-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coins className="w-8 h-8 text-accent" />
              </div>
              <CardTitle>Receive Tokens</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                After approval, receive health tokens based on your asset value, secured on the blockchain.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
              <CardTitle>Access Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Redeem tokens for healthcare services, medications, and wellness programs at partner facilities.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Platform</h2>
            <p className="text-lg text-gray-600">Trusted by patients, hospitals, and financial institutions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Repeat all benefit cards here, same as your original code */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of patients who have secured their healthcare future through asset tokenization.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" variant="secondary">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Repeat footer content same as your original code */}
        </div>
      </footer>
    </div>
  )
}
