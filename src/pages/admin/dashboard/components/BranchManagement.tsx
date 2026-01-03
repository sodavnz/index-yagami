import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

interface Branch {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
  expiration_date: string | null;
  effect_type: string;
  effect_intensity: number;
  created_at: string;
}

export default function BranchManagement() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    address: '',
    phone: '',
    email: '',
    is_active: true,
    effect_type: 'none',
    effect_intensity: 30
  });

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      showMessage('error', 'Không thể tải danh sách chi nhánh');
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
      const dataToSave = {
        name: formData.name,
        slug: formData.slug,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        is_active: formData.is_active,
        effect_type: formData.effect_type,
        effect_intensity: formData.effect_intensity
      };

      if (editingBranch) {
        const { error } = await supabase
          .from('branches')
          .update(dataToSave)
          .eq('id', editingBranch.id);

        if (error) throw error;
        showMessage('success', 'Cập nhật chi nhánh thành công!');
      } else {
        const { error } = await supabase
          .from('branches')
          .insert([dataToSave]);

        if (error) throw error;
        showMessage('success', 'Thêm chi nhánh mới thành công!');
      }

      resetForm();
      fetchBranches();
    } catch (error) {
      console.error('Error saving branch:', error);
      showMessage('error', 'Có lỗi xảy ra khi lưu chi nhánh');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      slug: branch.slug,
      address: branch.address,
      phone: branch.phone,
      email: branch.email,
      is_active: branch.is_active,
      effect_type: branch.effect_type || 'none',
      effect_intensity: branch.effect_intensity || 30
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chi nhánh này?')) return;

    try {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', id);

      if (error) throw error;
      showMessage('success', 'Xóa chi nhánh thành công!');
      fetchBranches();
    } catch (error) {
      console.error('Error deleting branch:', error);
      showMessage('error', 'Không thể xóa chi nhánh');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      address: '',
      phone: '',
      email: '',
      is_active: true,
      effect_type: 'none',
      effect_intensity: 30
    });
    setEditingBranch(null);
    setShowForm(false);
  };

  const getEffectLabel = (effectType: string) => {
    const labels: Record<string, string> = {
      'none': 'Không có hiệu ứng',
      'snow': '❄️ Tuyết rơi',
      'fireworks': '🎆 Pháo hoa',
      'hearts': '❤️ Trái tim bay'
    };
    return labels[effectType] || 'Không có hiệu ứng';
  };

  if (loading && branches.length === 0) {
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
        <h2 className="text-xl font-bold text-gray-900">Quản lý Chi nhánh</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap cursor-pointer"
        >
          {showForm ? 'Đóng' : '+ Thêm Chi nhánh'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {editingBranch ? 'Chỉnh sửa Chi nhánh' : 'Thêm Chi nhánh Mới'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tên chi nhánh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Slug chi nhánh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 font-medium"
                placeholder="vd: my-phuoc-1"
                required
              />
              <p className="text-xs text-gray-600 mt-1 font-medium">
                Slug sẽ được dùng trong URL: /{formData.slug || 'slug-chi-nhanh'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-gray-900 font-medium"
              required
            />
          </div>

          {/* Hiệu ứng đặc biệt */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <h4 className="text-base font-bold text-gray-900 mb-4">Hiệu ứng đặc biệt</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Loại hiệu ứng
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, effect_type: 'none' })}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      formData.effect_type === 'none'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 text-2xl">
                      <i className="ri-close-circle-line text-gray-400"></i>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 text-center">Không có hiệu ứng</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, effect_type: 'snow' })}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      formData.effect_type === 'snow'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 text-2xl">
                      ❄️
                    </div>
                    <div className="text-sm font-semibold text-gray-900 text-center">Tuyết rơi</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, effect_type: 'fireworks' })}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      formData.effect_type === 'fireworks'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 text-2xl">
                      🎆
                    </div>
                    <div className="text-sm font-semibold text-gray-900 text-center">Pháo hoa</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, effect_type: 'hearts' })}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      formData.effect_type === 'hearts'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 text-2xl">
                      ❤️
                    </div>
                    <div className="text-sm font-semibold text-gray-900 text-center">Trái tim bay</div>
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  Chọn hiệu ứng sẽ xuất hiện trên toàn bộ website
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Cường độ hiệu ứng: {formData.effect_intensity}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={formData.effect_intensity}
                  onChange={(e) => setFormData({ ...formData, effect_intensity: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  disabled={formData.effect_type === 'none'}
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1 font-medium">
                  <span>Ít</span>
                  <span>Nhiều</span>
                </div>
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  Điều chỉnh số lượng và tốc độ của hiệu ứng
                </p>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 font-semibold">
                    💡 Khuyến nghị: Giữ cường độ ≤ 50% để tránh giật lag
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-900 font-semibold cursor-pointer">
              Kích hoạt chi nhánh
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
            >
              {loading ? 'Đang lưu...' : editingBranch ? 'Cập nhật' : 'Thêm mới'}
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
                  Chi nhánh
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Slug
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Liên hệ
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Hiệu ứng
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {branches.map((branch) => {
                return (
                  <tr key={branch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-900">{branch.name}</div>
                      <div className="text-sm text-gray-700 font-medium">{branch.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-gray-900 font-semibold">/{branch.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-semibold">{branch.phone}</div>
                      {branch.email && (
                        <div className="text-sm text-gray-700 font-medium">{branch.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 font-semibold">{getEffectLabel(branch.effect_type)}</div>
                      {branch.effect_type !== 'none' && (
                        <div className="text-xs text-gray-700 font-medium mt-1">
                          Cường độ: {branch.effect_intensity}%
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        branch.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {branch.is_active ? 'Hoạt động' : 'Tạm dừng'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-semibold">
                      <button
                        onClick={() => handleEdit(branch)}
                        className="text-teal-600 hover:text-teal-900 mr-4 whitespace-nowrap cursor-pointer"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(branch.id)}
                        className="text-red-600 hover:text-red-900 whitespace-nowrap cursor-pointer"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
