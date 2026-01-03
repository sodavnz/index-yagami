
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useBranch } from '../../contexts/BranchContext';

export default function ExpirationChecker() {
  const [showWarning, setShowWarning] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const { currentBranch } = useBranch();

  useEffect(() => {
    if (currentBranch) {
      checkExpiration();
      const interval = setInterval(checkExpiration, 60 * 60 * 1000);
      return () => clearInterval(interval);
    } else {
      setShowWarning(false);
      setShowExpired(false);
    }
  }, [currentBranch]);

  const checkExpiration = async () => {
    if (!currentBranch) return;

    try {
      const { data, error } = await supabase
        .from('branches')
        .select('expiration_date')
        .eq('id', currentBranch.id)
        .single();

      if (error || !data || !data.expiration_date) {
        setShowWarning(false);
        setShowExpired(false);
        return;
      }

      const now = new Date();
      const expirationDate = new Date(data.expiration_date);
      const diffTime = expirationDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setDaysRemaining(diffDays);

      if (diffDays <= 0) {
        setShowExpired(true);
        setShowWarning(false);
      } else if (diffDays <= 7) {
        setShowWarning(true);
        setShowExpired(false);
      } else {
        setShowWarning(false);
        setShowExpired(false);
      }
    } catch (error) {
      console.error('Error checking expiration:', error);
    }
  };

  if (showExpired) {
    return (
      <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-gradient-to-br from-red-500/20 to-red-600/20 border-2 border-red-500 rounded-3xl p-8 shadow-2xl">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-error-warning-line text-6xl text-white w-12 h-12 flex items-center justify-center"></i>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Website đã hết hạn</h2>
            <p className="text-white/80 text-lg mb-6">
              Chi nhánh <strong>{currentBranch?.name}</strong> đã hết hạn sử dụng
            </p>
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
              <p className="text-red-200 text-sm">
                Đã hết hạn {Math.abs(daysRemaining)} ngày trước
              </p>
            </div>
            <p className="text-white/60 text-sm">
              Vui lòng liên hệ quản trị viên để gia hạn sử dụng
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showWarning) {
    return (
      <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-yellow-500 to-orange-500 z-[9998] shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="ri-alarm-warning-line text-2xl text-white w-6 h-6 flex items-center justify-center"></i>
              </div>
              <div>
                <p className="text-white font-semibold">
                  Chi nhánh <strong>{currentBranch?.name}</strong> sắp hết hạn!
                </p>
                <p className="text-white/80 text-sm">Còn {daysRemaining} ngày</p>
              </div>
            </div>
            <button
              onClick={() => setShowWarning(false)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-close-line mr-1"></i>
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
