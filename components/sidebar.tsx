"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  CheckSquare,
  Calendar,
  MessageSquare,
  Settings,
  PanelLeft,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutDashboard,
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { id: "tasks", label: "Tasks", icon: CheckSquare, href: "/tasks" },
  { id: "scheduler", label: "Scheduler", icon: Calendar, href: "/scheduler" },
  { id: "chat", label: "Study Groups", icon: MessageSquare, href: "/chat" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

// Export a wrapper that can be used in layout.tsx to get the sidebar and content area
export function SidebarLayout({ children }: { children: React.ReactNode }) {
  const { toggleSidebar, open } = useSidebar();
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/register') {
    return <main className="min-h-screen w-full bg-background">{children}</main>;
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center justify-between p-2">
            {open && (
              <h1 className="text-xl font-bold tracking-tight text-primary">
                MahaTask
              </h1>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors ml-auto"
              title={open ? "Collapse sidebar" : "Expand sidebar"}
            >
              {open ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </button>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <Link href={item.href}>
                          <Icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        {open && (
          <SidebarFooter>
            <div className="text-xs text-sidebar-foreground/70 text-center py-2">
              Academic Dashboard
            </div>
          </SidebarFooter>
        )}
      </Sidebar>
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
        <SidebarTrigger className="md:hidden absolute top-4 left-4 z-50">
          <PanelLeft />
        </SidebarTrigger>
        <div className="flex-1 overflow-auto">
          <div className="p-6 md:p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
