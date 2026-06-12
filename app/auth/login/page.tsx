"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";
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
    <div className="animate-fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
        <p className="text-gray-500 mt-2 text-[15px]">Sign in to access the resource portal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200/80 text-red-600 px-4 py-3 rounded-xl text-sm animate-slide-up">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="form-label">Email Address</label>
          <Input
            type="email"
            placeholder="admin@sampadaa.in"
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
            <Link href="/auth/forgot-password" className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-colors">
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
                className="text-gray-400 hover:text-gray-600 transition-colors p-0.5"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            required
          />
        </div>

        <Button type="submit" className="w-full !mt-7 group" size="lg" loading={loading}>
          <span>Sign In</span>
          {!loading && <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />}
        </Button>
      </form>

      {/* Demo credentials */}
      <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-amber-50/60 border border-orange-100 rounded-2xl">
        <p className="text-xs font-semibold text-orange-700 mb-2.5 flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-full bg-orange-200 flex items-center justify-center text-orange-600 text-[8px] font-bold">i</span>
          Demo Credentials
        </p>
        <div className="space-y-1.5">
          {[
            { role: "Admin", email: "admin@sampadaa.in", password: "Admin@1234" },
            { role: "User", email: "rahul@sampadaa.in", password: "User@1234" },
          ].map(({ role, email, password }) => (
            <button
              key={role}
              type="button"
              onClick={() => setForm({ email, password })}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-orange-100/60 transition-colors cursor-pointer group"
            >
              <span className="text-xs font-semibold text-orange-700 group-hover:text-orange-800">{role}</span>
              <span className="text-xs text-orange-600/80 font-mono">{email}</span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-orange-500/70 mt-2 pl-1">Click a row to fill credentials automatically</p>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        New to Sampadaa?{" "}
        <Link href="/auth/register" className="text-orange-500 font-semibold hover:text-orange-600 transition-colors">
          Create an account →
        </Link>
      </p>
    </div>
  );
}
