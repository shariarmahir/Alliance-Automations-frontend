import type { ReactNode } from "react"
import { AppSidebar } from "@/components/shell/app-sidebar"
import { TopBar } from "@/components/shell/top-bar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="min-w-0">
        <TopBar />
        <main className="flex-1 bg-blueprint px-4 py-6 md:px-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
