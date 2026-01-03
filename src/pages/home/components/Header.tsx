import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useBranch } from '@/contexts/BranchContext';

export default function Header() {
  const { currentBranch } = useBranch();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [navLinks, setNavLinks] = useState<any[]>([]);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentBranch) return;

      // Fetch site settings
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('*')
        .eq('branch_id', currentBranch.id)
        .single();

      if (settingsData) {
        setSettings(settingsData);
      }

      // Fetch navigation links
      const { data: navData } = await supabase
        .from('navigation_links')
        .select('*')
        .eq('branch_id', currentBranch.id)
        .order('display_order', { ascending: true });

      if (navData) {
        setNavLinks(navData);
      }

      // Fetch social links
      const { data: socialData } = await supabase
        .from('social_links')
        .select('*')
        .eq('branch_id', currentBranch.id)
        .order('display_order', { ascending: true });

      if (socialData) {
        setSocialLinks(socialData);
      }
    };

    fetchData();
  }, [currentBranch]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/90 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings?.profile_image && (
              <img
                src={settings.profile_image}
                alt={`${settings.title} Logo`}
                className="h-14 w-auto object-contain"
              />
            )}
            <span className="text-2xl font-bold text-[#E84118]">{settings?.title}</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-[#2C3E50] font-medium text-sm hover:text-[#E84118] transition-colors relative group cursor-pointer whitespace-nowrap"
              >
                {item.name}
                <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#E84118] transition-all duration-300 group-hover:w-full group-hover:left-0"></span>
              </a>
            ))}
          </nav>

          <button className="hidden md:flex items-center gap-2 bg-gradient-to-r from-[#E84118] to-[#FF6B35] text-white px-6 py-3 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer whitespace-nowrap">
            <i className="ri-calendar-line"></i>
            Đặt Bàn Ngay
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-2xl text-[#2C3E50] w-10 h-10 flex items-center justify-center cursor-pointer"
          >
            <i className={isMobileMenuOpen ? 'ri-close-line' : 'ri-menu-line'}></i>
          </button>
        </div>

        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-[#2C3E50] font-medium hover:text-[#E84118] transition-colors cursor-pointer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <button className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#E84118] to-[#FF6B35] text-white px-6 py-3 rounded-full font-semibold cursor-pointer whitespace-nowrap">
              <i className="ri-calendar-line"></i>
              Đặt Bàn Ngay
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
