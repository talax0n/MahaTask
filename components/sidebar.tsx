"use client";

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
} from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const navItems = [
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "scheduler", label: "Scheduler", icon: Calendar },
  { id: "chat", label: "Study Groups", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AppSidebar({ activeView, onViewChange }: SidebarProps) {
  const { toggleSidebar, open } = useSidebar();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className={`flex items-center px-2 py-2 ${open ? 'justify-between' : 'justify-center'}`}>
              {open && (
                <h1 className="text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  MahaTask
                </h1>
              )}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                title={open ? "Collapse sidebar" : "Expand sidebar"}
              >
                {open ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
              </button>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={activeView === item.id}
                          onClick={() => onViewChange(item.id)}
                          tooltip={item.label}
                        >
                          <Icon />
                          <span>{item.label}</span>
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
        <SidebarContentWrapper>
          <SidebarTrigger className="md:hidden absolute top-4 left-4 z-50">
            <PanelLeft />
          </SidebarTrigger>
        </SidebarContentWrapper>
      </div>
    </SidebarProvider>
  );
}

// Helper component to wrap the main content area
function SidebarContentWrapper({ children }: { children?: React.ReactNode }) {
  return (
    <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {children}
    </main>
  );
}

// Export a wrapper that can be used in page.tsx to get the sidebar and content area
export function SidebarLayout({
  activeView,
  onViewChange,
  children,
}: {
  activeView: string;
  onViewChange: (view: string) => void;
  children: React.ReactNode;
}) {
  const { toggleSidebar, open } = useSidebar();

  return (
      <div className="flex h-screen w-full">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <div className={`flex items-center px-2 py-2 ${open ? 'justify-between' : 'justify-center'}`}>
              {open && (
                <h1 className="text-xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  MahaTask
                </h1>
              )}
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                title={open ? "Collapse sidebar" : "Expand sidebar"}
              >
                {open ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
              </button>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          isActive={activeView === item.id}
                          onClick={() => onViewChange(item.id)}
                          tooltip={item.label}
                        >
                          <Icon />
                          <span>{item.label}</span>
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

