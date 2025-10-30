import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  nome_responsavel: string;
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

    const { email, nome_responsavel, invite_link }: InviteRequest = await req.json();

    console.log("Enviando convite para responsável:", email);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Gestão Esportiva <onboarding@resend.dev>",
        to: [email],
        subject: "Convite para Cadastro de Responsável",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1>Bem-vindo, ${nome_responsavel}!</h1>
            <p>Você foi convidado para se cadastrar como responsável de equipe.</p>
            <p>Com esse cadastro, você poderá:</p>
            <ul>
              <li>Criar e gerenciar suas equipes</li>
              <li>Inscrever equipes em competições disponíveis</li>
              <li>Gerenciar atletas das suas equipes</li>
              <li>Acompanhar histórico de participações</li>
            </ul>
            <p>
              <a href="${invite_link}" 
                 style="display: inline-block; background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
                Completar Cadastro
              </a>
            </p>
            <p>Ou copie e cole este link no seu navegador:</p>
            <p style="word-break: break-all;">${invite_link}</p>
            <p style="color: #666; font-size: 14px;">Este convite expira em 7 dias.</p>
            <p style="color: #999; font-size: 12px; margin-top: 40px;">
              Gestão Esportiva - Sistema de Gestão Esportiva
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Erro ao enviar email: ${error}`);
    }

    const emailResponse = await res.json();
    console.log("Convite enviado com sucesso:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
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
