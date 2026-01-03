import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Reset password cho sodavnz@gmail.com
    const email = 'sodavnz@gmail.com';
    const newPassword = 'admin123';
    
    // Hash password mới
    const hashedPassword = await bcrypt.hash(newPassword);

    // Cập nhật password trong database
    const { error: updateError } = await supabase
      .from('admin_users')
      .update({ password_hash: hashedPassword })
      .eq('email', email);

    if (updateError) {
      throw updateError;
    }

    // Xóa user khỏi Auth nếu tồn tại
    try {
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const existingUser = authUsers.users.find(u => u.email === email);
      
      if (existingUser) {
        await supabase.auth.admin.deleteUser(existingUser.id);
      }
    } catch (e) {
      console.log('No auth user to delete:', e);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Password đã được reset thành công',
        email: email,
        newPassword: newPassword
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Có lỗi xảy ra' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});