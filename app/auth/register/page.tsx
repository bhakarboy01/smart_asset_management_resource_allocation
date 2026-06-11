"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Hash, BookOpen, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const DEPARTMENTS = [
  "Civil Engineering",
  "Computer Science & Engineering",
  "Electrical Engineering",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Chemical Engineering",
  "Architecture",
  "Biotechnology",
  "Physics",
  "Chemistry",
  "Mathematics",
  "Management Studies",
  "Humanities & Social Sciences",
  "Other",
];

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rollNumber: "",
    department: "",
    phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        if (data.fieldErrors) {
          const errs: Record<string, string> = {};
          for (const [field, msgs] of Object.entries(data.fieldErrors)) {
            errs[field] = (msgs as string[])[0];
          }
          setErrors(errs);
        } else {
          setErrors({ general: data.error });
        }
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setErrors({ general: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Create account</h2>
        <p className="text-gray-500 mt-2">Join the IIT Roorkee resource portal</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {errors.general}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="form-label">Full Name</label>
            <Input
              placeholder="Rahul Kumar Sharma"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              leftIcon={<User className="w-4 h-4" />}
              error={errors.name}
              required
            />
          </div>

          <div className="col-span-2">
            <label className="form-label">Institute Email</label>
            <Input
              type="email"
              placeholder="rahul@iitr.ac.in"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              leftIcon={<Mail className="w-4 h-4" />}
              error={errors.email}
              required
            />
          </div>

          <div>
            <label className="form-label">Roll Number</label>
            <Input
              placeholder="21116044"
              value={form.rollNumber}
              onChange={(e) => setForm({ ...form, rollNumber: e.target.value })}
              leftIcon={<Hash className="w-4 h-4" />}
              error={errors.rollNumber}
            />
          </div>

          <div>
            <label className="form-label">Mobile Number</label>
            <Input
              type="tel"
              placeholder="9876543210"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              leftIcon={<Phone className="w-4 h-4" />}
              error={errors.phone}
            />
          </div>

          <div className="col-span-2">
            <label className="form-label">Department</label>
            <select
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400"
            >
              <option value="">Select your department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Password</label>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              error={errors.password}
              required
            />
          </div>

          <div>
            <label className="form-label">Confirm Password</label>
            <Input
              type="password"
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.confirmPassword}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Create Account
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-orange-500 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
