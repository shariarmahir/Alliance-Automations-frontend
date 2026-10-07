"use client"

import { ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatedGlobe } from "@/components/brand/animated-globe"
import { BRAND, Logo, LogoSquare } from "@/components/brand/logo"
import { SCREEN_ICONS } from "@/components/landing/icons/screens"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NAV_GROUPS, type NavItem } from "@/lib/navigation"
import { usePlant } from "@/lib/store/plant"

/** The landing page's animated screen icon. It rests until the item is hovered or is the current page (globals.css). */
function NavIcon({ title, fallback: Fallback }: { title: string; fallback: NavItem["icon"] }) {
  const Icon = SCREEN_ICONS[title]
  return Icon ? <Icon className="animated-nav-icon size-5!" /> : <Fallback />
}

export function AppSidebar() {
  const pathname = usePathname()
  const openAlerts = usePlant((state) => state.alerts.filter((alert) => !alert.acknowledged).length)
  const available = usePlant((state) => (state.kpis ? `${state.kpis.total - state.kpis.offline}/${state.kpis.total}` : null))

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="px-3 py-3">
        <Link href="/" className="rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring">
          <Logo className="group-data-[collapsible=icon]:hidden" />
          <LogoSquare className="hidden group-data-[collapsible=icon]:grid" />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={item.title}>
                    <Link href={item.href} target={item.external ? "_blank" : undefined}>
                      <NavIcon title={item.title} fallback={item.icon} />
                      <span>{item.title}</span>
                      {item.external && <ArrowUpRight className="ml-auto size-3.5 opacity-50" />}
                    </Link>
                  </SidebarMenuButton>
                  {item.href === "/dashboard" && openAlerts > 0 && (
                    <SidebarMenuBadge className="bg-delayed/15 text-delayed">{openAlerts}</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="rounded-lg border bg-background/40 p-3 text-xs group-data-[collapsible=icon]:hidden">
          <div className="flex items-center justify-between">
            <span className="font-medium">Dyeing floor</span>
            <span className="inline-flex items-center gap-1.5 text-running">
              <span className="size-1.5 rounded-full bg-running" />
              Live
            </span>
          </div>
          <p className="mt-1 text-muted-foreground tabular">
            {available ? `${available} machines available` : "Connecting…"}
          </p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip={`Visit ${BRAND.company}`}>
              <a href={BRAND.website} target="_blank" rel="noopener noreferrer">
                <AnimatedGlobe />
                <span>Visit {BRAND.company}</span>
                <ArrowUpRight className="ml-auto size-3.5 opacity-50" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
