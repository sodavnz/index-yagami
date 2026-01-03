import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

interface User {
  id: string;
  email: string;
  role: string;
  branch_id: string | null;
  branch_name?: string;
  created_at: string;
}

interface Branch {
  id: number;
  name: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'staff' as 'admin' | 'staff',
    branch_id: ''
  });

  useEffect(() => {
    fetchBranches();
    fetchUsers();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select(`
          *,
          branches:branch_id (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const usersWithBranch = (data || []).map(user => ({
        ...user,
        branch_name: user.branches?.name || null
      }));
      
      setUsers(usersWithBranch);
    } catch (error) {
      console.error('Error fetching users:', error);
      showMessage('error', 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Chuẩn bị dữ liệu cơ bản
      const baseData: any = {
        email: formData.email,
        role: formData.role,
        branch_id: formData.branch_id || null
      };

      if (editingUser) {
        // Cập nhật user
        // Chỉ thêm password_hash nếu người dùng nhập mật khẩu mới
        if (formData.password && formData.password.trim() !== '') {
          baseData.password_hash = formData.password;
        }

        const { error } = await supabase
          .from('admin_users')
          .update(baseData)
          .eq('id', editingUser.id);

        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        showMessage('success', 'Cập nhật người dùng thành công!');
      } else {
        // Tạo mới user - bắt buộc phải có password
        if (!formData.password || formData.password.trim() === '') {
          showMessage('error', 'Vui lòng nhập mật khẩu cho người dùng mới');
          setLoading(false);
          return;
        }

        baseData.password_hash = formData.password;

        const { error } = await supabase
          .from('admin_users')
          .insert([baseData]);

        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        showMessage('success', 'Thêm người dùng mới thành công!');
      }

      resetForm();
      fetchUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      showMessage('error', error.message || 'Có lỗi xảy ra khi lưu người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      role: user.role as 'admin' | 'staff',
      branch_id: user.branch_id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showMessage('success', 'Xóa người dùng thành công!');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showMessage('error', 'Không thể xóa người dùng');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      role: 'staff',
      branch_id: ''
    });
    setEditingUser(null);
    setShowForm(false);
  };

  if (loading && users.length === 0) {
    return <div className="text-center py-8 text-gray-700 font-medium">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg font-semibold ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Quản lý Người dùng</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap cursor-pointer"
        >
          {showForm ? 'Đóng' : '+ Thêm Người dùng'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {editingUser ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng Mới'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Mật khẩu {!editingUser && <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 font-medium"
                required={!editingUser}
                placeholder={editingUser ? 'Để trống nếu không đổi mật khẩu' : ''}
              />
              {editingUser && (
                <p className="text-xs text-gray-600 mt-1 font-medium">Để trống nếu không muốn thay đổi mật khẩu</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'staff' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 font-medium cursor-pointer"
                required
              >
                <option value="admin">Quản trị viên</option>
                <option value="staff">Nhân viên</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Chi nhánh quản lý
              </label>
              <select
                value={formData.branch_id}
                onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 font-medium cursor-pointer"
              >
                <option value="">Tất cả chi nhánh</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-600 mt-1 font-medium">
                Chọn chi nhánh để giới hạn quyền quản lý
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              {loading ? 'Đang lưu...' : editingUser ? 'Cập nhật' : 'Thêm mới'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 bg-gray-100 text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
            >
              Hủy
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Chi nhánh
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-semibold text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900 font-semibold">
                      {user.branch_name || 'Tất cả chi nhánh'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-semibold">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-teal-600 hover:text-teal-900 mr-4 whitespace-nowrap cursor-pointer"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-red-600 hover:text-red-900 whitespace-nowrap cursor-pointer"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
