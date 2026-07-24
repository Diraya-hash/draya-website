import {
  Compass,
  Cpu,
  TrendingUp,
  Sparkles,
  MessagesSquare,
  ListChecks,
  Rocket,
  Users,
  Code2,
  Landmark,
  ShieldCheck,
  Megaphone,
  HeartPulse,
  Truck,
  Cloud,
  Eye,
  BookOpen,
  Wrench,
  MousePointerClick,
  Zap,
  GraduationCap,
  Layers,
  Hammer,
  BarChart3,
  Heart,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Compass,
  Cpu,
  TrendingUp,
  Sparkles,
  MessagesSquare,
  ListChecks,
  Rocket,
  Users,
  Code2,
  Landmark,
  ShieldCheck,
  Megaphone,
  HeartPulse,
  Truck,
  Cloud,
  Eye,
  BookOpen,
  Wrench,
  MousePointerClick,
  Zap,
  GraduationCap,
  Layers,
  Hammer,
  BarChart3,
  Heart,
};

export function Icon({
  name,
  className,
}: {
  name?: string;
  className?: string;
}) {
  const Cmp = (name && ICONS[name]) || Sparkles;
  return <Cmp className={className} aria-hidden />;
}
