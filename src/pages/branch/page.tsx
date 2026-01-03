import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MenuModal from '../home/components/MenuModal';
import SpaceModal from '../home/components/SpaceModal';
import ContactModal from '../home/components/ContactModal';
import VisitorCounter from '../../components/feature/VisitorCounter';
import { supabase } from '../../lib/supabase';

interface Branch {
  id: number;
  name: string;
  slug: string;
  address: string;
  phone: string;
  email?: string;
}

interface NavLink {
  id: string;
  title: string;
  url: string | null;
  link_type: 'external' | 'internal' | 'modal';
  internal_route: string | null;
  modal_type: string | null;
  button_style: string;
  display_order: number;
  is_active: boolean;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon_class: string;
  gradient_colors: string;
  display_order: number;
  is_active: boolean;
}

interface SiteSettings {
  profile_image: string;
  title: string;
  subtitle: string;
}

interface SpaceImage {
  id: string;
  image_url: string;
  title: string;
  description: string;
}

export default function BranchPage() {
  const { branchSlug } = useParams<{ branchSlug: string }>();
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSpaceOpen, setIsSpaceOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [contactButtonText, setContactButtonText] = useState('LIÊN HỆ');
  const [settings, setSettings] = useState<SiteSettings>({
    profile_image: '',
    title: 'YAGAMI',
    subtitle: 'Verified',
  });
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [spaceImages, setSpaceImages] = useState<SpaceImage[]>([]);

  useEffect(() => {
    loadBranchData();
  }, [branchSlug]);

  const loadBranchData = async () => {
    try {
      // Load branch info
      const { data: branchData, error: branchError } = await supabase
        .from('branches')
        .select('*')
        .eq('slug', branchSlug)
        .single();

      if (branchError || !branchData) {
        console.error('Branch not found:', branchError);
        window.location.href = __BASE_PATH__;
        return;
      }

      setCurrentBranch(branchData);

      // Load site settings for this branch
      const settingsResponse = await supabase
        .from('site_settings')
        .select('*')
        .eq('branch_id', branchData.id)
        .single();

      if (settingsResponse?.data && !settingsResponse.error) {
        setSettings(settingsResponse.data);
      }

      // Load navigation links for this branch
      const linksResponse = await supabase
        .from('navigation_links')
        .select('*')
        .eq('branch_id', branchData.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (linksResponse?.data && !linksResponse.error) {
        setNavLinks(linksResponse.data);
      }

      // Load social links for this branch
      const socialResponse = await supabase
        .from('social_links')
        .select('*')
        .eq('branch_id', branchData.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (socialResponse?.data && !socialResponse.error) {
        setSocialLinks(socialResponse.data);
      }

      // Load contact button text for this branch
      const contactResponse = await supabase
        .from('contact_info')
        .select('button_text')
        .eq('branch_id', branchData.id)
        .single();

      if (contactResponse?.data?.button_text && !contactResponse.error) {
        setContactButtonText(contactResponse.data.button_text);
      }

      // Load space images for this branch
      const spaceResponse = await supabase
        .from('space_images')
        .select('*')
        .eq('branch_id', branchData.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (spaceResponse?.data && !spaceResponse.error) {
        setSpaceImages(spaceResponse.data);
      }
    } catch (error) {
      console.error('Error loading branch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (link: NavLink) => {
    if (link.link_type === 'modal') {
      if (link.modal_type === 'menu') {
        setIsMenuOpen(true);
      } else if (link.modal_type === 'space') {
        setIsSpaceOpen(true);
      } else if (link.modal_type === 'contact') {
        setIsContactOpen(true);
      }
    } else if (link.link_type === 'internal' && link.internal_route) {
      window.REACT_APP_NAVIGATE(`/${branchSlug}${link.internal_route}`);
    } else if (link.link_type === 'external' && link.url) {
      window.open(link.url, '_blank');
    }
  };

  const handleContactClick = () => {
    window.REACT_APP_NAVIGATE(`/${branchSlug}/contact`);
  };

  const renderButton = (link: NavLink) => {
    const baseClasses = "block w-full rounded-2xl p-4 font-semibold text-center hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg whitespace-nowrap";
    
    if (link.link_type === 'internal' && link.internal_route === '/contact') {
      return (
        <button
          key={link.id}
          onClick={handleContactClick}
          className={`${baseClasses} backdrop-blur-md border ${
            isDarkMode 
              ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
              : 'bg-white/80 border-gray-200 text-gray-800 hover:bg-white'
          }`}
        >
          {contactButtonText}
        </button>
      );
    }
    
    if (link.button_style === 'gradient') {
      return (
        <button
          key={link.id}
          onClick={() => handleLinkClick(link)}
          className={`${baseClasses} bg-gradient-to-r from-[#EE4D2D] to-[#FF6533] text-white hover:shadow-2xl`}
        >
          {link.title}
        </button>
      );
    }

    return (
      <button
        key={link.id}
        onClick={() => handleLinkClick(link)}
        className={`${baseClasses} backdrop-blur-md border ${
          isDarkMode 
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
            : 'bg-white/80 border-gray-200 text-gray-800 hover:bg-white'
        }`}
      >
        {link.title}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  if (!currentBranch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="text-white text-xl">Không tìm thấy chi nhánh</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-all duration-500 relative overflow-hidden ${
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

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <button
          onClick={() => window.REACT_APP_NAVIGATE('/')}
          className={`mb-4 flex items-center gap-2 transition-all duration-300 hover:gap-3 cursor-pointer ${
            isDarkMode ? 'text-white/60 hover:text-white' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="ri-arrow-left-line"></i>
          <span>Quay lại chọn chi nhánh</span>
        </button>

        {/* Profile Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="mb-6">
            <img
              src={settings.profile_image}
              alt={settings.title}
              className="h-24 w-auto mx-auto object-contain flex-shrink-0 rounded-none transition-transform duration-500 hover:scale-110"
              style={{ 
                borderRadius: '0 !important',
                clipPath: 'none'
              }}
            />
            {settings.subtitle && (
              <div className="mt-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <span className="inline-block bg-gradient-to-r from-[#E84118] to-[#FF6533] px-4 py-1 rounded-full text-white text-xs font-semibold shadow-lg">
                  {settings.subtitle}
                </span>
              </div>
            )}
          </div>
          
          <h1 className={`text-3xl font-bold mb-2 transition-colors duration-500 animate-slide-up ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`} style={{ animationDelay: '0.3s' }}>{settings.title}</h1>
          
          {/* Theme Toggle */}
          <div className="flex items-center justify-center gap-2 mb-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
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

        {/* Links Section */}
        <div className="space-y-4 mb-6">
          {navLinks.map((link, index) => (
            <div 
              key={link.id}
              className="animate-slide-up"
              style={{ animationDelay: `${0.5 + index * 0.1}s` }}
            >
              {renderButton(link)}
            </div>
          ))}
        </div>

        {/* Social Media Icons */}
        {socialLinks.length > 0 && (
          <div className="flex items-center justify-center gap-4 mb-8 animate-slide-up" style={{ animationDelay: `${0.5 + navLinks.length * 0.1}s` }}>
            {socialLinks.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 flex items-center justify-center bg-gradient-to-br ${social.gradient_colors} rounded-full text-white hover:scale-110 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl`}
              >
                <i className={`${social.icon_class} text-xl`}></i>
              </a>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="text-center animate-fade-in" style={{ animationDelay: '1s' }}>
          <p className={`text-sm mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-white/60' : 'text-gray-600'
          }`}>
            © 2024 {currentBranch.name}. All rights reserved.
          </p>
        </div>
      </div>

      <MenuModal isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} branchId={currentBranch.id} />
      <SpaceModal 
        isOpen={isSpaceOpen} 
        onClose={() => setIsSpaceOpen(false)} 
        images={spaceImages}
      />
      <ContactModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
        isDarkMode={isDarkMode}
      />
      
      <VisitorCounter />
    </div>
  );
}
