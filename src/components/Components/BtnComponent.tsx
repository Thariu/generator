import React from 'react';
import { ComponentData } from '../../types';
import { useComponentData } from '../../hooks/useComponentData';
import { useDataPropBinding } from '../../hooks/useDataPropBinding';

interface btnProps {
  component: ComponentData;
  isEditing?: boolean;
}

const btn: React.FC<btnProps> = ({ component }) => {
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
    <section id="test3_btnArea" ref={containerRef} style={containerStyle}>
      <div style={innerStyle}>
        <section id="addArea" className="baseColor">
            <div className="flexWrapper">
                <div className="c-btn c-btn--red"><a href="" className="js-modal" data-target="modal-confirm">ご加入はこちら</a></div>
                <div className="c-btn c-btn--blank c-btn--blue"><a href="https://my.skyperfectv.co.jp/login/?bk_url=https%3A%2F%2Fmy.skyperfectv.co.jp%2Fmy%2Fchannel-change%2Fcas" target="_blank"><span>ご契約追加はこちら</span></a></div>
            </div>
        </section>
      </div>
    </section>
  );
};

export default btn;