import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { ComponentData } from '../../../types';
import { useComponentData } from '../../../hooks/useComponentData';
import { useDataPropBinding } from '../../../hooks/useDataPropBinding';

interface FAQComponentProps {
  component: ComponentData;
  isEditing?: boolean;
}

const FAQComponent: React.FC<FAQComponentProps> = ({ component }) => {
  const { props, style, globalStyles } = useComponentData(component);
  const containerRef = useDataPropBinding({ props });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const { title, description, faqs } = props;
  const { theme, backgroundColor, textColor, headlineColor, descriptionColor, cardBackgroundColor, cardTextColor } = style || {};

  const getThemeClasses = () => {
    if (backgroundColor) {
      return '';
    }
    if (theme === 'dark') {
      return 'bg-gray-900';
    }
    return 'bg-gray-50';
  };

  const getTextClasses = () => {
    if (textColor) {
      return '';
    }
    if (theme === 'dark') {
      return 'text-white';
    }
    return 'text-gray-900';
  };

  const getCardClasses = () => {
    if (cardBackgroundColor) {
      return '';
    }
    if (theme === 'dark') {
      return 'border-gray-700 bg-gray-800';
    }
    return 'border-gray-200 bg-white';
  };

  const getHoverClasses = () => {
    if (theme === 'dark') {
      return 'hover:bg-gray-700';
    }
    return 'hover:bg-gray-50';
  };

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const containerStyle = {
    backgroundColor: backgroundColor || undefined,
    color: textColor || undefined,
  };

  const mainTextStyle = textColor ? { color: textColor } : {};
  const headlineStyle = headlineColor ? { color: headlineColor } : mainTextStyle;
  const descriptionTextStyle = descriptionColor ? { color: descriptionColor } : mainTextStyle;
  const cardStyle = {
    backgroundColor: cardBackgroundColor || undefined,
    color: cardTextColor || textColor || undefined,
  };

  return (
    <div
      ref={containerRef}
      className={`baseColor py-16 sm:py-24 ${getThemeClasses()} ${getTextClasses()}`}
      style={containerStyle}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 commonColor" style={headlineStyle}>{title}</h2>
          {description && (
            <p
              className="text-xl max-w-3xl mx-auto commonColor"
              style={descriptionTextStyle}
            >
              {description}
            </p>
          )}
        </div>

        <div className="space-y-4">
          {faqs.map((faq: any, index: number) => {
            const accordionId = `${component.id}-faq-${index}`;
            return (
              <div
                key={index}
                className={`base2Color border rounded-lg overflow-hidden ${getCardClasses()}`}
                style={cardStyle}
              >
                <button
                  data-accordion-trigger={accordionId}
                  onClick={() => toggleFAQ(index)}
                  className={`w-full px-6 py-4 text-left flex items-center justify-between hover:bg-opacity-50 transition-colors ${getHoverClasses()}`}
                  style={cardTextColor ? { color: cardTextColor } : mainTextStyle}
                  aria-expanded={openIndex === index}
                >
                  <span className="font-semibold text-lg">{faq.question}</span>
                  <ChevronDown
                    data-accordion-icon={accordionId}
                    className={`w-5 h-5 transition-transform duration-200 ${
                      openIndex === index ? 'transform rotate-180 is-rotated' : ''
                    }`}
                  />
                </button>

                <div
                  data-accordion-content={accordionId}
                  className={`px-6 transition-all duration-200 ${openIndex === index ? 'is-open pb-4' : 'h-0 overflow-hidden'}`}
                  aria-hidden={openIndex !== index}
                >
                  <p
                    className="leading-relaxed"
                    style={{ color: cardTextColor ? `${cardTextColor}CC` : (textColor ? `${textColor}CC` : undefined) }}
                  >
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FAQComponent;