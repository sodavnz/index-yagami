import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import SiteSettings from './components/SiteSettings';
import NavigationLinks from './components/NavigationLinks';
import SocialLinks from './components/SocialLinks';
import MenuImages from './components/MenuImages';
import SpaceImages from './components/SpaceImages';
import ContactInfo from './components/ContactInfo';
import BranchManagement from './components/BranchManagement';
import UserManagement from './components/UserManagement';
import WebsiteExpiration from './components/WebsiteExpiration';
import BranchEffects from './components/BranchEffects';

interface User {
  id: string;
  email: string;
  role: string;
  branch_id: string | null;
}

interface Branch {
  id: string;
  name: string;
  slug: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('site-settings');
  const [user, setUser] = useState<User | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [navigate]);

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication...');
      
      // Kiểm tra session từ Supabase Auth
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        navigate('/admin/login');
        return;
      }

      if (!session) {
        console.log('❌ No session found');
        navigate('/admin/login');
        return;
      }

      console.log('✅ Session found:', session.user.email);

      // Lấy thông tin user từ bảng admin_users
      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('id, email, role, branch_id')
        .eq('email', session.user.email)
        .single();

      if (adminError || !adminUser) {
        console.error('❌ Admin user not found:', adminError);
        await supabase.auth.signOut();
        navigate('/admin/login');
        return;
      }

      console.log('✅ Admin user found:', adminUser);
      setUser(adminUser);

      // Lấy danh sách chi nhánh
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('id, name, slug')
        .order('name');

      if (branchesError) {
        console.error('❌ Error fetching branches:', branchesError);
      } else {
        console.log('✅ Branches loaded:', branchesData);
        setBranches(branchesData || []);
        
        // Tự động chọn chi nhánh
        if (adminUser.role === 'staff' && adminUser.branch_id) {
          // Staff chỉ thấy chi nhánh được gán
          setSelectedBranch(adminUser.branch_id);
          console.log('👤 Staff - Auto selected branch:', adminUser.branch_id);
        } else if (branchesData && branchesData.length > 0) {
          // Admin thấy tất cả chi nhánh, chọn chi nhánh đầu tiên
          setSelectedBranch(branchesData[0].id);
          console.log('👑 Admin - Selected first branch:', branchesData[0].id);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Auth check error:', error);
      navigate('/admin/login');
    }
  };

  const handleLogout = async () => {
    try {
      console.log('🚪 Logging out...');
      await supabase.auth.signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  };

  // Kiểm tra quyền truy cập tab
  const canAccessTab = (tab: string): boolean => {
    if (!user) return false;
    
    // Admin có full quyền
    if (user.role === 'admin') return true;
    
    // Staff không được truy cập các tab quản lý
    if (tab === 'branches' || tab === 'users') return false;
    
    return true;
  };

  // Lọc chi nhánh theo quyền
  const getAvailableBranches = (): Branch[] => {
    if (!user) return [];
    
    // Admin thấy tất cả chi nhánh
    if (user.role === 'admin') return branches;
    
    // Staff chỉ thấy chi nhánh được gán
    if (user.role === 'staff' && user.branch_id) {
      return branches.filter(b => b.id === user.branch_id);
    }
    
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  const availableBranches = getAvailableBranches();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bảng Điều Khiển Admin</h1>
              {user && (
                <p className="text-sm text-gray-900 mt-1">
                  {user.email} • <span className="font-semibold">{user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</span>
                </p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer font-medium"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Branch Selector */}
        {availableBranches.length > 0 && (
          <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Chi nhánh hiện tại:
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer text-gray-900 font-medium"
              disabled={user?.role === 'staff'}
            >
              {availableBranches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
            {user?.role === 'staff' && (
              <p className="text-xs text-gray-700 mt-2 font-medium">
                Bạn chỉ có quyền quản lý chi nhánh này
              </p>
            )}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6 border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px">
              {canAccessTab('site-settings') && (
                <button
                  onClick={() => setActiveTab('site-settings')}
                  className={`px-6 py-3 text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    activeTab === 'site-settings'
                      ? 'border-b-2 border-teal-600 text-teal-600'
                      : 'text-gray-800 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Cài đặt Trang
                </button>
              )}
              {canAccessTab('navigation') && (
                <button
                  onClick={() => setActiveTab('navigation')}
                  className={`px-6 py-3 text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    activeTab === 'navigation'
                      ? 'border-b-2 border-teal-600 text-teal-600'
                      : 'text-gray-800 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Điều hướng
                </button>
              )}
              {canAccessTab('social') && (
                <button
                  onClick={() => setActiveTab('social')}
                  className={`px-6 py-3 text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    activeTab === 'social'
                      ? 'border-b-2 border-teal-600 text-teal-600'
                      : 'text-gray-800 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Mạng xã hội
                </button>
              )}
              {canAccessTab('menu') && (
                <button
                  onClick={() => setActiveTab('menu')}
                  className={`px-6 py-3 text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    activeTab === 'menu'
                      ? 'border-b-2 border-teal-600 text-teal-600'
                      : 'text-gray-800 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Menu
                </button>
              )}
              {canAccessTab('space') && (
                <button
                  onClick={() => setActiveTab('space')}
                  className={`px-6 py-3 text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    activeTab === 'space'
                      ? 'border-b-2 border-teal-600 text-teal-600'
                      : 'text-gray-800 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Không gian
                </button>
              )}
              {canAccessTab('effects') && (
                <button
                  onClick={() => setActiveTab('effects')}
                  className={`px-6 py-3 text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    activeTab === 'effects'
                      ? 'border-b-2 border-teal-600 text-teal-600'
                      : 'text-gray-800 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Hiệu ứng
                </button>
              )}
              {canAccessTab('contact') && (
                <button
                  onClick={() => setActiveTab('contact')}
                  className={`px-6 py-3 text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    activeTab === 'contact'
                      ? 'border-b-2 border-teal-600 text-teal-600'
                      : 'text-gray-800 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Liên hệ
                </button>
              )}
              {canAccessTab('branches') && (
                <button
                  onClick={() => setActiveTab('branches')}
                  className={`px-6 py-3 text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    activeTab === 'branches'
                      ? 'border-b-2 border-teal-600 text-teal-600'
                      : 'text-gray-800 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Quản lý Chi nhánh
                </button>
              )}
              {canAccessTab('users') && (
                <button
                  onClick={() => setActiveTab('users')}
                  className={`px-6 py-3 text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    activeTab === 'users'
                      ? 'border-b-2 border-teal-600 text-teal-600'
                      : 'text-gray-800 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Quản lý User
                </button>
              )}
              {canAccessTab('expiration') && (
                <button
                  onClick={() => setActiveTab('expiration')}
                  className={`px-6 py-3 text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                    activeTab === 'expiration'
                      ? 'border-b-2 border-teal-600 text-teal-600'
                      : 'text-gray-800 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  Hạn Website
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          {activeTab === 'site-settings' && <SiteSettings branchId={selectedBranch} />}
          {activeTab === 'navigation' && <NavigationLinks branchId={selectedBranch} />}
          {activeTab === 'social' && <SocialLinks branchId={selectedBranch} />}
          {activeTab === 'menu' && <MenuImages branchId={selectedBranch} />}
          {activeTab === 'space' && <SpaceImages branchId={selectedBranch} />}
          {activeTab === 'effects' && <BranchEffects branchId={selectedBranch} />}
          {activeTab === 'contact' && <ContactInfo branchId={selectedBranch} />}
          {activeTab === 'branches' && canAccessTab('branches') && <BranchManagement />}
          {activeTab === 'users' && canAccessTab('users') && <UserManagement branches={branches} />}
          {activeTab === 'expiration' && (
            <WebsiteExpiration 
              isAdmin={user?.role === 'admin'}
              currentBranchId={selectedBranch || undefined}
            />
          )}
        </div>
      </div>
    </div>
  );
}