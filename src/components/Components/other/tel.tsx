import React from 'react';
import { ComponentData } from '../../types';
import { useComponentData } from '../../hooks/useComponentData';
import { useDataPropBinding } from '../../hooks/useDataPropBinding';

interface telProps {
  component: ComponentData;
  isEditing?: boolean;
}

const tel: React.FC<telProps> = ({ component }) => {
  const { props, style, globalStyles } = useComponentData(component);
  const containerRef = useDataPropBinding({ props });

  const containerStyle: React.CSSProperties = {
    backgroundColor: style?.backgroundColor || globalStyles.baseColor,
    padding: '60px 20px',
  };

  const innerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  return (
    <section ref={containerRef} style={containerStyle}>
      <div style={innerStyle}>
        <p className="tel-title" data-prop="p_1_text" data-bind-type="text">お電話でもお申込みいただけます</p>
        <div className="tel__contents">
          <p className="tel-number" data-prop="p_2_text" data-bind-type="text"><a href="tel:0120-165-226" data-prop="p_6_link" data-bind-type="link-full"><span>0120-165-226</span></a></p>
          <p className="tel-time" data-prop="p_3_text" data-bind-type="text">営業時間：10:00～20:00</p>
          <p className="tel-caution" data-prop="p_4_text" data-bind-type="text">※おかけ間違いのないようにご注意ください。<br />※お客さまの個人情報に関する取り扱いにつきましては、当社公式サイト上の<a href="/policy/" data-prop="p_5_link" data-bind-type="link-full">プライバシーポリシー</a>をご確認いただき、同意の上、お申込ください。</p>
        </div>
      </div>
    </section>
  );
};

export default tel;