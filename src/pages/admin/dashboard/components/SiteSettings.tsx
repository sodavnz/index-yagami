
import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

interface SiteSettingsProps {
  branchId: number;
}

export default function SiteSettings({ branchId }: SiteSettingsProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    id: '',
    profile_image: '',
    title: '',
    subtitle: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (branchId) {
      loadSettings();
    }
  }, [branchId]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('branch_id', branchId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings({
          id: data.id,
          profile_image: data.profile_image,
          title: data.title,
          subtitle: data.subtitle,
        });
        setImagePreview(data.profile_image);
      } else {
        // Nếu chưa có settings cho chi nhánh này, tạo mới
        setSettings({
          id: '',
          profile_image: '',
          title: '',
          subtitle: '',
        });
        setImagePreview('');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `profile/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      let imageUrl = settings.profile_image;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (settings.id) {
        // Update existing
        const { error } = await supabase
          .from('site_settings')
          .update({
            profile_image: imageUrl,
            title: settings.title,
            subtitle: settings.subtitle,
            updated_at: new Date().toISOString(),
          })
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('site_settings')
          .insert({
            branch_id: branchId,
            profile_image: imageUrl,
            title: settings.title,
            subtitle: settings.subtitle,
          });

        if (error) throw error;
      }

      setMessage({ type: 'success', text: 'Lưu thành công!' });
      setImageFile(null);
      await loadSettings();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Có lỗi xảy ra' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-900 text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Cài đặt chung</h2>

      {message.text && (
        <div className={`p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Image */}
      <div>
        <label className="block text-gray-900 text-sm font-semibold mb-3">
          Ảnh đại diện (Logo)
        </label>
        <div className="flex items-center gap-6">
          <div className="w-32 h-32 bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-200 shadow-sm flex items-center justify-center p-4">
            <img
              src={imagePreview || 'https://via.placeholder.com/128'}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-block px-6 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-xl text-gray-900 font-semibold transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-upload-2-line mr-2"></i>
              Chọn ảnh mới
            </label>
            <p className="text-gray-600 text-sm mt-2">
              Định dạng: JPG, PNG (khuyến nghị PNG có nền trong suốt). Kích thước tối đa: 2MB
            </p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-gray-900 text-sm font-semibold mb-2">
          Tiêu đề
        </label>
        <input
          type="text"
          value={settings.title}
          onChange={(e) => setSettings({ ...settings, title: e.target.value })}
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
          placeholder="YAGAMI RẠCH SỎI"
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block text-gray-900 text-sm font-semibold mb-2">
          Phụ đề
        </label>
        <input
          type="text"
          value={settings.subtitle}
          onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
          placeholder="Verified"
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-gradient-to-r from-[#E84118] to-[#FF6B35] text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
    </div>
  );
}
