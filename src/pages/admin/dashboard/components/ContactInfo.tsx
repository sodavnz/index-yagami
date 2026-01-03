
import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

interface ContactInfoData {
  phone: string;
  email: string;
  address: string;
  working_hours: string;
  map_embed_url: string;
  additional_info: string;
  button_text: string;
  share_link: string;
}

interface ContactInfoProps {
  branchId: number;
}

export default function ContactInfo({ branchId }: ContactInfoProps) {
  const [data, setData] = useState<ContactInfoData>({
    phone: '',
    email: '',
    address: '',
    working_hours: '',
    map_embed_url: '',
    additional_info: '',
    button_text: 'LIÊN HỆ',
    share_link: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (branchId) {
      loadContactInfo();
    }
  }, [branchId]);

  const loadContactInfo = async () => {
    setLoading(true);
    try {
      const { data: contactData, error } = await supabase
        .from('contact_info')
        .select('*')
        .eq('branch_id', branchId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (contactData) {
        setData({
          phone: contactData.phone || '',
          email: contactData.email || '',
          address: contactData.address || '',
          working_hours: contactData.working_hours || '',
          map_embed_url: contactData.map_embed_url || '',
          additional_info: contactData.additional_info || '',
          button_text: contactData.button_text || 'LIÊN HỆ',
          share_link: contactData.share_link || ''
        });
      } else {
        // Reset form nếu chưa có data cho chi nhánh này
        setData({
          phone: '',
          email: '',
          address: '',
          working_hours: '',
          map_embed_url: '',
          additional_info: '',
          button_text: 'LIÊN HỆ',
          share_link: ''
        });
      }
    } catch (error) {
      console.error('Error loading contact info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Kiểm tra xem đã có dữ liệu cho chi nhánh này chưa
      const { data: existingData } = await supabase
        .from('contact_info')
        .select('id')
        .eq('branch_id', branchId)
        .single();

      if (existingData) {
        // Nếu đã có, thực hiện UPDATE
        const { error } = await supabase
          .from('contact_info')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('branch_id', branchId);

        if (error) throw error;
      } else {
        // Nếu chưa có, thực hiện INSERT
        const { error } = await supabase
          .from('contact_info')
          .insert({
            branch_id: branchId,
            ...data,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Cập nhật thông tin liên hệ thành công!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Thông tin liên hệ</h2>

      {message.text && (
        <div className={`p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-gray-900 text-sm font-semibold mb-2">Số điện thoại</label>
          <input
            type="text"
            value={data.phone}
            onChange={(e) => setData({ ...data, phone: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="0123456789"
          />
        </div>

        <div>
          <label className="block text-gray-900 text-sm font-semibold mb-2">Email</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => setData({ ...data, email: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="email@example.com"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-900 text-sm font-semibold mb-2">Địa chỉ</label>
          <input
            type="text"
            value={data.address}
            onChange={(e) => setData({ ...data, address: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Địa chỉ của bạn"
          />
        </div>

        <div>
          <label className="block text-gray-900 text-sm font-semibold mb-2">Giờ mở cửa</label>
          <input
            type="text"
            value={data.working_hours}
            onChange={(e) => setData({ ...data, working_hours: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="8:00 - 22:00 (Hàng ngày)"
          />
        </div>

        <div>
          <label className="block text-gray-900 text-sm font-semibold mb-2">Văn bản nút liên hệ</label>
          <input
            type="text"
            value={data.button_text}
            onChange={(e) => setData({ ...data, button_text: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="LIÊN HỆ"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-900 text-sm font-semibold mb-2">Link chia sẻ Google Maps</label>
          <input
            type="text"
            value={data.share_link}
            onChange={(e) => setData({ ...data, share_link: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="https://maps.app.goo.gl/..."
          />
          <p className="text-gray-600 text-xs mt-1">
            Link này sẽ được dùng cho nút "Chỉ đường" và khi click vào địa chỉ
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-900 text-sm font-semibold mb-2">Mã nhúng Google Maps</label>
          <textarea
            value={data.map_embed_url}
            onChange={(e) => setData({ ...data, map_embed_url: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 h-24 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'
          />
          <p className="text-gray-600 text-xs mt-1">
            Lấy mã nhúng từ Google Maps: Tìm kiếm địa điểm → Chia sẻ → Nhúng bản đồ
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-gray-900 text-sm font-semibold mb-2">Thông tin bổ sung</label>
          <textarea
            value={data.additional_info}
            onChange={(e) => setData({ ...data, additional_info: e.target.value })}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 h-24 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Mô tả ngắn về doanh nghiệp..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-[#E84118] to-[#FF6B35] text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap"
        >
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="text-blue-900 font-semibold mb-2">
          <i className="ri-information-line mr-2 w-4 h-4 inline-flex items-center justify-center"></i>
          Lưu ý về mạng xã hội
        </h3>
        <p className="text-blue-800 text-sm">
          Các link mạng xã hội (Facebook, Messenger, Zalo...) đã được chuyển sang tab <strong>"Mạng Xã Hội"</strong> để quản lý tập trung và dễ dàng hơn.
        </p>
      </div>
    </div>
  );
}
