"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface Props {
  role: "hospital" | "patients" | "bank";
  title?: string;
  redirectTo?: string;
}

export default function LoginForm({ role, title, redirectTo }: Props) {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Lightweight client-side 'login' for demo purposes.
    // In a real app replace with proper auth flow.
    localStorage.setItem("role", role);
    localStorage.setItem("address", address || "");
    const dest = redirectTo ?? `/${role}`;
    router.push(dest);
  }

  return (
    <Card className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">{title ?? `Sign in to ${role.charAt(0).toUpperCase() + role.slice(1)}`}</h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Address / Email"
          placeholder="0xabc... or you@domain.com"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <Input
          label="Password"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex gap-3">
          <Button type="submit" variant="primary" className="flex-1">Sign In</Button>
          <Button type="button" variant="outline" className="flex-1" onClick={() => { setAddress(""); setPassword(""); }}>Clear</Button>
        </div>
      </form>
    </Card>
  );
}
