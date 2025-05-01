import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
}

export function StatCard({ icon, title, value, subtitle }: StatCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-4">
        {icon}
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-white">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}