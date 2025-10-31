import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Verificar autenticação
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Não autorizado");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Não autorizado");
    }

    // Verificar se o usuário é admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (roleError || !roleData) {
      throw new Error("Apenas administradores podem listar usuários");
    }

    // Buscar todos os perfis
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from("profiles")
      .select("id, nome, email, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) {
      throw profilesError;
    }

    // Buscar roles de cada usuário
    const usuarios = await Promise.all(
      (profiles || []).map(async (profile) => {
        // Buscar role
        const { data: roleData } = await supabaseAdmin
          .from("user_roles")
          .select("role")
          .eq("user_id", profile.id)
          .single();

        // Verificar se está ativo (existe no auth.users)
        const { data: authData } = await supabaseAdmin.auth.admin.getUserById(profile.id);

        return {
          id: profile.id,
          nome: profile.nome,
          email: profile.email,
          role: roleData?.role || "sem_role",
          ativo: !!authData?.user,
          created_at: profile.created_at,
        };
      })
    );

    return new Response(
      JSON.stringify({
        success: true,
        usuarios,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erro:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
