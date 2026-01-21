import React from 'react';
import { ComponentData } from '../../types';
import { useComponentData } from '../../hooks/useComponentData';
import { useDataPropBinding } from '../../hooks/useDataPropBinding';

interface HeadlineComponentProps {
  component: ComponentData;
  isEditing?: boolean;
}

const HeadlineComponent: React.FC<HeadlineComponentProps> = ({ component }) => {
  const { props, style, globalStyles, pageData } = useComponentData(component);

  const getDisplayText = () => {
    if (props.usePageTitle && pageData.globalSettings.title) {
      const titleWithoutSuffix = pageData.globalSettings.title.replace(/｜スカパー！:.*$/, '').trim();
      return titleWithoutSuffix || props.text;
    }
    return props.text;
  };

  const displayProps = {
    ...props,
    text: getDisplayText(),
  };

  const containerRef = useDataPropBinding({ props: displayProps });

  const containerStyle: React.CSSProperties = {
    backgroundColor: style?.backgroundColor || globalStyles.mainColor,
    color: style?.textColor || '#ffffff',
    padding: '20px 0',
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
  };

  const headlineStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: '1.4',
    margin: 0,
    color: style?.headlineColor || style?.textColor || '#ffffff',
  };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className="mainColor"
      data-component-background
      data-component-text
    >
      <div style={innerStyle}>
        <h1
          style={headlineStyle}
          data-component-headline
          data-prop="text"
          data-bind-type="text"
        >
          {displayProps.text || 'タイトルを挿入'}
        </h1>
      </div>
    </div>
  );
};

export default HeadlineComponent;