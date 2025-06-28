"use client";

import { LoginForm } from "@/src/components/login/LoginForm";
import { LoginBanner } from "@/src/components/login/LoginBanner";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <LoginForm />
        </div>
      </div>
      <LoginBanner />
    </div>
  );
}
