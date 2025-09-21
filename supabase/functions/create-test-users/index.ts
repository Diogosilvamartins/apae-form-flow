import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Criar cliente Supabase com service role para operações admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Criando usuários de teste...');

    // Usuários de teste para criar
    const testUsers = [
      {
        email: 'admin@apae.com',
        password: '123456',
        user_metadata: {
          nome: 'Administrador Sistema',
          tipo_usuario: 'admin'
        }
      },
      {
        email: 'funcionario@apae.com',
        password: '123456',
        user_metadata: {
          nome: 'Maria Silva Santos',
          tipo_usuario: 'funcionario'
        }
      },
      {
        email: 'responsavel@apae.com',
        password: '123456',
        user_metadata: {
          nome: 'João Responsável',
          tipo_usuario: 'responsavel'
        }
      }
    ];

    const results = [];

    // Criar cada usuário
    for (const userData of testUsers) {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          user_metadata: userData.user_metadata,
          email_confirm: true, // Auto-confirmar email
        });

        if (error) {
          console.error(`Erro ao criar usuário ${userData.email}:`, error);
          results.push({
            email: userData.email,
            success: false,
            error: error.message
          });
        } else {
          console.log(`Usuário ${userData.email} criado com sucesso`);
          results.push({
            email: userData.email,
            success: true,
            id: data.user?.id
          });
        }
      } catch (err) {
        console.error(`Erro ao processar usuário ${userData.email}:`, err);
        results.push({
          email: userData.email,
          success: false,
          error: err.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Processo de criação de usuários concluído',
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Erro na função:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})