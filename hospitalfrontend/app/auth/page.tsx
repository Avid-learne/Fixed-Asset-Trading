"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import { authService } from "@/lib/authService";
import { useAuth } from "@/contexts/AuthContext";

interface DemoAccount {
  role: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  email: string;
  password: string;
  description: string;
}

const demoAccounts: DemoAccount[] = [
  { role: "PATIENT", label: "Patient", icon: User, email: "demo.patient@hospital.com", password: "Demo@123", description: "View deposits, tokens, and health benefits" },
  { role: "HOSPITAL_STAFF", label: "Hospital Staff", icon: Building2, email: "demo.staff@hospital.com", password: "Demo@123", description: "Manage deposits and patient records" },
  { role: "HOSPITAL_ADMIN", label: "Hospital Admin", icon: Building2, email: "demo.admin@hospital.com", password: "Demo@123", description: "Full hospital system control" },
  { role: "BANK_STAFF", label: "Bank Officer", icon: CreditCard, email: "demo.officer@bank.com", password: "Demo@123", description: "Approve assets and manage policies" },
  { role: "ADMIN", label: "Super Admin", icon: Shield, email: "demo.superadmin@admin.com", password: "Demo@123", description: "System-wide administration" },
];

export default function Auth() {
  const router = useRouter();
  const { login: contextLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cnic, setCnic] = useState("");
  const [wallet, setWallet] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [hospitals, setHospitals] = useState<string[]>([]);
  const [hospitalsLoading, setHospitalsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadHospitalsOnMount = async () => {
      const hospitalNames = await authService.getHospitals();
      if (isMounted) {
        setHospitals(hospitalNames);
        setHospitalsLoading(false);
      }
    };

    loadHospitalsOnMount();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDemoSignIn = async (account: DemoAccount) => {
    setIsLoading(true);
    setLoadingRole(account.role);
    setError("");

    try {
      await contextLogin(account.email, account.password);
      
      setSuccessMessage("Login successful! Redirecting...");
      const path = authService.getRoleRedirectPath(account.role);
      router.push(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during login");
      setIsLoading(false);
      setLoadingRole(null);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await contextLogin(email, password);
      
      // Get user role from stored data
      const storedUser = authService.getUser();
      const userRole = storedUser?.role || 'PATIENT';
      
      setSuccessMessage("Login successful! Redirecting...");
      const path = authService.getRoleRedirectPath(userRole);
      router.push(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Validate
    if (!name || !email || !password || !cnic || !hospitalName) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (!cnic || cnic.trim().length === 0) {
      setError("CNIC is required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.signup({
        email,
        password,
        name,
        cnic,
        role: "patient",
        walletAddress: wallet || undefined,
        hospitalName: hospitalName || undefined,
      });

      if (response.success) {
        // Clear form
        setEmail("");
        setPassword("");
        setName("");
        setCnic("");
        setWallet("");
        setHospitalName("");
        
        // Show success and redirect
        setSuccessMessage("Account created successfully! Redirecting...");
        const path = authService.getRoleRedirectPath(response.role);
        router.push(path);
      } else {
        setError(response.message || "Sign-up failed. Please try again");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
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
            <h1 className="text-2xl font-bold text-foreground">SehatVault</h1>
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
                {successMessage && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-500 bg-green-500/10 p-3 text-sm text-green-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {successMessage}
                  </div>
                )}
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
                      <Input id="signup-name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-cnic">CNIC <span className="text-error">*</span></Label>
                      <Input 
                        id="signup-cnic" 
                        type="text" 
                        placeholder="12345-6789012-3" 
                        value={cnic} 
                        onChange={(e) => setCnic(e.target.value)} 
                        required 
                      />
                      <p className="text-xs text-muted-foreground">Your CNIC number is required for identity verification</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-hospital">
                        Hospital <span className="text-error">*</span>
                      </Label>
                      <select
                        id="signup-hospital"
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        required
                        disabled={hospitalsLoading}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                      >
                        <option value="">
                          {hospitalsLoading ? "Loading hospitals..." : "Select your hospital"}
                        </option>
                        {hospitals.map((hospital) => (
                          <option key={hospital} value={hospital}>
                            {hospital}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-wallet">Wallet Address (Optional)</Label>
                      <Input 
                        id="signup-wallet" 
                        type="text" 
                        placeholder="0x..." 
                        value={wallet} 
                        onChange={(e) => setWallet(e.target.value)} 
                      />
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
