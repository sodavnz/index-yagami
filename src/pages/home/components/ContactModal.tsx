import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useBranch } from '../../../contexts/BranchContext';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

interface ContactData {
  phone: string;
  email: string;
  address: string;
  working_hours: string;
  map_embed_url: string | null;
  additional_info: string;
  share_link: string;
}

interface SiteSettings {
  profile_image: string;
  title: string;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon_class: string;
  gradient_colors: string;
  is_active: boolean;
}

export default function ContactModal({ isOpen, onClose, isDarkMode }: ContactModalProps) {
  const { currentBranch } = useBranch();
  const [contactData, setContactData] = useState<ContactData>({
    phone: '0123456789',
    email: 'yagami@rachsoi.vn',
    address: 'Rạch Sỏi, Kiên Giang, Việt Nam',
    working_hours: '8:00 - 22:00 (Hàng ngày)',
    map_embed_url: null,
    additional_info: '',
    share_link: ''
  });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    profile_image: '',
    title: 'YAGAMI RẠCH SỎI'
  });
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && currentBranch) {
      loadContactInfo();
    }
  }, [isOpen, currentBranch]);

  const loadContactInfo = async () => {
    if (!currentBranch) return;
    
    try {
      // Load site settings for current branch
      const { data: settingsData } = await supabase
        .from('site_settings')
        .select('*')
        .eq('branch_id', currentBranch.id)
        .single();

      if (settingsData) {
        setSiteSettings({
          profile_image: settingsData.profile_image || settingsData.logo_url || '',
          title: settingsData.title || settingsData.site_name || currentBranch.name
        });
      }

      // Load contact info for current branch
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .eq('branch_id', currentBranch.id)
        .single();

      if (error) throw error;

      if (data) {
        setContactData({
          phone: data.phone || currentBranch.phone || '0123456789',
          email: data.email || currentBranch.email || '',
          address: data.address || currentBranch.address || 'Rạch Sỏi, Kiên Giang, Việt Nam',
          working_hours: data.working_hours || '8:00 - 22:00 (Hàng ngày)',
          map_embed_url: data.map_embed_url,
          additional_info: data.additional_info || '',
          share_link: data.share_link || ''
        });
      } else {
        // Fallback to branch data if no contact_info found
        setContactData({
          phone: currentBranch.phone || '0123456789',
          email: currentBranch.email || '',
          address: currentBranch.address || 'Rạch Sỏi, Kiên Giang, Việt Nam',
          working_hours: '8:00 - 22:00 (Hàng ngày)',
          map_embed_url: null,
          additional_info: '',
          share_link: ''
        });
      }

      // Load social links for current branch
      const { data: socialData, error: socialError } = await supabase
        .from('social_links')
        .select('*')
        .eq('branch_id', currentBranch.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (socialError) throw socialError;
      setSocialLinks(socialData || []);

    } catch (error) {
      console.error('Error loading contact info:', error);
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fade-in"
        onClick={onClose}
      ></div>

      {/* Modal - Fullscreen */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className={`w-full h-full overflow-hidden pointer-events-auto transition-all duration-500 ${
            isDarkMode 
              ? 'bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460]' 
              : 'bg-gradient-to-br from-[#f8f9fa] via-[#e9ecef] to-[#dee2e6]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#E84118] to-[#FF6B35] p-6 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full">
                <i className="ri-contacts-line text-2xl text-white w-6 h-6 flex items-center justify-center"></i>
              </div>
              <h2 className="text-2xl font-bold text-white">Liên Hệ</h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 rounded-full transition-all cursor-pointer"
            >
              <i className="ri-close-line text-2xl text-white w-6 h-6 flex items-center justify-center"></i>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto h-[calc(100vh-88px)] p-6">
            {loading ? (
              <div className={`text-center py-12 transition-colors duration-500 ${
                isDarkMode ? 'text-white' : 'text-gray-800'
              }`}>Đang tải...</div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Profile Section */}
                <div className="text-center mb-6">
                  <div className="mb-6">
                    <img
                      src={siteSettings.profile_image}
                      alt={siteSettings.title}
                      className="h-24 w-auto mx-auto object-contain flex-shrink-0 rounded-none"
                      style={{ 
                        borderRadius: '0 !important',
                        clipPath: 'none'
                      }}
                    />
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 transition-colors duration-500 ${
                    isDarkMode ? 'text-white' : 'text-gray-800'
                  }`}>{siteSettings.title}</h3>
                  <p className={`text-sm transition-colors duration-500 ${
                    isDarkMode ? 'text-white/70' : 'text-gray-600'
                  }`}>{contactData.additional_info || 'Liên hệ với chúng tôi để được tư vấn và hỗ trợ'}</p>
                </div>

                {/* Contact Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {contactInfo.map((info, index) => (
                    <div
                      key={index}
                      className={`border rounded-2xl p-4 backdrop-blur-md transition-all duration-500 ${
                        isDarkMode 
                          ? 'bg-white/10 border-white/20' 
                          : 'bg-white/80 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#E84118] flex-shrink-0">
                          <i className={`${info.icon} text-xl text-white w-5 h-5 flex items-center justify-center`}></i>
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-semibold mb-1 transition-colors duration-500 ${
                            isDarkMode ? 'text-white' : 'text-gray-800'
                          }`}>{info.title}</h4>
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

                {/* Call Button */}
                <a
                  href={`tel:${formatPhoneForCall(contactData.phone)}`}
                  className="block w-full bg-gradient-to-r from-[#E84118] to-[#FF6B35] rounded-2xl p-4 text-white font-bold text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer mb-6 whitespace-nowrap"
                >
                  <i className="ri-phone-fill mr-2 w-5 h-5 inline-flex items-center justify-center"></i>
                  GỌI NGAY: {contactData.phone}
                </a>

                {/* Social Media */}
                {socialLinks.length > 0 && (
                  <div className="mb-6">
                    <h4 className={`text-center font-bold mb-4 transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>Kết Nối Với Chúng Tôi</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {socialLinks.map((social) => (
                        <a
                          key={social.id}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`border rounded-2xl p-4 backdrop-blur-md transition-all duration-500 hover:scale-105 cursor-pointer ${
                            isDarkMode 
                              ? 'bg-white/10 border-white/20 hover:bg-white/20' 
                              : 'bg-white/80 border-gray-200 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br ${social.gradient_colors} flex-shrink-0 shadow-lg`}>
                              <i className={`${social.icon_class} text-2xl text-white w-6 h-6 flex items-center justify-center`}></i>
                            </div>
                            <div className="flex-1">
                              <h5 className={`font-bold transition-colors duration-500 ${
                                isDarkMode ? 'text-white' : 'text-gray-800'
                              }`}>{social.platform}</h5>
                              <p className={`text-xs transition-colors duration-500 ${
                                isDarkMode ? 'text-white/60' : 'text-gray-600'
                              }`}>Nhấn để liên hệ</p>
                            </div>
                            <i className={`ri-arrow-right-line text-lg w-5 h-5 flex items-center justify-center transition-colors duration-500 ${
                              isDarkMode ? 'text-white/40' : 'text-gray-400'
                            }`}></i>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Google Maps */}
                <div className={`border rounded-2xl overflow-hidden backdrop-blur-md transition-all duration-500 ${
                  isDarkMode 
                    ? 'bg-white/10 border-white/20' 
                    : 'bg-white/80 border-gray-200'
                }`}>
                  <div className={`p-4 border-b transition-all duration-500 ${
                    isDarkMode ? 'border-white/20' : 'border-gray-200'
                  }`}>
                    <h4 className={`font-bold transition-colors duration-500 ${
                      isDarkMode ? 'text-white' : 'text-gray-800'
                    }`}>
                      <i className="ri-map-pin-fill mr-2 text-[#E84118] w-5 h-5 inline-flex items-center justify-center"></i>
                      Vị Trí Của Chúng Tôi
                    </h4>
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
                      className={`flex items-center justify-center gap-2 w-full border rounded-xl p-3 font-semibold text-center hover:scale-105 transition-all duration-300 cursor-pointer whitespace-nowrap ${
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
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
