'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Coins, Shield, Building, TrendingUp, Users, CheckCircle, HeartPulse, Lock, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const benefits = [
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: 'Asset Security',
      description: 'Your assets are stored securely with institutional-grade custody solutions.',
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: 'Financial Growth',
      description: 'Participate in a growing digital asset ecosystem with potential for appreciation.',
    },
    {
      icon: <HeartPulse className="w-8 h-8 text-primary" />,
      title: 'Healthcare Access',
      description: 'Seamlessly pay for medical services using your tokenized assets.',
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: 'Community Trust',
      description: 'Join a network of trusted hospitals, banks, and patients.',
    },
    {
      icon: <Lock className="w-8 h-8 text-primary" />,
      title: 'Data Privacy',
      description: 'Your financial and medical data is protected with the highest security standards.',
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-primary" />,
      title: 'Transparent Audits',
      description: 'All transactions are recorded on an immutable blockchain for full transparency.',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
          Revolutionizing Healthcare Financing with Asset Tokenization
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Unlock the value of your physical assets to secure premium healthcare services. A modern solution for financial flexibility and peace of mind.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/auth/signin">
            <Button size="lg" className="w-full sm:w-auto group">
              Get Started <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">A simple, transparent, and secure process powered by blockchain technology.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Card className="text-center border-2 border-transparent hover:border-primary hover:shadow-xl transition-all">
              <CardHeader>
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold">1. Deposit Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Submit your physical assets for professional valuation and secure custody with our trusted partner hospitals.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-transparent hover:border-primary hover:shadow-xl transition-all">
              <CardHeader>
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Coins className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold">2. Receive Health Tokens</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Receive health tokens equivalent to your asset's value, securely recorded on the blockchain.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-transparent hover:border-primary hover:shadow-xl transition-all">
              <CardHeader>
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-semibold">3. Access Benefits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Redeem your tokens for a wide range of healthcare services, medications, and wellness programs.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Trusted by patients, hospitals, and financial institutions for a secure and transparent experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Secure Your Healthcare Future?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of patients who are taking control of their healthcare financing.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Fixed Asset Trading. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link href="#" className="hover:text-white">Privacy Policy</Link>
              <Link href="#" className="hover:text-white">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
