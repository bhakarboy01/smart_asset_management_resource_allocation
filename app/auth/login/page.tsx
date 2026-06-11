"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Login failed");
        return;
      }

      const user = data.data.user;
      router.push(user.role === "ADMIN" ? "/admin/analytics" : "/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-gray-500 mt-2">Sign in to access the resource portal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="form-label">Email Address</label>
          <Input
            type="email"
            placeholder="ritesh.sharma@iitr.ac.in"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            leftIcon={<Mail className="w-4 h-4" />}
            required
            autoFocus
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="form-label mb-0">Password</label>
            <Link href="/auth/forgot-password" className="text-xs text-orange-500 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
          />
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign In
        </Button>
      </form>

      {/* Demo credentials */}
      <div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-lg">
        <p className="text-xs font-semibold text-orange-700 mb-2">Demo Credentials</p>
        <div className="space-y-1 text-xs text-orange-600">
          <div>
            <span className="font-medium">Admin:</span> admin@sampadaa.in / Admin@1234
          </div>
          <div>
            <span className="font-medium">User:</span> rahul@sampadaa.in / User@1234
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        New to Sampadaa?{" "}
        <Link href="/auth/register" className="text-orange-500 font-medium hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
