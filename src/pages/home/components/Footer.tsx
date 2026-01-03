import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useBranch } from '@/contexts/BranchContext';

interface FooterProps {
  isDarkMode: boolean;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon_class: string;
  gradient_colors: string;
  is_active: boolean;
}

export default function Footer({ isDarkMode }: FooterProps) {
  const { currentBranch } = useBranch();
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [socialLinks, setSocialLinks] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentBranch) return;

      // Fetch contact info
      const { data: contactData } = await supabase
        .from('contact_info')
        .select('*')
        .eq('branch_id', currentBranch.id)
        .single();

      if (contactData) {
        setContactInfo(contactData);
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
    <footer className={`py-12 transition-all duration-500 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-[#1a1a2e]/80 via-[#16213e]/80 to-[#0f3460]/80 backdrop-blur-md' 
        : 'bg-gradient-to-br from-white/80 via-gray-50/80 to-gray-100/80 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Social Links */}
        {socialLinks.length > 0 && (
          <div className="flex justify-center gap-4 mb-8">
            {socialLinks.map((social) => (
              <a
                key={social.id}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br ${social.gradient_colors} hover:scale-110 transition-all duration-300 cursor-pointer shadow-lg`}
                title={social.platform}
              >
                <i className={`${social.icon_class} text-xl text-white w-5 h-5 flex items-center justify-center`}></i>
              </a>
            ))}
          </div>
        )}

        {/* Copyright */}
        <div className="text-center">
          <p className={`text-sm mb-2 transition-colors duration-500 ${
            isDarkMode ? 'text-white/60' : 'text-gray-600'
          }`}>
            © 2024 YAGAMI RẠCH SỎI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
