import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    console.log('=== VERIFY PASSWORD START ===');
    console.log('Request method:', req.method);
    console.log('Request URL:', req.url);
    console.log('Content-Type:', req.headers.get('content-type'));
    
    // Đọc body text
    const bodyText = await req.text();
    console.log('=== RAW BODY ===');
    console.log('Body text:', bodyText);
    console.log('Body length:', bodyText.length);
    
    // Kiểm tra body rỗng
    if (!bodyText || bodyText.trim() === '') {
      console.error('ERROR: Empty body received');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Body rỗng - không nhận được dữ liệu',
          debug: {
            contentType: req.headers.get('content-type'),
            bodyLength: bodyText?.length || 0
          }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Parse JSON
    let body;
    try {
      body = JSON.parse(bodyText);
      console.log('=== PARSED BODY ===');
      console.log('Parsed body:', JSON.stringify(body));
    } catch (parseError) {
      console.error('ERROR: Failed to parse JSON:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Không thể parse JSON: ' + parseError.message,
          debug: {
            bodyText: bodyText.substring(0, 100)
          }
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const { email, password } = body;
    
    console.log('=== EXTRACTED DATA ===');
    console.log('Email:', email);
    console.log('Password exists:', !!password);

    // Validate input
    if (!email || !password) {
      console.error('ERROR: Missing email or password');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email và mật khẩu không được để trống'
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get Supabase credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('ERROR: Missing Supabase credentials');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Cấu hình server không đúng' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query user from database
    console.log('=== DATABASE QUERY ===');
    console.log('Querying for email:', email);
    
    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    console.log('Query result:', JSON.stringify({ user, error: userError }));

    if (userError) {
      console.error('ERROR: Database error:', userError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Lỗi truy vấn database: ' + userError.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!user) {
      console.log('ERROR: User not found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email hoặc mật khẩu không đúng' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('=== USER FOUND ===');
    console.log('User email:', user.email);

    // Compare password (plain text)
    const isValidPassword = password === user.password_hash;
    console.log('=== PASSWORD CHECK ===');
    console.log('Password match:', isValidPassword);

    if (!isValidPassword) {
      console.log('ERROR: Password mismatch');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email hoặc mật khẩu không đúng' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('=== LOGIN SUCCESS ===');

    // Return success
    return new Response(
      JSON.stringify({ 
        success: true,
        user: {
          id: user.id,
          email: user.email,
          branch_id: user.branch_id
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Có lỗi xảy ra: ' + (error?.message || 'Unknown error')
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});