import React from 'react';
import { Twitter, Linkedin, Instagram, Facebook } from 'lucide-react';
import { ComponentData } from '../../types';
import { useComponentData } from '../../hooks/useComponentData';
import { useDataPropBinding } from '../../hooks/useDataPropBinding';

interface FooterComponentProps {
  component: ComponentData;
  isEditing?: boolean;
}

const FooterComponent: React.FC<FooterComponentProps> = ({ component }) => {
  const { props, style } = useComponentData(component);
  const containerRef = useDataPropBinding({ props });

  const { companyName, description, links, socialLinks, copyright } = props;
  const theme = style?.theme || 'dark';

  const getThemeClasses = () => {
    if (theme === 'light') {
      return 'bg-gray-100 text-gray-900';
    }
    return 'bg-gray-900 text-white';
  };

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      default:
        return <div className="w-5 h-5 bg-gray-400 rounded" />;
    }
  };

  return (
    <footer ref={containerRef} className={`base2Color py-12 ${getThemeClasses()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-bold mb-4 commonColor">{companyName}</h3>
            <p className={`commonColor text-lg mb-6 max-w-md ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
              {description}
            </p>
            
            {/* Social Links */}
            {socialLinks && socialLinks.length > 0 && (
              <div className="flex space-x-4">
                {socialLinks.map((social: any, index: number) => (
                  <a
                    key={index}
                    href={social.url}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'light' 
                        ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                    }`}
                    title={social.platform}
                  >
                    {getSocialIcon(social.platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {links && links.map((link: any, index: number) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className={`transition-colors ${
                      theme === 'light' 
                        ? 'text-gray-600 hover:text-gray-900' 
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className={`space-y-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
              <p>hello@company.com</p>
              <p>+1 (555) 123-4567</p>
              <p>123 Business St<br />City, State 12345</p>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className={`border-t mt-8 pt-8 text-center ${
          theme === 'light' ? 'border-gray-300 text-gray-600' : 'border-gray-800 text-gray-400'
        }`}>
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default FooterComponent;