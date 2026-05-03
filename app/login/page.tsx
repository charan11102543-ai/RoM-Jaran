"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleLogin() {
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <Brand />
        </div>
        <Card>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription className="mt-2">
            Use the seeded admin email and password to access leads, bookings, and pipeline views.
          </CardDescription>
          <div className="mt-6 space-y-4">
            <Input type="email" placeholder="admin@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button
              className="w-full"
              disabled={isPending}
              onClick={() => {
                startTransition(() => {
                  void handleLogin();
                });
              }}
            >
              Login
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}
