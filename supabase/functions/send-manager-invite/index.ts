import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    const { email, nome_responsavel, invite_link }: InviteRequest = await req.json();

    console.log("Enviando convite para responsável:", email);

    const emailResponse = await resend.emails.send({
      from: "Gestão Esportiva <onboarding@resend.dev>",
      to: [email],
      subject: "Convite para Cadastro de Responsável",
      html: `
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
             style="background-color: #4CAF50; color: white; padding: 14px 28px; text-decoration: none; display: inline-block; border-radius: 4px;">
            Completar Cadastro
          </a>
        </p>
        <p>Ou copie e cole este link no seu navegador:</p>
        <p>${invite_link}</p>
        <p>Este convite expira em 7 dias.</p>
        <p>Atenciosamente,<br>Equipe de Gestão Esportiva</p>
      `,
    });

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
