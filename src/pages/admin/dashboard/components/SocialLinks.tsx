import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon_class: string;
  gradient_colors: string;
  display_order: number;
  is_active: boolean;
}

interface SocialLinksProps {
  branchId: number;
}

export default function SocialLinks({ branchId }: SocialLinksProps) {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLink, setNewLink] = useState({
    platform: '',
    url: '',
    icon_class: '',
    gradient_colors: 'from-blue-500 to-blue-600'
  });

  useEffect(() => {
    if (branchId) {
      loadLinks();
    }
  }, [branchId]);

  const loadLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .eq('branch_id', branchId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error('Error loading social links:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      if (!newLink.platform || !newLink.url || !newLink.icon_class) {
        setMessage({ type: 'error', text: 'Vui lòng điền đầy đủ thông tin!' });
        return;
      }

      const maxOrder = links.length > 0 ? Math.max(...links.map(l => l.display_order)) : 0;

      const { error } = await supabase
        .from('social_links')
        .insert({
          platform: newLink.platform,
          url: newLink.url,
          icon_class: newLink.icon_class,
          gradient_colors: newLink.gradient_colors,
          branch_id: branchId,
          display_order: maxOrder + 1,
          is_active: true
        });

      if (error) throw error;

      setMessage({ type: 'success', text: 'Thêm mạng xã hội thành công!' });
      setShowAddForm(false);
      setNewLink({
        platform: '',
        url: '',
        icon_class: '',
        gradient_colors: 'from-blue-500 to-blue-600'
      });
      await loadLinks();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleUpdate = async (id: string) => {
    try {
      const link = links.find(l => l.id === id);
      if (!link) return;

      const { error } = await supabase
        .from('social_links')
        .update({
          platform: link.platform,
          url: link.url,
          icon_class: link.icon_class,
          gradient_colors: link.gradient_colors,
        })
        .eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Cập nhật thành công!' });
      setEditingId(null);
      await loadLinks();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa mạng xã hội này?')) return;

    try {
      const { error } = await supabase
        .from('social_links')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setMessage({ type: 'success', text: 'Xóa thành công!' });
      await loadLinks();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('social_links')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      await loadLinks();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const gradientOptions = [
    { value: 'from-[#1877F2] to-[#0C63D4]', label: 'Facebook Blue' },
    { value: 'from-[#0084FF] to-[#0066CC]', label: 'Messenger Blue' },
    { value: 'from-[#0068FF] to-[#0052CC]', label: 'Zalo Blue' },
    { value: 'from-[#E4405F] to-[#C13584]', label: 'Instagram Pink' },
    { value: 'from-[#25D366] to-[#128C7E]', label: 'WhatsApp Green' },
    { value: 'from-[#FF0000] to-[#CC0000]', label: 'YouTube Red' },
    { value: 'from-[#1DA1F2] to-[#0C85D0]', label: 'Twitter Blue' },
    { value: 'from-[#0A66C2] to-[#004182]', label: 'LinkedIn Blue' },
    { value: 'from-blue-500 to-blue-600', label: 'Blue' },
    { value: 'from-purple-500 to-purple-600', label: 'Purple' },
    { value: 'from-pink-500 to-pink-600', label: 'Pink' },
    { value: 'from-red-500 to-red-600', label: 'Red' },
    { value: 'from-orange-500 to-orange-600', label: 'Orange' },
    { value: 'from-green-500 to-green-600', label: 'Green' },
  ];

  if (loading) {
    return <div className="text-gray-900 text-center py-8 font-semibold">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý mạng xã hội</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-300 text-green-800 font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line mr-2 w-4 h-4 inline-flex items-center justify-center"></i>
          Thêm mạng xã hội
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-300 text-green-800 font-semibold' 
            : 'bg-red-50 border border-red-300 text-red-800 font-semibold'
        }`}>
          {message.text}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Thêm mạng xã hội mới</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-900 text-sm font-semibold mb-2">Tên nền tảng</label>
              <input
                type="text"
                value={newLink.platform}
                onChange={(e) => setNewLink({ ...newLink, platform: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent"
                placeholder="VD: Facebook, Zalo, Messenger..."
              />
            </div>
            <div>
              <label className="block text-gray-900 text-sm font-semibold mb-2">URL</label>
              <input
                type="text"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-gray-900 text-sm font-semibold mb-2">Icon class (Remix Icon)</label>
              <input
                type="text"
                value={newLink.icon_class}
                onChange={(e) => setNewLink({ ...newLink, icon_class: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent"
                placeholder="ri-facebook-fill"
              />
              <p className="text-gray-600 text-xs mt-1 font-medium">
                Tìm icon tại: <a href="https://remixicon.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline cursor-pointer font-semibold">remixicon.com</a>
              </p>
            </div>
            <div>
              <label className="block text-gray-900 text-sm font-semibold mb-2">Màu gradient</label>
              <select
                value={newLink.gradient_colors}
                onChange={(e) => setNewLink({ ...newLink, gradient_colors: e.target.value })}
                className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent cursor-pointer [&>option]:bg-white [&>option]:text-gray-900"
              >
                {gradientOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-300 text-green-800 font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                Thêm
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewLink({
                    platform: '',
                    url: '',
                    icon_class: '',
                    gradient_colors: 'from-blue-500 to-blue-600'
                  });
                }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Links List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {links.map((link) => (
          <div
            key={link.id}
            className={`bg-white border border-gray-200 rounded-2xl p-4 ${
              !link.is_active ? 'opacity-50' : ''
            }`}
          >
            {editingId === link.id ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-gray-900 text-sm font-semibold mb-2">Tên nền tảng</label>
                  <input
                    type="text"
                    value={link.platform}
                    onChange={(e) => setLinks(links.map(l => l.id === link.id ? { ...l, platform: e.target.value } : l))}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 text-sm font-semibold mb-2">URL</label>
                  <input
                    type="text"
                    value={link.url}
                    onChange={(e) => setLinks(links.map(l => l.id === link.id ? { ...l, url: e.target.value } : l))}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 text-sm font-semibold mb-2">Icon class (Remix Icon)</label>
                  <input
                    type="text"
                    value={link.icon_class}
                    onChange={(e) => setLinks(links.map(l => l.id === link.id ? { ...l, icon_class: e.target.value } : l))}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent"
                    placeholder="ri-facebook-fill"
                  />
                </div>
                <div>
                  <label className="block text-gray-900 text-sm font-semibold mb-2">Màu gradient</label>
                  <select
                    value={link.gradient_colors}
                    onChange={(e) => setLinks(links.map(l => l.id === link.id ? { ...l, gradient_colors: e.target.value } : l))}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-[#E84118] focus:border-transparent cursor-pointer [&>option]:bg-white [&>option]:text-gray-900"
                  >
                    {gradientOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(link.id)}
                    className="flex-1 px-4 py-2 bg-green-50 hover:bg-green-100 border border-green-300 text-green-800 font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-800 font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 flex items-center justify-center bg-gradient-to-br ${link.gradient_colors} rounded-full`}>
                      <i className={`${link.icon_class} text-xl text-white`}></i>
                    </div>
                    <div>
                      <h3 className="text-gray-900 font-bold">{link.platform}</h3>
                      <p className="text-gray-600 text-sm font-medium truncate max-w-[200px]">{link.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleActive(link.id, link.is_active)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                        link.is_active 
                          ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-300' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-300'
                      }`}
                    >
                      <i className={link.is_active ? 'ri-eye-line' : 'ri-eye-off-line'}></i>
                    </button>
                    <button
                      onClick={() => setEditingId(link.id)}
                      className="w-8 h-8 flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg transition-all cursor-pointer"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="w-8 h-8 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-lg transition-all cursor-pointer"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {links.length === 0 && (
        <div className="text-center py-12 text-gray-600">
          <i className="ri-links-line text-4xl mb-4 w-10 h-10 inline-flex items-center justify-center"></i>
          <p className="font-semibold">Chưa có mạng xã hội nào. Nhấn "Thêm mạng xã hội" để bắt đầu!</p>
        </div>
      )}
    </div>
  );
}
