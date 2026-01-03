import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface ContactData {
  phone: string;
  email: string;
  address: string;
  working_hours: string;
  map_embed_url: string | null;
  additional_info: string;
  button_text: string;
  share_link: string;
}

interface SiteSettings {
  logo_url: string | null;
  site_name: string;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon_class: string;
  gradient_colors: string;
  is_active: boolean;
}

export default function Contact() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    logo_url: null,
    site_name: 'YAGAMI RẠCH SỎI'
  });
  const [contactData, setContactData] = useState<ContactData>({
    phone: '0123456789',
    email: 'yagami@rachsoi.vn',
    address: 'Rạch Sỏi, Kiên Giang, Việt Nam',
    working_hours: '8:00 - 22:00 (Hàng ngày)',
    map_embed_url: null,
    additional_info: '',
    button_text: 'LIÊN HỆ',
    share_link: ''
  });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load site settings
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (settingsData) {
        setSiteSettings({
          logo_url: settingsData.logo_url,
          site_name: settingsData.site_name || 'YAGAMI RẠCH SỎI'
        });
      }

      // Load contact info
      const { data: contactInfo, error } = await supabase
        .from('contact_info')
        .select('*')
        .single();

      if (error) throw error;

      if (contactInfo) {
        setContactData({
          phone: contactInfo.phone || '0123456789',
          email: contactInfo.email || '',
          address: contactInfo.address || 'Rạch Sỏi, Kiên Giang, Việt Nam',
          working_hours: contactInfo.working_hours || '8:00 - 22:00 (Hàng ngày)',
          map_embed_url: contactInfo.map_embed_url,
          additional_info: contactInfo.additional_info || '',
          button_text: contactInfo.button_text || 'LIÊN HỆ',
          share_link: contactInfo.share_link || ''
        });
      }

      // Load social links from social_links table
      const { data: socialData, error: socialError } = await supabase
        .from('social_links')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (socialError) throw socialError;
      setSocialLinks(socialData || []);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractMapUrl = (embedCode: string | null) => {
    if (!embedCode) {
      return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125447.89474057!2d105.07!3d10.01!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a089b5a63d8d0f%3A0x3e7e3e3e3e3e3e3e!2zUuG6oWNoIFPhu49pLCBLacOqbiBHaWFuZywgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1234567890123!5m2!1svi!2s';
    }
    const match = embedCode.match(/src="([^"]+)"/);
    return match ? match[1] : embedCode;
  };

  const formatPhoneForCall = (phone: string) => {
    return phone.replace(/\s/g, '');
  };

  const getDirectionsLink = () => {
    if (contactData.share_link) {
      return contactData.share_link;
    }
    return `https://maps.google.com/?q=${encodeURIComponent(contactData.address)}`;
  };

  const contactInfo = [
    {
      icon: 'ri-map-pin-line',
      title: 'Địa Chỉ',
      content: contactData.address,
      link: getDirectionsLink()
    },
    {
      icon: 'ri-phone-line',
      title: 'Điện Thoại',
      content: contactData.phone,
      link: `tel:${formatPhoneForCall(contactData.phone)}`
    },
    {
      icon: 'ri-time-line',
      title: 'Giờ Mở Cửa',
      content: contactData.working_hours,
      link: null
    }
  ];

  if (contactData.email) {
    contactInfo.push({
      icon: 'ri-mail-line',
      title: 'Email',
      content: contactData.email,
      link: `mailto:${contactData.email}`
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

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
      <div className="sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-500" style={{
        backgroundColor: isDarkMode ? 'rgba(26, 26, 46, 0.8)' : 'rgba(255, 255, 255, 0.8)',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
      }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => window.REACT_APP_NAVIGATE('/')}
            className={`flex items-center gap-2 transition-all duration-300 hover:gap-3 cursor-pointer ${
              isDarkMode ? 'text-white hover:text-white/80' : 'text-gray-800 hover:text-gray-600'
            }`}
          >
            <i className="ri-arrow-left-line text-xl w-6 h-6 flex items-center justify-center"></i>
            <span className="font-semibold whitespace-nowrap">Quay Lại</span>
          </button>

          <h1 className={`text-xl font-bold transition-colors duration-500 ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>{contactData.button_text}</h1>

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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Profile Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className={`w-32 h-32 rounded-full overflow-hidden border-4 shadow-2xl mx-auto mb-4 transition-all duration-500 hover:scale-110 ${
            isDarkMode ? 'border-white/20' : 'border-gray-300'
          }`}>
            {siteSettings.logo_url ? (
              <img
                src={siteSettings.logo_url}
                alt={siteSettings.site_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Logo load error');
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${
                isDarkMode ? 'bg-white/10' : 'bg-gray-200'
              }`}>
                <i className={`ri-image-line text-4xl ${
                  isDarkMode ? 'text-white/40' : 'text-gray-400'
                } w-10 h-10 flex items-center justify-center`}></i>
              </div>
            )}
          </div>
          <h2 className={`text-2xl font-bold mb-2 transition-colors duration-500 animate-slide-up ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`} style={{ animationDelay: '0.1s' }}>{siteSettings.site_name}</h2>
          <p className={`text-sm transition-colors duration-500 animate-slide-up ${
            isDarkMode ? 'text-white/70' : 'text-gray-600'
          }`} style={{ animationDelay: '0.2s' }}>{contactData.additional_info || 'Chào mừng bạn đến với YAGAMI RẠCH SỎI'}</p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className={`backdrop-blur-md border rounded-2xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl animate-slide-up ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20' 
                  : 'bg-white/80 border-gray-200'
              }`}
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 flex items-center justify-center rounded-full flex-shrink-0 shadow-lg ${
                  isDarkMode ? 'bg-[#E84118]' : 'bg-[#E84118]'
                }`}>
                  <i className={`${info.icon} text-2xl text-white w-6 h-6 flex items-center justify-center`}></i>
                </div>
                <div className="flex-1">
                  <h3 className={`font-semibold mb-2 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>{info.title}</h3>
                  {info.link ? (
                    <a
                      href={info.link}
                      target={info.link.startsWith('http') ? '_blank' : undefined}
                      rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className={`text-sm hover:underline transition-colors duration-500 cursor-pointer ${
                        isDarkMode ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      {info.content}
                    </a>
                  ) : (
                    <p className={`text-sm transition-colors duration-500 ${
                      isDarkMode ? 'text-white/80' : 'text-gray-600'
                    }`}>{info.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Social Media Links */}
        {socialLinks.length > 0 && (
          <div className="mb-8 animate-slide-up" style={{ animationDelay: '0.7s' }}>
            <h3 className={`text-center font-bold mb-4 transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>Liên Hệ Qua Mạng Xã Hội</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {socialLinks.map((social, index) => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`backdrop-blur-md border rounded-2xl p-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl cursor-pointer animate-slide-up ${
                    isDarkMode 
                      ? 'bg-white/10 border-white/20 hover:bg-white/20' 
                      : 'bg-white/80 border-gray-200 hover:bg-white'
                  }`}
                  style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br ${social.gradient_colors} flex-shrink-0 shadow-lg`}>
                      <i className={`${social.icon_class} text-3xl text-white w-7 h-7 flex items-center justify-center`}></i>
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-bold text-lg transition-colors duration-500 ${
                        isDarkMode ? 'text-white' : 'text-gray-800'
                      }`}>{social.platform}</h4>
                      <p className={`text-sm transition-colors duration-500 ${
                        isDarkMode ? 'text-white/60' : 'text-gray-600'
                      }`}>Nhấn để liên hệ</p>
                    </div>
                    <i className={`ri-arrow-right-line text-xl transition-colors duration-500 ${
                      isDarkMode ? 'text-white/40' : 'text-gray-400'
                    } w-5 h-5 flex items-center justify-center`}></i>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Call Button */}
        <a
          href={`tel:${formatPhoneForCall(contactData.phone)}`}
          className="block w-full bg-gradient-to-r from-[#E84118] to-[#FF6B35] rounded-2xl p-5 text-white font-bold text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer mb-8 text-lg whitespace-nowrap animate-slide-up"
          style={{ animationDelay: '1.1s' }}
        >
          <i className="ri-phone-fill mr-2 w-5 h-5 inline-flex items-center justify-center"></i>
          GỌI NGAY: {contactData.phone}
        </a>

        {/* Google Maps */}
        <div className={`backdrop-blur-md border rounded-2xl overflow-hidden transition-all duration-500 animate-slide-up ${
          isDarkMode 
            ? 'bg-white/10 border-white/20' 
            : 'bg-white/80 border-gray-200'
        }`} style={{ animationDelay: '1.2s' }}>
          <div className={`p-4 border-b transition-all duration-500 ${
            isDarkMode ? 'border-white/20' : 'border-gray-200'
          }`}>
            <h3 className={`font-bold text-lg transition-colors duration-500 ${
              isDarkMode ? 'text-white' : 'text-gray-800'
            }`}>
              <i className="ri-map-pin-fill mr-2 text-[#E84118] w-5 h-5 inline-flex items-center justify-center"></i>
              Vị Trí Của Chúng Tôi
            </h3>
          </div>
          <div className="relative w-full h-96">
            <iframe
              src={extractMapUrl(contactData.map_embed_url)}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Vị trí Yagami Rạch Sỏi"
            ></iframe>
          </div>
          <div className="p-4">
            <a
              href={getDirectionsLink()}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 w-full backdrop-blur-md border rounded-xl p-3 font-semibold text-center hover:scale-105 transition-all duration-300 cursor-pointer whitespace-nowrap ${
                isDarkMode 
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/20' 
                  : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
              }`}
            >
              <i className="ri-navigation-line text-lg w-5 h-5 flex items-center justify-center"></i>
              Chỉ Đường Trên Google Maps
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pb-8 animate-fade-in" style={{ animationDelay: '1.3s' }}>
          <p className={`text-sm mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-white/60' : 'text-gray-600'
          }`}>
            © 2024 {siteSettings.site_name}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
