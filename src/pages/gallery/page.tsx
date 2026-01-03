import { useState, useEffect } from 'react';
import GalleryModal from './components/GalleryModal';
import { useBranch } from '@/contexts/BranchContext';
import { supabase } from '@/lib/supabase';

export default function Gallery() {
  const { currentBranch } = useBranch();
  const [menuImages, setMenuImages] = useState<any[]>([]);
  const [spaceImages, setSpaceImages] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      if (!currentBranch) return;

      // Fetch menu images
      const { data: menuData } = await supabase
        .from('menu_images')
        .select('*')
        .eq('branch_id', currentBranch.id)
        .order('display_order', { ascending: true });

      if (menuData) {
        setMenuImages(menuData);
      }

      // Fetch space images
      const { data: spaceData } = await supabase
        .from('space_images')
        .select('*')
        .eq('branch_id', currentBranch.id)
        .order('display_order', { ascending: true });

      if (spaceData) {
        setSpaceImages(spaceData);
      }
    };

    fetchImages();
  }, [currentBranch]);

  const galleryImages = [
    {
      url: 'https://readdy.ai/api/search-image?query=Cozy%20warm%20Japanese%20ramen%20restaurant%20interior%20with%20traditional%20wooden%20elements%2C%20soft%20ambient%20lighting%2C%20comfortable%20seating%20area%2C%20modern%20minimalist%20design%20with%20Japanese%20aesthetic%2C%20customers%20enjoying%20meals%20in%20background%2C%20warm%20inviting%20atmosphere%2C%20professional%20interior%20photography%20with%20natural%20warm%20tones%2C%20clean%20and%20elegant%20space%2C%20simple%20white%20background&width=800&height=1000&seq=gallery1&orientation=portrait',
      title: 'Không Gian Chính'
    },
    {
      url: 'https://readdy.ai/api/search-image?query=Japanese%20ramen%20restaurant%20counter%20seating%20area%20with%20open%20kitchen%20view%2C%20chef%20preparing%20ramen%2C%20wooden%20counter%20with%20bar%20stools%2C%20hanging%20pendant%20lights%2C%20traditional%20Japanese%20decor%20elements%2C%20warm%20lighting%2C%20professional%20restaurant%20photography%2C%20inviting%20atmosphere%2C%20simple%20white%20background&width=800&height=1000&seq=gallery2&orientation=portrait',
      title: 'Quầy Bar'
    },
    {
      url: 'https://readdy.ai/api/search-image?query=Private%20dining%20room%20in%20Japanese%20ramen%20restaurant%20with%20traditional%20tatami%20seating%2C%20low%20wooden%20table%2C%20paper%20lanterns%2C%20sliding%20shoji%20doors%2C%20minimalist%20Japanese%20interior%20design%2C%20warm%20ambient%20lighting%2C%20intimate%20dining%20space%2C%20professional%20photography%2C%20simple%20white%20background&width=800&height=1000&seq=gallery3&orientation=portrait',
      title: 'Phòng Riêng'
    },
    {
      url: 'https://readdy.ai/api/search-image?query=Japanese%20ramen%20restaurant%20entrance%20with%20traditional%20noren%20curtain%2C%20wooden%20door%20frame%2C%20welcome%20sign%2C%20potted%20plants%2C%20stone%20pathway%2C%20warm%20lighting%20from%20inside%2C%20inviting%20storefront%2C%20professional%20exterior%20photography%2C%20clean%20aesthetic%2C%20simple%20white%20background&width=800&height=1000&seq=gallery4&orientation=portrait',
      title: 'Lối Vào'
    },
    {
      url: 'https://readdy.ai/api/search-image?query=Modern%20Japanese%20ramen%20restaurant%20dining%20area%20with%20contemporary%20furniture%2C%20pendant%20lighting%20fixtures%2C%20wooden%20tables%20and%20chairs%2C%20minimalist%20decor%2C%20large%20windows%20with%20natural%20light%2C%20clean%20lines%2C%20professional%20interior%20photography%2C%20simple%20white%20background&width=800&height=1000&seq=gallery5&orientation=portrait',
      title: 'Khu Vực Dùng Bữa'
    },
    {
      url: 'https://readdy.ai/api/search-image?query=Japanese%20ramen%20restaurant%20kitchen%20area%20with%20stainless%20steel%20equipment%2C%20organized%20cooking%20stations%2C%20hanging%20utensils%2C%20professional%20chef%20workspace%2C%20clean%20and%20modern%2C%20industrial%20aesthetic%20with%20traditional%20elements%2C%20professional%20photography%2C%20simple%20white%20background&width=800&height=1000&seq=gallery6&orientation=portrait',
      title: 'Bếp Mở'
    },
    {
      url: 'https://readdy.ai/api/search-image?query=Japanese%20restaurant%20wall%20decoration%20with%20traditional%20artwork%2C%20calligraphy%20scrolls%2C%20wooden%20frames%2C%20ceramic%20plates%20display%2C%20minimalist%20aesthetic%2C%20warm%20lighting%20highlighting%20art%20pieces%2C%20cultural%20elements%2C%20professional%20photography%2C%20simple%20white%20background&width=800&height=1000&seq=gallery7&orientation=portrait',
      title: 'Trang Trí'
    },
    {
      url: 'https://readdy.ai/api/search-image?query=Cozy%20corner%20seating%20in%20Japanese%20ramen%20restaurant%20with%20cushioned%20bench%2C%20small%20wooden%20table%2C%20decorative%20plants%2C%20warm%20ambient%20lighting%2C%20intimate%20dining%20spot%2C%20comfortable%20atmosphere%2C%20professional%20interior%20photography%2C%20simple%20white%20background&width=800&height=1000&seq=gallery8&orientation=portrait',
      title: 'Góc Ấm Cúng'
    },
    {
      url: 'https://readdy.ai/api/search-image?query=Japanese%20ramen%20restaurant%20outdoor%20seating%20area%20with%20wooden%20deck%2C%20traditional%20lanterns%2C%20potted%20bamboo%20plants%2C%20comfortable%20chairs%20and%20tables%2C%20evening%20ambiance%2C%20string%20lights%2C%20inviting%20patio%20space%2C%20professional%20photography%2C%20simple%20white%20background&width=800&height=1000&seq=gallery9&orientation=portrait',
      title: 'Khu Vực Ngoài Trời'
    },
    {
      url: 'https://readdy.ai/api/search-image?query=Japanese%20restaurant%20bar%20area%20with%20sake%20bottles%20display%2C%20wooden%20shelving%2C%20ambient%20lighting%2C%20modern%20bar%20counter%2C%20traditional%20Japanese%20elements%2C%20professional%20interior%20photography%2C%20sophisticated%20atmosphere%2C%20simple%20white%20background&width=800&height=1000&seq=gallery10&orientation=portrait',
      title: 'Quầy Đồ Uống'
    },
    {
      url: 'https://readdy.ai/api/search-image?query=Japanese%20ramen%20restaurant%20waiting%20area%20with%20comfortable%20seating%2C%20magazine%20rack%2C%20decorative%20plants%2C%20warm%20lighting%2C%20welcoming%20entrance%20space%2C%20modern%20minimalist%20design%2C%20professional%20photography%2C%20simple%20white%20background&width=800&height=1000&seq=gallery11&orientation=portrait',
      title: 'Khu Vực Chờ'
    },
    {
      url: 'https://readdy.ai/api/search-image?query=Japanese%20restaurant%20ceiling%20design%20with%20wooden%20beams%2C%20pendant%20lights%2C%20traditional%20architectural%20elements%2C%20modern%20lighting%20fixtures%2C%20warm%20ambient%20glow%2C%20professional%20interior%20photography%2C%20elegant%20overhead%20view%2C%20simple%20white%20background&width=800&height=1000&seq=gallery12&orientation=portrait',
      title: 'Thiết Kế Trần'
    }
  ];

  return (
    <div className={`min-h-screen transition-all duration-500 relative overflow-hidden ${
      isDarkMode 
        ? 'bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]' 
        : 'bg-gradient-to-br from-[#f8f9fa] via-[#e9ecef] to-[#dee2e6]'
    }`}>
      {/* Animated Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Floating Particles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          ></div>
        ))}
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 backdrop-blur-md border-b transition-all duration-500" style={{
        backgroundColor: isDarkMode ? 'rgba(26, 26, 46, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => window.REACT_APP_NAVIGATE('/')}
            className={`flex items-center gap-2 font-semibold hover:opacity-70 transition-all duration-300 hover:gap-3 cursor-pointer ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}
          >
            <i className="ri-arrow-left-line text-xl"></i>
            <span>Quay Lại</span>
          </button>

          <h1 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            Không Gian Quán
          </h1>

          <div className="flex items-center gap-2">
            <i className={`ri-sun-line text-lg w-5 h-5 flex items-center justify-center transition-colors duration-500 ${
              isDarkMode ? 'text-yellow-300/50' : 'text-yellow-500'
            }`}></i>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={isDarkMode}
                onChange={() => setIsDarkMode(!isDarkMode)}
              />
              <div className={`w-11 h-6 rounded-full peer peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all transition-colors duration-500 ${
                isDarkMode ? 'bg-[#E84118]' : 'bg-gray-400'
              }`}></div>
            </label>
            <i className={`ri-moon-line text-lg w-5 h-5 flex items-center justify-center transition-colors duration-500 ${
              isDarkMode ? 'text-blue-300' : 'text-blue-300/50'
            }`}></i>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="mb-8 animate-fade-in">
          <p className={`text-center text-lg transition-colors duration-500 ${
            isDarkMode ? 'text-white/80' : 'text-gray-700'
          }`}>
            Khám phá không gian ấm cúng và phong cách Nhật Bản tại nhà hàng của chúng tôi
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-[4/5] rounded-2xl overflow-hidden cursor-pointer group shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-slide-up ${
                isDarkMode ? 'bg-white/5' : 'bg-white'
              }`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-lg">{image.title}</h3>
                </div>
              </div>
              <div className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <i className="ri-zoom-in-line text-white"></i>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className={`mt-16 rounded-3xl p-8 backdrop-blur-md border transition-all duration-500 animate-fade-in ${
          isDarkMode 
            ? 'bg-white/10 border-white/20' 
            : 'bg-white/80 border-gray-200'
        }`} style={{ animationDelay: '0.5s' }}>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className={`text-3xl font-bold mb-4 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              Trải Nghiệm Không Gian Nhật Bản Chính Hiệu
            </h2>
            <p className={`text-lg leading-relaxed transition-colors duration-500 ${
              isDarkMode ? 'text-white/80' : 'text-gray-700'
            }`}>
              Với thiết kế lấy cảm hứng từ văn hóa Nhật Bản truyền thống, kết hợp với sự hiện đại và ấm cúng, 
              chúng tôi mang đến cho bạn không gian dùng bữa thoải mái và đáng nhớ. Mỗi góc nhỏ đều được 
              chăm chút tỉ mỉ để tạo nên trải nghiệm ẩm thực trọn vẹn.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 relative z-10">
        <div className="text-center">
          <p className={`text-sm mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-white/60' : 'text-gray-600'
          }`}>
            © 2024 Yagami Rach Sói. All rights reserved.
          </p>
        </div>
      </div>

      {selectedImage !== null && (
        <GalleryModal
          images={galleryImages}
          currentIndex={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}
