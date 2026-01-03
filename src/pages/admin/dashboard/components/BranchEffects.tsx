import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

interface BranchEffectsProps {
  branchId: string;
}

export default function BranchEffects({ branchId }: BranchEffectsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    effect_type: 'none',
    effect_intensity: 30
  });

  useEffect(() => {
    if (branchId) {
      fetchBranchEffects();
    }
  }, [branchId]);

  const fetchBranchEffects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('branches')
        .select('effect_type, effect_intensity')
        .eq('id', branchId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          effect_type: data.effect_type || 'none',
          effect_intensity: data.effect_intensity || 30
        });
      }
    } catch (error) {
      console.error('Error fetching branch effects:', error);
      showMessage('error', 'Không thể tải cài đặt hiệu ứng');
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
    setSaving(true);

    try {
      const { error } = await supabase
        .from('branches')
        .update({
          effect_type: formData.effect_type,
          effect_intensity: formData.effect_intensity
        })
        .eq('id', branchId);

      if (error) throw error;

      showMessage('success', 'Cập nhật hiệu ứng thành công!');
    } catch (error) {
      console.error('Error updating effects:', error);
      showMessage('error', 'Có lỗi xảy ra khi cập nhật hiệu ứng');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-gray-700 font-medium">Đang tải...</div>;
  }

  if (!branchId) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-700 font-medium">Vui lòng chọn chi nhánh để quản lý hiệu ứng</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-lg font-semibold ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Hiệu ứng đặc biệt</h2>
        <p className="text-sm text-gray-600 font-medium">
          Tùy chỉnh hiệu ứng hiển thị trên website của chi nhánh
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-base font-bold text-gray-900 mb-4">Loại hiệu ứng</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, effect_type: 'none' })}
              className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                formData.effect_type === 'none'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 text-3xl">
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
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 text-3xl">
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
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 text-3xl">
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
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 text-3xl">
                ❤️
              </div>
              <div className="text-sm font-semibold text-gray-900 text-center">Trái tim bay</div>
            </button>
          </div>

          <p className="text-xs text-gray-600 mt-4 font-medium">
            Chọn hiệu ứng sẽ xuất hiện trên toàn bộ website của chi nhánh này
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-base font-bold text-gray-900 mb-4">
            Cường độ hiệu ứng: {formData.effect_intensity}%
          </h3>
          
          <input
            type="range"
            min="0"
            max="50"
            value={formData.effect_intensity}
            onChange={(e) => setFormData({ ...formData, effect_intensity: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
            disabled={formData.effect_type === 'none'}
          />
          
          <div className="flex justify-between text-xs text-gray-600 mt-2 font-medium">
            <span>0% - Ít</span>
            <span>50% - Nhiều</span>
          </div>

          <p className="text-xs text-gray-600 mt-4 font-medium">
            Điều chỉnh số lượng và tốc độ của hiệu ứng
          </p>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-semibold">
              💡 Khuyến nghị: Giữ cường độ ≤ 50% để tránh giật lag
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
