"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coins,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { authService } from "@/lib/authService";
import { useAuth } from "@/contexts/AuthContext";

type SignupRole = "patient" | "hospital_admin" | "hospital_staff" | "bank_staff";

const ROLE_OPTIONS: { value: SignupRole; label: string }[] = [
  { value: "patient", label: "Patient" },
  { value: "hospital_admin", label: "Hospital Admin" },
  { value: "hospital_staff", label: "Hospital Staff" },
  { value: "bank_staff", label: "Bank Staff" },
];

export default function Auth() {
  const router = useRouter();
  const { login: contextLogin } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [cnic, setCnic] = useState("");
  const [wallet, setWallet] = useState("");
  const [hospitalName, setHospitalName] = useState("");
  const [bankName, setBankName] = useState("");
  const [signupRole, setSignupRole] = useState<SignupRole>("patient");
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
    return () => { isMounted = false; };
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await contextLogin(email, password);
      const storedUser = authService.getUser();
      const userRole = storedUser?.role || "PATIENT";
      setSuccessMessage("Login successful! Redirecting...");
      router.push(authService.getRoleRedirectPath(userRole));
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

    if (!name || !email || !password || !cnic) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }
    if ((signupRole === "patient" || signupRole === "hospital_staff") && !hospitalName) {
      setError("Please select a hospital");
      setIsLoading(false);
      return;
    }
    if (signupRole === "hospital_admin" && !hospitalName) {
      setError("Please enter your hospital name");
      setIsLoading(false);
      return;
    }
    if (signupRole === "bank_staff" && !bankName) {
      setError("Please enter your bank name");
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.signup({
        email,
        password,
        name,
        cnic,
        role: signupRole,
        walletAddress: wallet || undefined,
        hospitalName: hospitalName || undefined,
        bankName: bankName || undefined,
      });

      if (response.success) {
        setEmail(email); // Keep email to pre-fill login form
        setPassword(""); setName(""); setCnic("");
        setWallet(""); setHospitalName(""); setBankName("");
        setSuccessMessage("Account created successfully! Please sign in with your credentials.");
        // Switch to signin tab instead of auto-login
        const signinTab = document.querySelector('[value="signin"]') as HTMLButtonElement;
        signinTab?.click();
      } else {
        setError(response.message || "Sign-up failed. Please try again");
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : "An error occurred during signup");
    } finally {
      setIsLoading(false);
    }
  };

  const needsHospitalDropdown = signupRole === "patient" || signupRole === "hospital_staff";
  const needsHospitalInput = signupRole === "hospital_admin";
  const needsBankInput = signupRole === "bank_staff";

  return (
    <div className="min-h-screen bg-background">
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
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
              <Coins className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">SehatVault</h1>
            <p className="mt-1 text-muted-foreground">Healthcare Asset Tokenization Platform</p>
          </div>

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

                {/* SIGN IN */}
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
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                {/* SIGN UP */}
                <TabsContent value="signup" className="mt-0 space-y-4">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    {/* Role Selection */}
                    <div className="space-y-2">
                      <Label>I am a <span className="text-error">*</span></Label>
                      <div className="grid grid-cols-2 gap-2">
                        {ROLE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => { setSignupRole(opt.value); setHospitalName(""); setBankName(""); }}
                            className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                              signupRole === opt.value
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-input bg-background text-foreground hover:bg-muted"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name <span className="text-error">*</span></Label>
                      <Input id="signup-name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email <span className="text-error">*</span></Label>
                      <Input id="signup-email" type="email" placeholder="john@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-cnic">CNIC <span className="text-error">*</span></Label>
                      <Input id="signup-cnic" type="text" placeholder="12345-6789012-3" value={cnic} onChange={(e) => setCnic(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password <span className="text-error">*</span></Label>
                      <Input id="signup-password" type="password" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    {/* Hospital dropdown — for patient & hospital_staff */}
                    {needsHospitalDropdown && (
                      <div className="space-y-2">
                        <Label htmlFor="signup-hospital">Select Hospital <span className="text-error">*</span></Label>
                        <select
                          id="signup-hospital"
                          value={hospitalName}
                          onChange={(e) => setHospitalName(e.target.value)}
                          required
                          disabled={hospitalsLoading}
                          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                        >
                          <option value="">{hospitalsLoading ? "Loading hospitals..." : "Select your hospital"}</option>
                          {hospitals.map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Hospital name input — for hospital_admin (creates new hospital) */}
                    {needsHospitalInput && (
                      <div className="space-y-2">
                        <Label htmlFor="signup-hospital-name">Hospital Name <span className="text-error">*</span></Label>
                        <Input id="signup-hospital-name" type="text" placeholder="Enter your hospital name" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} required />
                        <p className="text-xs text-muted-foreground">A new hospital will be registered with this name</p>
                      </div>
                    )}

                    {/* Bank name input — for bank_staff */}
                    {needsBankInput && (
                      <div className="space-y-2">
                        <Label htmlFor="signup-bank-name">Bank Name <span className="text-error">*</span></Label>
                        <Input id="signup-bank-name" type="text" placeholder="Enter your bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} required />
                      </div>
                    )}

                    {/* Wallet address — only for patient */}
                    {signupRole === "patient" && (
                      <div className="space-y-2">
                        <Label htmlFor="signup-wallet">Wallet Address (Optional)</Label>
                        <Input id="signup-wallet" type="text" placeholder="0x..." value={wallet} onChange={(e) => setWallet(e.target.value)} />
                      </div>
                    )}

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
