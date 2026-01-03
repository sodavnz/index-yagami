import Header from './components/Header';
import HeroBanner from './components/HeroBanner';
import Features from './components/Features';
import ProductDescription from './components/ProductDescription';
import CallToAction from './components/CallToAction';
import Footer from './components/Footer';
import { useBranch } from '@/contexts/BranchContext';

export default function Home() {
  const { currentBranch, loading, error } = useBranch();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  if (error || !currentBranch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-2xl mb-4">⚠️ Không tìm thấy chi nhánh</div>
          <div className="text-gray-400">Vui lòng kiểm tra lại đường dẫn</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]">
      <Header />
      <HeroBanner />
      <Features />
      <ProductDescription />
      <CallToAction />
      <Footer />
    </div>
  );
}
