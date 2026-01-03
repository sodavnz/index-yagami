import { useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('=== BẮT ĐẦU ĐĂNG NHẬP ===');
      console.log('Email:', email);

      // Đăng nhập bằng Supabase Authentication
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      console.log('Kết quả đăng nhập:', { data, error: signInError });

      if (signInError) {
        console.error('Lỗi đăng nhập:', signInError);
        throw signInError;
      }

      if (!data.user) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      console.log('✅ Đăng nhập thành công!');
      console.log('User ID:', data.user.id);
      console.log('Email:', data.user.email);

      // Lưu session vào localStorage
      if (data.session) {
        localStorage.setItem('admin_session', JSON.stringify({
          user: {
            id: data.user.id,
            email: data.user.email,
            role: 'admin'
          },
          access_token: data.session.access_token,
          timestamp: Date.now()
        }));
        console.log('✅ Đã lưu session vào localStorage');
      }

      // Chuyển hướng đến dashboard
      console.log('Đang chuyển hướng đến dashboard...');
      
      setTimeout(() => {
        if (window.REACT_APP_NAVIGATE) {
          console.log('Sử dụng React Router để chuyển trang');
          window.REACT_APP_NAVIGATE('/admin/dashboard');
        } else {
          console.log('Sử dụng window.location để chuyển trang');
          window.location.href = '/admin/dashboard';
        }
      }, 500);
      
    } catch (err: unknown) {
      console.error('=== LỖI ĐĂNG NHẬP ===');
      console.error('Chi tiết lỗi:', err);
      
      let errorMessage = 'Đăng nhập thất bại';
      
      if (err && typeof err === 'object' && 'message' in err) {
        const errorObj = err as { message: string };
        if (errorObj.message.includes('Invalid login credentials')) {
          errorMessage = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
        } else if (errorObj.message.includes('Email not confirmed')) {
          errorMessage = 'Email chưa được xác nhận. Vui lòng xác nhận email trong Supabase Dashboard.';
        } else {
          errorMessage = errorObj.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-[#E84118] to-[#FF6B35] rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-admin-line text-4xl text-white"></i>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Login</h1>
            <p className="text-white/60">Đăng nhập để quản lý nội dung</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                <p className="text-red-200 text-sm font-medium">
                  <i className="ri-error-warning-line mr-1"></i>
                  {error}
                </p>
              </div>
            )}

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="ri-mail-line text-white/40"></i>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#E84118] transition-colors"
                  placeholder="admin@example.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <i className="ri-lock-line text-white/40"></i>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#E84118] transition-colors"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#E84118] to-[#FF6B35] text-white font-semibold py-3 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                if (window.REACT_APP_NAVIGATE) {
                  window.REACT_APP_NAVIGATE('/');
                } else {
                  window.location.href = '/';
                }
              }}
              className="text-white/60 hover:text-white text-sm transition-colors cursor-pointer"
            >
              ← Quay lại trang chủ
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
            <p className="text-blue-200 text-xs text-center mb-2">
              <i className="ri-information-line mr-1"></i>
              Hướng dẫn tạo tài khoản admin
            </p>
            <div className="text-white/60 text-xs text-left space-y-1">
              <p>1. Vào Supabase Dashboard → Authentication → Users</p>
              <p>2. Nhấn "Add user" → "Create new user"</p>
              <p>3. Nhập email: <span className="text-white">sodavnz@gmail.com</span></p>
              <p>4. Nhập password: <span className="text-white">admin123</span></p>
              <p>5. ✅ Bật "Auto Confirm User"</p>
              <p>6. Nhấn "Create user"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
