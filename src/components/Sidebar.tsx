import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Calendar,
  Users,
  Users2,
  Trophy,
  LayoutDashboard,
  Medal,
  LogOut,
  Shield,
} from "lucide-react";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const allMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["admin", "organizador", "responsavel", "atleta"] },
  { title: "Administração", url: "/admin", icon: Shield, roles: ["admin"] },
  { title: "Eventos", url: "/eventos", icon: Calendar, roles: ["admin", "organizador"] },
  { title: "Atletas", url: "/atletas", icon: Users, roles: ["admin", "organizador"] },
  { title: "Equipes", url: "/equipes", icon: Users2, roles: ["admin", "organizador"] },
  { title: "Minhas Equipes", url: "/minhas-equipes", icon: Users2, roles: ["responsavel"] },
  { title: "Partidas", url: "/partidas", icon: Trophy, roles: ["admin", "organizador"] },
  { title: "Rankings", url: "/rankings", icon: Medal, roles: ["admin", "organizador", "responsavel", "atleta"] },
  { title: "Responsáveis", url: "/responsaveis", icon: Users, roles: ["admin", "organizador"] },
];

export function Sidebar() {
  const { open } = useSidebar();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState(allMenuItems);

  useEffect(() => {
    const fetchUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      const role = data?.role || null;
      setUserRole(role);
      
      // Filtrar itens do menu baseado na role
      const filtered = allMenuItems.filter(item => 
        !item.roles || item.roles.includes(role || "")
      );
      setMenuItems(filtered);
    };

    fetchUserRole();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      navigate("/auth");
    }
  };

  return (
    <SidebarComponent className="border-r border-sidebar-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  {open && <span>Sair</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarComponent>
  );
}
