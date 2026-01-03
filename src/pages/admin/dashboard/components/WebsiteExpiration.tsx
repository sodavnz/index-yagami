
import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';

interface WebsiteExpirationProps {
  isAdmin: boolean;
  currentBranchId?: number;
}

export default function WebsiteExpiration({ isAdmin, currentBranchId }: WebsiteExpirationProps) {
  const [expirationDate, setExpirationDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [branchName, setBranchName] = useState('');

  useEffect(() => {
    if (currentBranchId) {
      fetchExpiration();
    }
  }, [currentBranchId]);

  useEffect(() => {
    if (expirationDate) {
      calculateDaysRemaining();
      const interval = setInterval(calculateDaysRemaining, 1000 * 60 * 60);
      return () => clearInterval(interval);
    }
  }, [expirationDate]);

  const fetchExpiration = async () => {
    if (!currentBranchId) return;

    try {
      const { data, error } = await supabase
        .from('branches')
        .select('expiration_date, name')
        .eq('id', currentBranchId)
        .single();

      if (error) {
        console.error('Error fetching expiration:', error);
        return;
      }

      if (data) {
        setExpirationDate(data.expiration_date || '');
        setBranchName(data.name);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const calculateDaysRemaining = () => {
    if (!expirationDate) return;
    
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    setDaysRemaining(diffDays);
  };

  const handleSave = async () => {
    if (!expirationDate) {
      setMessage('Vui lòng chọn ngày hết hạn');
      return;
    }

    if (!currentBranchId) {
      setMessage('Vui lòng chọn chi nhánh');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('branches')
        .update({ expiration_date: expirationDate })
        .eq('id', currentBranchId);

      if (error) throw error;

      setMessage('✅ Đã lưu thời hạn thành công!');
      calculateDaysRemaining();
    } catch (error) {
      console.error('Error saving expiration:', error);
      setMessage('❌ Có lỗi xảy ra khi lưu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (daysRemaining === null) return 'text-gray-500';
    if (daysRemaining <= 0) return 'text-red-600';
    if (daysRemaining <= 7) return 'text-orange-600';
    if (daysRemaining <= 30) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusText = () => {
    if (daysRemaining === null) return 'Chưa thiết lập';
    if (daysRemaining <= 0) return 'Đã hết hạn';
    if (daysRemaining === 1) return 'Còn 1 ngày';
    return `Còn ${daysRemaining} ngày`;
  };

  if (!currentBranchId) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-6">
        <div className="flex items-center gap-3">
          <i className="ri-information-line text-2xl text-yellow-700"></i>
          <p className="text-yellow-800 font-semibold">
            Vui lòng chọn chi nhánh để quản lý thời hạn
          </p>
        </div>
      </div>
    );
  }

  // Giao diện cho User thường - Chỉ xem
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <i className="ri-time-line text-xl text-white"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Thời hạn sử dụng</h2>
            <p className="text-gray-700 font-medium text-sm">Chi nhánh: {branchName}</p>
          </div>
        </div>

        {/* Countdown Display */}
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-8">
          <div className="text-center">
            <div className="mb-4">
              <i className={`ri-calendar-check-line text-6xl ${getStatusColor()}`}></i>
            </div>
            
            <h3 className={`text-3xl font-bold mb-2 ${getStatusColor()}`}>
              {getStatusText()}
            </h3>
            
            {expirationDate && (
              <p className="text-gray-700 font-semibold text-lg">
                Hết hạn vào: {new Date(expirationDate).toLocaleDateString('vi-VN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            )}

            {daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0 && (
              <div className="mt-6 p-4 bg-orange-50 border-2 border-orange-300 rounded-xl">
                <p className="text-orange-800 font-bold">
                  <i className="ri-alarm-warning-line mr-2"></i>
                  Chi nhánh sắp hết hạn! Vui lòng liên hệ để gia hạn.
                </p>
              </div>
            )}

            {daysRemaining !== null && daysRemaining <= 0 && (
              <div className="mt-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl">
                <p className="text-red-800 font-bold">
                  <i className="ri-error-warning-line mr-2"></i>
                  Chi nhánh đã hết hạn! Vui lòng liên hệ ngay để gia hạn.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Giao diện cho Admin - Có thể chỉnh sửa
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
          <i className="ri-time-line text-xl text-white"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quản lý thời hạn sử dụng</h2>
          <p className="text-gray-700 font-medium text-sm">Chi nhánh: {branchName}</p>
        </div>
      </div>

      {/* Current Status */}
      {daysRemaining !== null && expirationDate && (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 font-semibold text-sm mb-1">Trạng thái hiện tại</p>
              <p className={`text-2xl font-bold ${getStatusColor()}`}>
                {getStatusText()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-700 font-semibold text-sm mb-1">Ngày hết hạn</p>
              <p className="text-gray-900 font-bold">
                {new Date(expirationDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
        <label className="block text-gray-900 font-bold mb-3">
          <i className="ri-calendar-line mr-2"></i>
          Ngày hết hạn
        </label>
        <input
          type="date"
          value={expirationDate}
          onChange={(e) => setExpirationDate(e.target.value)}
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
        />
        
        <button
          onClick={handleSave}
          disabled={loading}
          className="mt-4 w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-xl transition-all cursor-pointer whitespace-nowrap disabled:opacity-50"
        >
          {loading ? (
            <>
              <i className="ri-loader-4-line animate-spin mr-2"></i>
              Đang lưu...
            </>
          ) : (
            <>
              <i className="ri-save-line mr-2"></i>
              Lưu thời hạn
            </>
          )}
        </button>

        {message && (
          <div className={`mt-4 p-4 rounded-xl font-semibold ${
            message.includes('✅') 
              ? 'bg-green-50 border-2 border-green-300 text-green-800' 
              : 'bg-red-50 border-2 border-red-300 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>

      {/* Warning Info */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <i className="ri-information-line text-2xl text-blue-700 mt-1"></i>
          <div>
            <h4 className="text-lg font-bold text-blue-900 mb-2">Lưu ý quan trọng</h4>
            <ul className="space-y-2 text-blue-800 font-medium text-sm">
              <li className="flex items-center gap-2">
                <i className="ri-checkbox-circle-line text-green-600"></i>
                Khi hết hạn, chi nhánh sẽ bị chặn hoàn toàn
              </li>
              <li className="flex items-center gap-2">
                <i className="ri-checkbox-circle-line text-green-600"></i>
                Người dùng chỉ thấy thông báo "Website đã hết hạn"
              </li>
              <li className="flex items-center gap-2">
                <i className="ri-checkbox-circle-line text-green-600"></i>
                Cảnh báo sẽ hiện khi còn 7 ngày trở xuống
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
