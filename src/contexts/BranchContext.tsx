
import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface Branch {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email?: string;
}

interface BranchContextType {
  currentBranch: Branch | null;
  loading: boolean;
  error: string | null;
}

const BranchContext = createContext<BranchContextType>({
  currentBranch: null,
  loading: true,
  error: null,
});

export const useBranch = () => useContext(BranchContext);

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const loadBranch = async () => {
      try {
        setLoading(true);
        
        // Lấy slug từ URL path
        const pathParts = location.pathname.split('/').filter(part => part !== '');
        
        // Nếu đang ở trang chủ (chọn chi nhánh), không load chi nhánh
        if (pathParts.length === 0 || pathParts[0] === '') {
          setCurrentBranch(null);
          setError(null);
          setLoading(false);
          return;
        }

        const slug = pathParts[0];

        // Query branch từ database
        const { data, error: fetchError } = await supabase
          .from('branches')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (fetchError) {
          console.error('Error loading branch:', fetchError);
          setError('Có lỗi xảy ra khi tải thông tin chi nhánh');
          setLoading(false);
          return;
        }

        if (!data) {
          setError('Không tìm thấy chi nhánh');
          setCurrentBranch(null);
          setLoading(false);
          return;
        }

        setCurrentBranch(data);
        setError(null);
      } catch (err) {
        console.error('Error:', err);
        setError('Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    loadBranch();
  }, [location.pathname]);

  return (
    <BranchContext.Provider value={{ currentBranch, loading, error }}>
      {children}
    </BranchContext.Provider>
  );
}
