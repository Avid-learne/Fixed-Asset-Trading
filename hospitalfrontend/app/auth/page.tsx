"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Coins,
  User,
  Building2,
  CreditCard,
  Shield,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { UserRole } from "@/types";
import { roleToPath } from "@/lib/roleToPath";

interface DemoAccount {
  role: UserRole;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  email: string;
  description: string;
}

const demoAccounts: DemoAccount[] = [
  { role: UserRole.PATIENT, label: "Patient", icon: User, email: "patient@example.com", description: "View deposits, tokens, and health benefits" },
  { role: UserRole.HOSPITAL_STAFF, label: "Hospital Staff", icon: Building2, email: "staff@example.com", description: "Manage deposits and patient records" },
  { role: UserRole.HOSPITAL_ADMIN, label: "Hospital Admin", icon: Building2, email: "admin@example.com", description: "Full hospital system control" },
  { role: UserRole.BANK_OFFICER, label: "Bank Officer", icon: CreditCard, email: "bank@example.com", description: "Approve assets and manage policies" },
  { role: UserRole.SUPER_ADMIN, label: "Super Admin", icon: Shield, email: "superadmin@example.com", description: "System-wide administration" },
];

export default function Auth() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleDemoSignIn = async (account: DemoAccount) => {
    setIsLoading(true);
    setLoadingRole(account.role);
    setError("");

    const result = await signIn('credentials', {
      email: account.email,
      password: 'password', // All demo accounts use 'password'
      redirect: false,
    });

    if (result?.ok) {
      const session = await getSession();
      if (session?.user?.role) {
        const redirectPath = roleToPath(session.user.role as UserRole);
        router.push(redirectPath);
      } else {
        router.push('/patient'); // Fallback
      }
    } else {
      setError("Demo sign-in failed. Please try again.");
      setIsLoading(false);
      setLoadingRole(null);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      const session = await getSession();
      if (session?.user?.role) {
        const redirectPath = roleToPath(session.user.role as UserRole);
        router.push(redirectPath);
      } else {
        router.push('/patient'); // Fallback
      }
    } else {
      setError("Invalid email or password.");
      setIsLoading(false);
    }
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    // Implement your actual sign-up logic here
    setTimeout(() => {
      setIsLoading(false);
      // For now, just show an alert
      alert("Sign-up functionality is not implemented in this demo.");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Coins className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Fixed Asset Trading</h1>
            <p className="mt-1 text-muted-foreground">Healthcare Asset Tokenization Platform</p>
          </div>

          {/* Auth Card */}
          <Card className="shadow-elevated">
            <Tabs defaultValue="signin" className="w-full">
              <CardHeader className="pb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                {error && (
                  <div className="mb-4 rounded-lg border border-error bg-error/10 p-3 text-sm text-error">
                    {error}
                  </div>
                )}
                <TabsContent value="signin" className="mt-0 space-y-6">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading && !loadingRole}>
                      {isLoading && !loadingRole ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                    </Button>
                  </form>

                  <div className="relative">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                      Or continue with demo account
                    </span>
                  </div>

                  <div className="space-y-2">
                    {demoAccounts.map((account) => (
                      <Button
                        key={account.role}
                        variant="outline"
                        className="w-full justify-start"
                        disabled={isLoading}
                        onClick={() => handleDemoSignIn(account)}
                      >
                        {loadingRole === account.role ? (
                          <Loader2 className="mr-3 h-4 w-4 animate-spin" />
                        ) : (
                          <account.icon className="mr-3 h-4 w-4" />
                        )}
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{account.label}</span>
                          <span className="text-xs text-muted-foreground">{account.description}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="signup" className="mt-0 space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input id="signup-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                    </Button>
                  </form>

                  <p className="text-center text-sm text-muted-foreground">
                    By signing up, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
