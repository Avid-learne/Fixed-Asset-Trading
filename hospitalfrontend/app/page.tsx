'use client'

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Coins,
  Shield,
  ArrowRight,
  Building2,
  Users,
  Lock,
  CheckCircle,
  ChevronRight,
  CreditCard,
  FileText,
  BarChart,
  Heart,
  Stethoscope,
  BanknoteIcon,
  Activity,
  Award,
  Menu,
  X,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Asset Deposit",
    description:
      "Securely deposit physical assets with verified healthcare institutions. All assets undergo professional appraisal and documentation.",
    icon: BanknoteIcon,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    number: "02",
    title: "Digital Tokenization",
    description:
      "Assets are converted into blockchain-based digital tokens. Each token represents verifiable value backed by physical assets.",
    icon: Coins,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    number: "03",
    title: "Healthcare Benefits",
    description:
      "Receive comprehensive healthcare benefits including consultations, treatments, and insurance coverage from trading returns.",
    icon: Heart,
    color: "text-rose-600",
    bgColor: "bg-rose-50",
  },
];

const features = [
  {
    title: "Regulatory Compliance",
    description: "Fully compliant with financial and healthcare regulations.",
    icon: FileText,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "Bank-Grade Security",
    description: "Enterprise-level security protocols and encrypted transactions.",
    icon: Shield,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    title: "Hospital Partnerships",
    description: "Network of accredited healthcare institutions.",
    icon: Building2,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Transparent Tracking",
    description: "Real-time visibility into asset status and benefits.",
    icon: BarChart,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
];

const benefits = [
  "Comprehensive medical consultations",
  "Prescription medicine coverage",
  "Diagnostic test packages",
  "Specialist treatment access",
  "Preventive care programs",
  "Emergency medical support"
];

const portals = [
  {
    title: "Patients",
    description: "Deposit assets, track tokens, and redeem healthcare services.",
    icon: Users,
    href: "/patient",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "Hospital Admin",
    description: "Manage asset verification, token issuance, and patient benefits.",
    icon: Stethoscope,
    href: "/hospitaladmin",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "Bank Officer",
    description: "Oversee transactions, compliance, and financial auditing.",
    icon: CreditCard,
    href: "/bank",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "System Admin",
    description: "Monitor platform health and manage institutional access.",
    icon: Shield,
    href: "/admin",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
];

const stats = [
  { value: "100%", label: "Asset-Backed", icon: Shield },
  { value: "Bank-Grade", label: "Security", icon: Lock },
  { value: "28+", label: "Partner Hospitals", icon: Building2 },
  { value: "24/7", label: "Monitoring", icon: Activity }
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Header - Light Glass Effect */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl supports-[backdrop-filter]:bg-white/90 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3 group">
              <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 shadow-lg shadow-emerald-500/30">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <div className="text-lg sm:text-xl font-bold text-slate-900">
                  Sehat Vault
                </div>
                <div className="text-xs text-emerald-600 hidden sm:block">Healthcare Finance Platform</div>
              </div>
            </Link>
            
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {["How It Works", "Features", "Benefits", "Portals"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex border-2 border-emerald-200 text-emerald-700 hover:border-emerald-600 transition-all" asChild>
                <Link href="/auth">Sign In</Link>
              </Button>
              <Button size="sm" className="hidden sm:inline-flex bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-500/30" asChild>
                <Link href="/auth">
                  <span className="hidden md:inline">Get Started</span>
                  <span className="md:hidden">Start</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-emerald-50 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6 text-slate-700" />
                ) : (
                  <Menu className="h-6 w-6 text-slate-700" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-slate-200 pt-4 animate-in slide-in-from-top-5">
              <nav className="flex flex-col gap-3">
                {["How It Works", "Features", "Benefits", "Portals"].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors py-2 px-4 rounded-lg hover:bg-emerald-50"
                  >
                    {item}
                  </a>
                ))}
                <div className="flex flex-col gap-2 mt-2 sm:hidden">
                  <Button variant="outline" size="sm" className="w-full border-2 border-emerald-200 text-emerald-700 hover:border-emerald-600" asChild>
                    <Link href="/auth">Sign In</Link>
                  </Button>
                  <Button size="sm" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white" asChild>
                    <Link href="/auth">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Professional & Trustworthy */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-32">
        {/* Background Image with Overlay */}
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Moving background image */}
          <div 
            className="absolute inset-0 bg-cover bg-center animate-slow-pan"
            style={{ 
              backgroundImage: 'url(/hero-image.png)',
              backgroundSize: '110%',
            }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-800/80 to-emerald-900/75"></div>
          {/* Animated gradient orbs */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-teal-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6">
          <div className="mx-auto max-w-5xl text-center">
            {/* Badge */}
            <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-emerald-400/30 px-4 sm:px-6 py-2 sm:py-2.5 shadow-xl shadow-emerald-500/10">
              <Award className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-300" />
              <span className="text-xs sm:text-sm font-semibold text-white">
                Bank & Hospital Verified Platform
              </span>
              <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs px-2 sm:px-3 py-0.5 shadow-lg border-0">Regulated</Badge>
            </div>
            
            {/* Main Heading */}
            <h1 className="mb-4 sm:mb-6 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight drop-shadow-2xl px-4">
              Secure Asset Tokenization for{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                Healthcare Access
              </span>
            </h1>
            
            {/* Description */}
            <p className="mb-8 sm:mb-10 text-base sm:text-lg text-slate-200 leading-relaxed max-w-3xl mx-auto drop-shadow-lg px-4">
              A regulated financial platform connecting physical assets with healthcare benefits. 
              Partnered with accredited hospitals and licensed financial institutions to provide 
              secure, compliant asset management.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 sm:flex-row mb-12 sm:mb-16 px-4">
              <Button 
                size="lg" 
                className="bg-white text-slate-900 hover:bg-slate-50 px-6 sm:px-8 py-5 sm:py-6 text-base shadow-2xl shadow-emerald-500/20 w-full sm:w-auto min-h-[48px]" 
                asChild
              >
                <Link href="/auth">
                  <Shield className="mr-2 h-5 w-5 text-emerald-600" />
                  Secure Access
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-emerald-400/50 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:border-emerald-300 px-6 sm:px-8 py-5 sm:py-6 text-base shadow-xl w-full sm:w-auto min-h-[48px]"
                asChild
              >
                <a href="#how-it-works">
                  Learn More
                  <ChevronRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 px-4">
              {stats.map((stat) => (
                <div 
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 shadow-xl hover:bg-white/15 hover:border-emerald-400/30 transition-all group"
                >
                  <div className="flex items-center justify-center mb-2 sm:mb-3">
                    <div className="bg-gradient-to-br from-emerald-400/20 to-teal-400/20 p-2 sm:p-3 rounded-lg sm:rounded-xl group-hover:from-emerald-400/30 group-hover:to-teal-400/30 transition-all">
                      <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-300" />
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-emerald-100 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Professional Process Flow */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white via-emerald-50/20 to-white relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
          <div className="absolute top-40 -right-20 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-20 left-40 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-6 relative">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Badge className="mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200">
              <FileText className="h-3 w-3 mr-1" />
              Institutional Process
            </Badge>
            <h2 className="mb-4 text-4xl md:text-5xl font-bold text-slate-900">
              How It Works
            </h2>
            <p className="text-slate-600 text-lg">
              A regulated three-step framework designed for security, compliance, and transparency.
            </p>
          </div>
          
          <div className="relative max-w-6xl mx-auto">
            {/* Connection Line */}
            <div className="absolute left-0 right-0 top-24 hidden h-0.5 bg-gradient-to-r from-transparent via-emerald-300 to-transparent md:block" style={{ maxWidth: 'calc(100% - 8rem)', margin: '0 4rem' }} />
            
            <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3 items-start mb-8 sm:mb-10 md:mb-12">
              {steps.map((step, idx) => (
                <div key={step.number} className="relative group h-full">
                  <div className="rounded-xl bg-white p-6 sm:p-7 md:p-8 border-2 border-slate-200 hover:border-emerald-400 hover:shadow-xl transition-all h-full flex flex-col shadow-md">
                    {/* Step Number Badge */}
                    <div className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 bg-gradient-to-br from-emerald-600 to-teal-600 text-white font-bold text-base sm:text-lg w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-4 border-white shadow-lg shadow-emerald-500/40">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className={`mb-4 sm:mb-5 md:mb-6 inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200`}>
                      <step.icon className={`h-7 w-7 sm:h-8 sm:w-8 text-emerald-600`} />
                    </div>
                    
                    <h3 className="mb-2 sm:mb-3 text-lg sm:text-xl font-bold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm sm:text-base flex-grow">
                      {step.description}
                    </p>
                    
                    {/* Arrow */}
                    {idx < steps.length - 1 && (
                      <ArrowRight className="hidden md:block absolute -right-12 top-24 text-emerald-400 h-6 w-6" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features - Professional Grid */}
      <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white via-slate-50 to-white relative overflow-hidden border-t border-slate-200">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 right-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
          <div className="absolute bottom-20 -left-20 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="mx-auto mb-8 sm:mb-12 md:mb-16 max-w-3xl text-center">
            <Badge className="mb-3 sm:mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs sm:text-sm">
              <Shield className="h-3 w-3 mr-1" />
              Platform Features
            </Badge>
            <h2 className="mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 px-4">
              Enterprise-Grade Security
            </h2>
            <p className="text-slate-600 text-base sm:text-lg px-4">
              Built with institutional standards, regulatory compliance, and bank-level security.
            </p>
          </div>
          
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="rounded-xl bg-white border-2 border-slate-200 p-5 sm:p-6 hover:border-emerald-400 hover:shadow-xl transition-all group shadow-md min-h-[48px]"
              >
                <div className={`mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 group-hover:bg-emerald-100 transition-all`}>
                  <feature.icon className={`h-6 w-6 sm:h-7 sm:w-7 text-emerald-600`} />
                </div>
                <h3 className="mb-2 font-bold text-slate-900 text-lg">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Blockchain Technology Section */}
          <div className="mt-8 sm:mt-12 md:mt-16 max-w-6xl mx-auto">
            <div 
              className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl min-h-[280px] sm:min-h-[350px] bg-cover bg-center flex items-center border border-white/20"
              style={{ backgroundImage: 'url(/eth.png)' }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-900/50"></div>
              <div className="relative z-10 px-6 sm:px-8 md:px-16 py-8 sm:py-10 md:py-12 max-w-2xl">
                <Badge className="mb-3 sm:mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-lg text-xs sm:text-sm">
                  <Shield className="h-3 w-3 mr-1" />
                  Blockchain Powered
                </Badge>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
                  Built on Ethereum Blockchain
                </h3>
                <p className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed drop-shadow-md">
                  Leveraging decentralized technology for transparent, immutable, and secure healthcare asset tokenization with full traceability and compliance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Access Portals - Professional Access */}
      <section id="portals" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white via-emerald-50/20 to-white border-t border-slate-200 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-40 left-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
          <div className="absolute -bottom-20 right-40 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="mx-auto mb-8 sm:mb-12 md:mb-16 max-w-3xl text-center">
            <Badge className="mb-3 sm:mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs sm:text-sm">
              <Lock className="h-3 w-3 mr-1" />
              Secure Access
            </Badge>
            <h2 className="mb-3 sm:mb-4 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 px-4">
              Role-Based Access Control
            </h2>
            <p className="text-slate-600 text-base sm:text-lg px-4">
              Dedicated portals for each stakeholder to maintain operational integrity and security.
            </p>
          </div>
          
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto mb-8 sm:mb-12 md:mb-16">
            {portals.map((portal) => (
              <Link
                key={portal.title}
                href={portal.href}
                className={`group rounded-xl bg-white border-2 border-slate-200 p-5 sm:p-6 hover:border-emerald-400 hover:shadow-xl transition-all shadow-md min-h-[48px]`}
              >
                {/* Icon with Background */}
                <div className={`mb-3 sm:mb-4 inline-flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 group-hover:bg-emerald-100 transition-all`}>
                  <portal.icon className={`h-6 w-6 sm:h-7 sm:w-7 text-emerald-600`} />
                </div>
                
                <h3 className="mb-2 font-bold text-slate-900 text-base sm:text-lg">
                  {portal.title}
                </h3>
                <p className="mb-3 sm:mb-4 text-slate-600 text-sm leading-relaxed">
                  {portal.description}
                </p>
                
                {/* CTA with Arrow */}
                <div className={`inline-flex items-center text-xs sm:text-sm font-semibold text-emerald-600`}>
                  Access Portal
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>

          {/* Success Metrics Section */}
          <div className="mt-6 sm:mt-8 bg-white rounded-xl sm:rounded-2xl border-2 border-slate-200 shadow-xl p-5 sm:p-6 md:p-8 max-w-7xl mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-2 px-4">Platform Performance</h3>
              <p className="text-slate-600 text-sm sm:text-base px-4">Real-time metrics from our verified institutional network</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <div className="text-center p-4 sm:p-5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-700 mb-1">500+</div>
                <div className="text-xs sm:text-sm text-slate-600">Active Patients</div>
              </div>
              <div className="text-center p-4 sm:p-5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-700 mb-1">PKR 50M+</div>
                <div className="text-xs sm:text-sm text-slate-600">Assets Tokenized</div>
              </div>
              <div className="text-center p-4 sm:p-5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-700 mb-1">99.8%</div>
                <div className="text-xs sm:text-sm text-slate-600">Uptime</div>
              </div>
              <div className="text-center p-4 sm:p-5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-emerald-700 mb-1">24/7</div>
                <div className="text-xs sm:text-sm text-slate-600">Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - Professional Layout */}
      <section id="benefits" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white via-slate-50 to-white border-t border-slate-200 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="grid gap-8 sm:gap-10 md:gap-12 lg:grid-cols-2 items-center max-w-7xl mx-auto">
            <div>
              <Badge className="mb-4 sm:mb-6 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs sm:text-sm">
                <Heart className="h-3 w-3 mr-1" />
                Healthcare Benefits
              </Badge>
              <h2 className="mb-4 sm:mb-6 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900">
                Comprehensive Healthcare Coverage
              </h2>
              <p className="mb-6 sm:mb-8 text-slate-600 leading-relaxed text-base sm:text-lg">
                Convert verified asset value into accessible healthcare services through 
                our network of accredited partner institutions.
              </p>
              
              <div className="space-y-3 mb-8">
                {benefits.map((benefit) => (
                  <div 
                    key={benefit} 
                    className="flex items-start gap-3 bg-white rounded-lg p-4 border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center mt-0.5 shadow-md shadow-emerald-500/30">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-6 shadow-xl shadow-emerald-500/30" 
                asChild
              >
                <Link href="/auth">
                  Enroll in Program
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="relative mt-8 lg:mt-0">
              <div className="rounded-xl sm:rounded-2xl bg-white p-6 sm:p-8 md:p-10 border-2 border-slate-200 shadow-xl">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center mb-4 sm:mb-6 shadow-lg shadow-emerald-500/30">
                    <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">
                    Healthcare Benefits Portal
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-6 sm:mb-8 text-sm">
                    Real-time tracking of available benefits and service utilization
                  </p>
                  
                  {/* Mini Stats */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
                    <div className="bg-emerald-50 rounded-xl p-4 sm:p-5 border border-emerald-200">
                      <div className="text-xl sm:text-2xl font-bold text-emerald-700">PKR 250,000</div>
                      <div className="text-xs text-slate-600 mt-1">Avg. Benefits</div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 sm:p-5 border border-emerald-200">
                      <div className="text-xl sm:text-2xl font-bold text-emerald-700">100%</div>
                      <div className="text-xs text-slate-600 mt-1">Verified</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Professional */}
      <footer className="border-t-2 border-slate-200 bg-white py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-6 sm:gap-8 md:flex-row mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 shadow-lg shadow-emerald-500/30">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <div className="text-base sm:text-lg font-bold text-slate-900">
                  Sehat Vault
                </div>
                <div className="text-xs sm:text-sm text-slate-600">Healthcare Finance Platform</div>
              </div>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <a href="#how-it-works" className="text-xs sm:text-sm text-slate-600 hover:text-emerald-600 transition-colors">How It Works</a>
              <a href="#features" className="text-xs sm:text-sm text-slate-600 hover:text-emerald-600 transition-colors">Features</a>
              <a href="#benefits" className="text-xs sm:text-sm text-slate-600 hover:text-emerald-600 transition-colors">Benefits</a>
              <a href="#portals" className="text-xs sm:text-sm text-slate-600 hover:text-emerald-600 transition-colors">Portals</a>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-6 sm:pt-8 text-center">
            <p className="text-xs sm:text-sm text-slate-600 mb-3 px-4">
              © {new Date().getFullYear()} Sehat Vault. All rights reserved. Regulated financial technology platform.
            </p>
            <div className="flex justify-center gap-2 sm:gap-3 flex-wrap px-4">
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Bank-Grade Security
              </Badge>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified Institutions
              </Badge>
              <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                <Award className="h-3 w-3 mr-1" />
                Regulatory Compliant
              </Badge>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}