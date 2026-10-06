import {
  Bot,
  CalendarRange,
  Cpu,
  Gauge,
  Handshake,
  LayoutDashboard,
  type LucideIcon,
  Monitor,
  Rows3,
  Tablet,
} from "lucide-react"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  description: string
  external?: boolean
}

export const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Operations",
    items: [
      { title: "Overview", href: "/dashboard", icon: LayoutDashboard, description: "Plant KPIs, output and live alerts" },
      { title: "Control panel", href: "/control", icon: Cpu, description: "All 50 machines, live state and commands" },
      { title: "Batches", href: "/batches", icon: Rows3, description: "Every batch on the floor today" },
      { title: "Schedule", href: "/schedule", icon: CalendarRange, description: "Machine timeline and delivery calendar" },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Efficiency", href: "/efficiency", icon: Gauge, description: "OEE, losses and utility intensity" },
      { title: "AI agents", href: "/ai", icon: Bot, description: "Prediction, anomaly and scheduling agents" },
    ],
  },
  {
    label: "Business",
    items: [
      { title: "CRM", href: "/crm", icon: Handshake, description: "Buyers, orders and shade approvals" },
    ],
  },
  {
    label: "Displays",
    items: [
      { title: "TV wallboard", href: "/tv", icon: Monitor, description: "Full-screen floor display", external: true },
      { title: "Operator tablet", href: "/tablet", icon: Tablet, description: "Touch screen for the machine floor", external: true },
    ],
  },
]

export const NAV_ITEMS = NAV_GROUPS.flatMap((group) => group.items)
