"use client";

import LoginForm from "@/components/ui/LoginForm";

export default function HospitalLoginPage() {
  return (
    <div className="py-12">
      <LoginForm role="hospital" title="Hospital Management Login" redirectTo="/hospital" />
    </div>
  );
}
