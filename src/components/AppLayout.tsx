import { Outlet } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Home, Folder, BarChart3, Settings, Sparkles } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider } from "@/components/ui/sidebar";
import logo from "@/assets/kapitallo-logo.png";

const AppLayout = () => {
  const navItems = [{
    to: "/app/dashboard",
    icon: Home,
    label: "Главная"
  }, {
    to: "/app/categories",
    icon: Folder,
    label: "Категории"
  }, {
    to: "/app/ai-chat",
    icon: Sparkles,
    label: "AI Чат"
  }, {
    to: "/app/analytics",
    icon: BarChart3,
    label: "Аналитика"
  }, {
    to: "/app/settings",
    icon: Settings,
    label: "Настройки"
  }];

  return <>
    {/* Desktop Layout with Sidebar */}
    <div className="hidden md:block">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Sidebar>
            <SidebarContent>
              {/* Logo */}
              <div className="px-6 py-4 border-b flex items-center gap-2">
                <img src={logo} alt="Kapitallo" className="h-8 w-8" />
              </div>

              <SidebarGroup>
                <SidebarGroupLabel>Навигация</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map(item => <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild>
                        <NavLink to={item.to} className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors" activeClassName="bg-accent text-primary font-medium">
                          <item.icon className="h-5 w-5" />
                          <span>{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>)}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </div>

    {/* Mobile Layout with Bottom Tab Bar */}
    <div className="md:hidden flex flex-col min-h-screen">
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border shadow-lg z-50">
        <div className="flex items-end justify-around h-16 px-2 pb-2">
          <NavLink to="/app/dashboard" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors" activeClassName="text-primary">
            <Home className="h-6 w-6" />
            <span className="text-xs">Главная</span>
          </NavLink>

          <NavLink to="/app/categories" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors" activeClassName="text-primary">
            <Folder className="h-6 w-6" />
            <span className="text-xs">Категории</span>
          </NavLink>

          {/* Central AI Chat Button */}
          <div className="flex flex-col items-center -mt-4">
            <NavLink 
              to="/app/ai-chat" 
              className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-primary to-indigo-600 text-white shadow-xl hover:opacity-90 transition-all"
              activeClassName="ring-2 ring-primary ring-offset-2 ring-offset-background"
            >
              <Sparkles className="h-7 w-7" />
            </NavLink>
          </div>

          <NavLink to="/app/analytics" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors" activeClassName="text-primary">
            <BarChart3 className="h-6 w-6" />
            <span className="text-xs">Аналитика</span>
          </NavLink>

          <NavLink to="/app/settings" className="flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground transition-colors" activeClassName="text-primary">
            <Settings className="h-6 w-6" />
            <span className="text-xs">Настройки</span>
          </NavLink>
        </div>
      </nav>
    </div>
  </>;
};

export default AppLayout;