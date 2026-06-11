import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/jwt";
import { Package } from "lucide-react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin/analytics" : "/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-orange-500 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-orange-400 rounded-full translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-xl">Sampadaa</div>
              <div className="text-orange-300 text-xs">सम्पदा — Asset Management</div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Manage your <span className="text-orange-400">resources</span> smarter.
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            A centralised platform for IIT Roorkee Cultural Council to track, allocate, and manage shared assets — from cameras to costumes.
          </p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            { label: "Assets Tracked", value: "200+" },
            { label: "Bookings Processed", value: "1,500+" },
            { label: "Active Users", value: "300+" },
          ].map((stat) => (
            <div key={stat.label} className="flex items-center gap-4">
              <div className="text-2xl font-bold text-orange-400">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div className="text-xl font-bold text-gray-900">Sampadaa</div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
