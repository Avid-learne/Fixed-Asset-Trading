'use client'

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
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Asset Deposit",
    description:
      "Securely deposit physical assets with verified healthcare institutions. All assets undergo professional appraisal and documentation.",
    icon: BanknoteIcon,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
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
    color: "text-blue-600",
    bgColor: "bg-blue-50",
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
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    title: "Hospital Admin",
    description: "Manage asset verification, token issuance, and patient benefits.",
    icon: Stethoscope,
    href: "/hospitaladmin",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
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
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header - Modern with Glass Effect */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-900">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">
                  AssetBridge
                </div>
                <div className="text-xs text-slate-600">Healthcare Finance Platform</div>
              </div>
            </Link>
            
            <nav className="hidden items-center gap-8 md:flex">
              {["How It Works", "Features", "Benefits", "Portals"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm font-medium text-slate-600 hover:text-blue-900 transition-colors"
                >
                  {item}
                </a>
              ))}
            </nav>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="border-slate-300 hover:border-blue-900 hover:text-blue-900" asChild>
                <Link href="/auth">Sign In</Link>
              </Button>
              <Button size="sm" className="bg-blue-900 hover:bg-blue-800 text-white" asChild>
                <Link href="/auth">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Professional & Trustworthy */}
      <section className="relative overflow-hidden py-24 lg:py-32 bg-gradient-to-b from-slate-50 to-white">
        {/* Subtle Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent"></div>

        <div className="relative container mx-auto px-6">
          <div className="mx-auto max-w-5xl text-center">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-100 to-blue-100 border border-cyan-200 px-5 py-2 shadow-sm">
              <Award className="h-4 w-4 text-cyan-600" />
              <span className="text-sm font-semibold text-cyan-700">
                Bank & Hospital Verified Platform
              </span>
              <Badge className="bg-cyan-600 text-white text-xs px-2.5 py-0.5">Regulated</Badge>
            </div>
            
            {/* Main Heading */}
            <h1 className="mb-6 text-5xl font-bold text-slate-900 sm:text-6xl lg:text-7xl leading-tight">
              Secure Asset Tokenization for{" "}
              <span className="text-blue-900">
                Healthcare Access
              </span>
            </h1>
            
            {/* Description */}
            <p className="mb-10 text-lg text-slate-600 leading-relaxed max-w-3xl mx-auto">
              A regulated financial platform connecting physical assets with healthcare benefits. 
              Partnered with accredited hospitals and licensed financial institutions to provide 
              secure, compliant asset management.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row mb-16">
              <Button 
                size="lg" 
                className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-6 text-base shadow-lg" 
                asChild
              >
                <Link href="/auth">
                  <Shield className="mr-2 h-5 w-5" />
                  Secure Access
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-slate-300 hover:border-blue-900 hover:bg-slate-50 px-8 py-6 text-base"
                asChild
              >
                <a href="#how-it-works">
                  Learn More
                  <ChevronRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat) => (
                <div 
                  key={stat.label}
                  className="bg-white rounded-xl p-6 border-2 border-slate-200 shadow-md hover:border-blue-900/20 hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-center mb-3">
                    <div className="bg-blue-900/5 p-3 rounded-lg">
                      <stat.icon className="h-6 w-6 text-blue-900" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                  <div className="text-sm text-slate-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Professional Process Flow */}
      <section id="how-it-works" className="py-24 bg-white border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Badge className="mb-4 bg-blue-900/5 text-blue-900 border-blue-900/10">
              <FileText className="h-3 w-3 mr-1" />
              Institutional Process
            </Badge>
            <h2 className="mb-4 text-4xl font-bold text-slate-900">
              How It Works
            </h2>
            <p className="text-slate-600 text-lg">
              A regulated three-step framework designed for security, compliance, and transparency.
            </p>
          </div>
          
          <div className="relative max-w-6xl mx-auto">
            {/* Connection Line */}
            <div className="absolute left-0 right-0 top-24 hidden h-0.5 bg-slate-200 md:block" style={{ maxWidth: 'calc(100% - 8rem)', margin: '0 4rem' }} />
            
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, idx) => (
                <div key={step.number} className="relative group">
                  <div className="rounded-xl bg-white p-8 border-2 border-slate-200 hover:border-blue-900/20 hover:shadow-lg transition-all">
                    {/* Step Number Badge */}
                    <div className="absolute -top-4 -right-4 bg-blue-900 text-white font-bold text-lg w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                      {step.number}
                    </div>
                    
                    {/* Icon */}
                    <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-blue-900/5`}>
                      <step.icon className={`h-7 w-7 text-blue-900`} />
                    </div>
                    
                    <h3 className="mb-3 text-lg font-bold text-slate-900">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      {step.description}
                    </p>
                    
                    {/* Arrow */}
                    {idx < steps.length - 1 && (
                      <ArrowRight className="hidden md:block absolute -right-12 top-20 text-slate-300 h-6 w-6" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features - Professional Grid */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Badge className="mb-4 bg-white text-blue-900 border-2 border-blue-900/10">
              <Shield className="h-3 w-3 mr-1" />
              Platform Features
            </Badge>
            <h2 className="mb-4 text-4xl font-bold text-slate-900">
              Enterprise-Grade Security
            </h2>
            <p className="text-slate-600 text-lg">
              Built with institutional standards, regulatory compliance, and bank-level security.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {features.map((feature, idx) => (
              <div
                key={feature.title}
                className="rounded-xl border-2 border-slate-200 bg-white p-6 hover:border-blue-900/20 hover:shadow-md transition-all"
              >
                <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-900/5`}>
                  <feature.icon className={`h-6 w-6 text-blue-900`} />
                </div>
                <h3 className="mb-2 font-bold text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Access Portals - Professional Access */}
      <section id="portals" className="py-24 bg-white border-t border-slate-200">
        <div className="container mx-auto px-6">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Badge className="mb-4 bg-blue-900/5 text-blue-900 border-blue-900/10">
              <Lock className="h-3 w-3 mr-1" />
              Secure Access
            </Badge>
            <h2 className="mb-4 text-4xl font-bold text-slate-900">
              Role-Based Access Control
            </h2>
            <p className="text-slate-600 text-lg">
              Dedicated portals for each stakeholder to maintain operational integrity and security.
            </p>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
            {portals.map((portal) => (
              <Link
                key={portal.title}
                href={portal.href}
                className={`group rounded-xl border-2 border-slate-200 bg-white p-6 hover:border-blue-900/20 hover:shadow-md transition-all`}
              >
                {/* Icon with Background */}
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-900/5`}>
                  <portal.icon className={`h-6 w-6 text-blue-900`} />
                </div>
                
                <h3 className="mb-2 font-bold text-slate-900">
                  {portal.title}
                </h3>
                <p className="mb-4 text-slate-600 text-sm leading-relaxed">
                  {portal.description}
                </p>
                
                {/* CTA with Arrow */}
                <div className={`inline-flex items-center text-sm font-semibold text-blue-900`}>
                  Access Portal
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits - Professional Layout */}
      <section id="benefits" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid gap-12 lg:grid-cols-2 items-center max-w-7xl mx-auto">
            <div>
              <Badge className="mb-6 bg-white text-blue-900 border-2 border-blue-900/10">
                <Heart className="h-3 w-3 mr-1" />
                Healthcare Benefits
              </Badge>
              <h2 className="mb-6 text-4xl font-bold text-slate-900">
                Comprehensive Healthcare Coverage
              </h2>
              <p className="mb-8 text-slate-600 leading-relaxed">
                Convert verified asset value into accessible healthcare services through 
                our network of accredited partner institutions.
              </p>
              
              <div className="space-y-3 mb-8">
                {benefits.map((benefit) => (
                  <div 
                    key={benefit} 
                    className="flex items-start gap-3 bg-white rounded-lg p-4 border border-slate-200"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center mt-0.5">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-slate-700">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                size="lg" 
                className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-6" 
                asChild
              >
                <Link href="/auth">
                  Enroll in Program
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <div className="relative">
              <div className="rounded-xl bg-white p-10 border-2 border-slate-200 shadow-lg">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-lg bg-blue-900 flex items-center justify-center mb-6">
                    <Heart className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    Healthcare Benefits Portal
                  </h3>
                  <p className="text-slate-600 leading-relaxed mb-8 text-sm">
                    Real-time tracking of available benefits and service utilization
                  </p>
                  
                  {/* Mini Stats */}
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xl font-bold text-blue-900">$2,500</div>
                      <div className="text-xs text-slate-600">Avg. Benefits</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="text-xl font-bold text-blue-900">100%</div>
                      <div className="text-xs text-slate-600">Verified</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Professional */}
      <footer className="border-t-2 border-slate-200 bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-between gap-8 md:flex-row mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-900">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-slate-900">
                  AssetBridge
                </div>
                <div className="text-sm text-slate-600">Healthcare Finance Platform</div>
              </div>
            </div>
            
            <div className="flex gap-6">
              <a href="#how-it-works" className="text-sm text-slate-600 hover:text-blue-900 transition-colors">How It Works</a>
              <a href="#features" className="text-sm text-slate-600 hover:text-blue-900 transition-colors">Features</a>
              <a href="#benefits" className="text-sm text-slate-600 hover:text-blue-900 transition-colors">Benefits</a>
              <a href="#portals" className="text-sm text-slate-600 hover:text-blue-900 transition-colors">Portals</a>
            </div>
          </div>
          
          <div className="border-t border-slate-200 pt-8 text-center">
            <p className="text-sm text-slate-600 mb-3">
              © {new Date().getFullYear()} AssetBridge. All rights reserved. Regulated financial technology platform.
            </p>
            <div className="flex justify-center gap-3">
              <Badge className="bg-slate-100 text-slate-700 border border-slate-200 text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Bank-Grade Security
              </Badge>
              <Badge className="bg-slate-100 text-slate-700 border border-slate-200 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified Institutions
              </Badge>
              <Badge className="bg-slate-100 text-slate-700 border border-slate-200 text-xs">
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