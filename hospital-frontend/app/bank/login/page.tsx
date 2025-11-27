"use client";

import LoginForm from "@/components/ui/LoginForm";

export default function BankLoginPage() {
  return (
    <div className="py-12">
      <LoginForm role="bank" title="Bank Portal Login" redirectTo="/bank" />
    </div>
  );
}
