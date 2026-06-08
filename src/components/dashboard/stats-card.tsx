import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatsCard({
  label,
  value,
  sublabel,
  icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-all duration-300",
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 [&>svg]:w-6 [&>svg]:h-6 [&>svg]:text-[#1a1a2e]">
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-3xl font-bold text-[#1a1a2e] tabular-nums">{value}</p>
        <p className="text-sm text-gray-500 font-medium truncate">{label}</p>
        {sublabel && (
          <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
