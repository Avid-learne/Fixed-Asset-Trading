// hospital-frontend/app/patients/login/page.tsx
"use client";

import LoginForm from "@/components/ui/LoginForm";

export default function PatientLoginPage() {
  return (
    <div className="py-12">
      <LoginForm 
        role="patients" 
        title="Patient Portal Login" 
        redirectTo="/patients" 
      />
    </div>
  );
}