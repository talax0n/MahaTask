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
      <Sidebar collapsible="icon" className="border-r-0 bg-card">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
                <Link href="/dashboard">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <CheckSquare className="size-5" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-lg">MahaTask</span>
                    <span className="truncate text-xs text-muted-foreground">Academic Dashboard</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="px-4 py-4">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                        size="lg"
                        className={`
                          transition-all duration-200 ease-in-out rounded-xl
                          ${isActive 
                            ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:text-primary-foreground" 
                            : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"}
                        `}
                      >
                        <Link href={item.href} className="flex items-center gap-4 px-2">
                          <Icon className={`${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"} h-5 w-5`} />
                          <span className="font-medium text-base">{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-border/40">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="Settings"
                isActive={pathname === '/settings'}
                size="lg"
                className="rounded-xl hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground transition-all duration-200"
              >
                <Link href="/settings" className="flex items-center gap-4 px-2">
                  <Settings className="h-5 w-5" />
                  <span className="font-medium text-base">Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 max-w-7xl mx-auto">{children}</div>
        </div>
      </main>
    </div>
  );
}
