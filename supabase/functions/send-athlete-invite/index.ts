import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  equipe_nome: string;
  invite_link: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY não configurada");
    }

    const { email, equipe_nome, invite_link }: InviteRequest = await req.json();

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SportManager <onboarding@resend.dev>",
        to: [email],
        subject: `Convite para ${equipe_nome}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Você foi convidado!</h1>
            <p>Você recebeu um convite para fazer parte da equipe <strong>${equipe_nome}</strong>.</p>
            <p>Para completar seu cadastro como atleta, clique no link abaixo:</p>
            <a href="${invite_link}" 
               style="display: inline-block; background-color: #0066cc; color: white; 
                      padding: 12px 24px; text-decoration: none; border-radius: 4px; 
                      margin: 20px 0;">
              Completar Cadastro
            </a>
            <p style="color: #666; font-size: 14px;">
              Este convite é válido por 7 dias. Se você não solicitou este convite, 
              pode ignorar este email.
            </p>
            <p style="color: #999; font-size: 12px; margin-top: 40px;">
              SportManager - Sistema de Gestão Esportiva
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Erro ao enviar email: ${error}`);
    }

    const data = await res.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar convite:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
