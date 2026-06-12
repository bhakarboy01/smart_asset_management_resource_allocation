import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/jwt";
import { Boxes, Layers, Users, BarChart3 } from "lucide-react";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect(user.role === "ADMIN" ? "/admin/analytics" : "/dashboard");
  }

  const features = [
    { icon: Layers, label: "Real-time Inventory", desc: "Live availability across all asset categories" },
    { icon: Users, label: "Role-based Access", desc: "Separate flows for students and administrators" },
    { icon: BarChart3, label: "Analytics Dashboard", desc: "Usage insights and booking trends at a glance" },
  ];

  return (
    <div className="min-h-screen flex bg-[#0d0f14]">
      {/* Left branding panel */}
      <div className="hidden lg:flex w-[52%] flex-col justify-between p-14 relative overflow-hidden">
        {/* Background gradients */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, hsl(24 95% 50%) 0%, transparent 70%)", transform: "translate(-30%, -30%)" }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, hsl(217 91% 60%) 0%, transparent 70%)", transform: "translate(30%, 30%)" }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/30">
              <Boxes className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-xl tracking-tight">Sampadaa</div>
              <div className="text-orange-400/70 text-[11px] tracking-widest uppercase font-medium">सम्पदा · Asset Management</div>
            </div>
          </div>

          <h1 className="text-[42px] font-bold text-white leading-[1.15] mb-5 tracking-tight">
            Manage your<br />
            <span className="bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">resources</span> smarter.
          </h1>
          <p className="text-gray-400 text-[15px] leading-relaxed max-w-sm">
            A centralised platform for IIT Roorkee Cultural Council to track, allocate, and manage shared assets — from cameras to costumes.
          </p>
        </div>

        {/* Features */}
        <div className="relative z-10 space-y-4">
          {features.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500/10 group-hover:border-orange-500/20 transition-colors duration-200">
                <Icon className="w-4.5 h-4.5 text-gray-400 group-hover:text-orange-400 transition-colors" />
              </div>
              <div>
                <div className="text-[13px] font-semibold text-white/90">{label}</div>
                <div className="text-[12px] text-gray-500">{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats row */}
        <div className="relative z-10 pt-8 border-t border-white/8">
          <div className="flex gap-8">
            {[
              { value: "200+", label: "Assets" },
              { value: "1,500+", label: "Bookings" },
              { value: "300+", label: "Users" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-orange-400">{stat.value}</div>
                <div className="text-[12px] text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[400px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Boxes className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="text-xl font-bold text-gray-900 tracking-tight">Sampadaa</div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
