import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Branch {
  id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  opening_hours?: string;
}

export default function BranchSelector() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);

  useEffect(() => {
    loadBranches();
  }, []);

  const loadBranches = async () => {
    try {
      const { data: branchesData, error: branchesError } = await supabase
        .from('branches')
        .select('*')
        .order('created_at', { ascending: true });

      if (branchesError) throw branchesError;

      const branchesWithContact = await Promise.all(
        (branchesData || []).map(async (branch) => {
          const { data: contactData } = await supabase
            .from('contact_info')
            .select('address, phone, opening_hours')
            .eq('branch_id', branch.id)
            .maybeSingle();

          return {
            id: branch.id,
            name: branch.name,
            slug: branch.slug,
            address: (contactData?.address && contactData.address.trim() !== '') 
              ? contactData.address 
              : (branch.address || 'Chưa cập nhật'),
            phone: (contactData?.phone && contactData.phone.trim() !== '') 
              ? contactData.phone 
              : (branch.phone || 'Chưa cập nhật'),
            opening_hours: (contactData?.opening_hours && contactData.opening_hours.trim() !== '') 
              ? contactData.opening_hours 
              : (branch.opening_hours || 'Liên hệ để biết thêm')
          };
        })
      );

      setBranches(branchesWithContact);
    } catch (error) {
      console.error('Error loading branches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBranchClick = (slug: string) => {
    window.REACT_APP_NAVIGATE(`/${slug}`);
  };

  const branchColors = [
    'from-[#FF6B6B] via-[#FF8E53] to-[#FFA94D]',
    'from-[#4ECDC4] via-[#44A08D] to-[#093637]',
    'from-[#A770EF] via-[#CF8BF3] to-[#FDB99B]',
    'from-[#F093FB] via-[#F5576C] to-[#4FACFE]',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <i className="ri-store-2-line text-3xl text-white"></i>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${5 + Math.random() * 10}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12 sm:mb-16 animate-fade-in">
            <div className="inline-block mb-6 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B6B] via-[#4ECDC4] to-[#A770EF] blur-2xl opacity-50 animate-pulse"></div>
              <h1 className="relative text-5xl sm:text-6xl lg:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200 tracking-tight">
                YAGAMI
              </h1>
            </div>
            <p className="text-xl sm:text-2xl text-white/80 font-light tracking-wide">
              Chọn chi nhánh gần bạn nhất
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
              <i className="ri-map-pin-line text-white/60 text-xl w-5 h-5 flex items-center justify-center"></i>
              <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
            </div>
          </div>

          {/* Branch Grid */}
          {branches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8 mb-12">
              {branches.map((branch, index) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchClick(branch.slug)}
                  onMouseEnter={() => setHoveredBranch(branch.id)}
                  onMouseLeave={() => setHoveredBranch(null)}
                  className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 cursor-pointer overflow-hidden"
                  style={{
                    transform: hoveredBranch === branch.id ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                    boxShadow: hoveredBranch === branch.id ? '0 20px 60px rgba(0,0,0,0.3)' : '0 10px 30px rgba(0,0,0,0.2)',
                  }}
                >
                  {/* Gradient Overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${branchColors[index % branchColors.length]} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Shine Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>

                  <div className="relative">
                    {/* Branch Icon */}
                    <div className="flex items-center justify-center mb-6">
                      <div className={`relative w-24 h-24 bg-gradient-to-br ${branchColors[index % branchColors.length]} rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                        <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <i className="ri-store-2-line text-5xl text-white relative z-10"></i>
                      </div>
                    </div>

                    {/* Branch Info */}
                    <div className="text-center space-y-4">
                      <h2 className="text-2xl sm:text-3xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-purple-200 group-hover:to-pink-200 transition-all duration-300">
                        {branch.name}
                      </h2>
                      
                      <div className="space-y-3 text-white/70 group-hover:text-white/90 transition-colors duration-300">
                        <div className="flex items-start justify-center gap-3 group">
                          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="ri-map-pin-line text-lg"></i>
                          </div>
                          <span className="text-sm sm:text-base text-left break-words max-w-xs">{branch.address}</span>
                        </div>
                        
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                            <i className="ri-phone-line text-lg"></i>
                          </div>
                          <span className="text-sm sm:text-base font-medium">{branch.phone}</span>
                        </div>

                        <div className="flex items-start justify-center gap-3">
                          <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <i className="ri-time-line text-lg"></i>
                          </div>
                          <span className="text-sm sm:text-base text-left break-words max-w-xs">{branch.opening_hours}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-4">
                        <div className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${branchColors[index % branchColors.length]} rounded-full text-white font-semibold text-sm shadow-lg group-hover:shadow-2xl transition-all duration-300 whitespace-nowrap`}>
                          <span>Xem chi tiết</span>
                          <i className="ri-arrow-right-line text-lg w-5 h-5 flex items-center justify-center group-hover:translate-x-1 transition-transform duration-300"></i>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Corner Decoration */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className={`w-12 h-12 bg-gradient-to-br ${branchColors[index % branchColors.length]} rounded-full flex items-center justify-center`}>
                      <i className="ri-arrow-right-up-line text-2xl text-white"></i>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-block p-8 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10">
                <i className="ri-store-2-line text-7xl text-white/30 mb-6 block"></i>
                <p className="text-white/60 text-xl font-light">
                  Chưa có chi nhánh nào
                </p>
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <i className="ri-phone-line w-4 h-4 flex items-center justify-center"></i>
                <span>Hotline: 1900 xxxx</span>
              </div>
              <div className="w-px h-4 bg-white/20"></div>
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <i className="ri-mail-line w-4 h-4 flex items-center justify-center"></i>
                <span>info@yagami.vn</span>
              </div>
            </div>
            <p className="text-sm text-white/40">
              © 2024 YAGAMI. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) translateX(0);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.6;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
