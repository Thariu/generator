import React, { useState } from 'react';
import { ArrowRight, Check, Info } from 'lucide-react';
import { ComponentData } from '../../types';
import { useComponentData } from '../../hooks/useComponentData';
import { useDataPropBinding } from '../../hooks/useDataPropBinding';

interface PricingComponentProps {
  component: ComponentData;
  isEditing?: boolean;
}

const PricingComponent: React.FC<PricingComponentProps> = ({ component }) => {
  const [isMustReadOpen, setIsMustReadOpen] = useState(false);

  const { props, style, globalStyles } = useComponentData(component);
  const containerRef = useDataPropBinding({ props });

  const {
    mainPlan,
    additionalPlans,
    showMustReadBox
  } = props;

  const {
    theme,
    backgroundColor,
    textColor,
    headlineColor,
    descriptionColor,
    accentColor,
    cardBackgroundColor,
    cardTextColor,
    mainPlanBackgroundColor,
    mainPlanBoxColor,
    mainPlanTextColor,
    priceColor,
  } = style || {};

  const { mainColor, baseColor, base2Color, accentColor: globalAccentColor } = globalStyles;

  const getThemeClasses = () => {
    if (backgroundColor) {
      return '';
    }
    if (theme === 'dark') {
      return 'bg-gray-900';
    }
    return 'bg-gray-100';
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

  const containerStyle = {
    backgroundColor: backgroundColor || baseColor,
    color: textColor || undefined,
  };

  const mainTextStyle = textColor ? { color: textColor } : {};
  const headlineStyle = headlineColor ? { color: headlineColor } : mainTextStyle;
  const descriptionTextStyle = descriptionColor ? { color: descriptionColor } : mainTextStyle;

  // 価格ボックスのスタイル（共通スタイル適用）
  const priceBoxStyle = {
    backgroundColor: mainPlanBackgroundColor || mainColor,
  };

  const priceBoxHeaderStyle = {
    backgroundColor: mainPlanBackgroundColor || mainColor,
    filter: 'brightness(1.1)',
  };

  // メインプランのスタイル（個別設定適用）
  const mainPlanStyle = {
    backgroundColor: mainPlanBoxColor || '#3b82f6',
    color: mainPlanTextColor || '#ffffff',
  };

    // 固定の価格比較ボックスデータ
  const fixedPriceBoxes = [
    {
      period: 'ご加入月',
      items: [
        {
          label: '視聴料',
          price: '0',
          unit: '円（税込）'
        },
        {
          label: '基本料',
          price: '0',
          unit: '円（税込）'
        }
      ]
    },
    {
      period: '翌月以降',
      items: [
        {
          label: '視聴料',
          description: '選んだチャンネル、プラン・セット料金'
        },
        {
          label: '基本料',
          price: '429',
          unit: '円（税込）'
        }
      ]
    }
  ];

  // 固定のアクションボタン
  const fixedButtons = [
    {
      text: 'ご加入はこちら',
      url: '#',
      type: 'primary'
    },
    {
      text: 'ご契約追加はこちら',
      url: '#',
      type: 'secondary'
    }
  ];

  return (
    <section ref={containerRef} id='priceArea' className={`baseColor`} style={containerStyle}>
      <h3>コンテンツ</h3>
      <div className='priceInfo priceInfo1'>
        <p className='subTitle alignBaseline main-pattern-1'><span className='textLarge'>ご加入月は<span className='price'>0</span>円</span>で<br className='sp'/>人気番組が楽しめる！</p>

        <div className='priceTable'>
          <div className='priceBox thisMonth mainColor'>
            <p className='tit accent-pattern-1'>ご加入月</p>
            <div className='fee viewingFee'>
            <p className='flag accent-pattern-2'>視聴料</p>
            <p><span className='fontLearge fontRobot'>0</span><span className='fontMedium'>円</span>(税込)</p>
            </div>
            <div className='fee BasicFee'>
            <p className='flag accent-pattern-2'>基本料</p>
            <p><span className='fontLearge fontRobot'>0</span><span className='fontMedium'>円</span>(税込)</p>
            </div>
          </div>

          <div className='priceBox nextMonth mainColor'>
            <p className='tit accent-pattern-1'>翌月以降</p>
            <div className='fee viewingFee'>
            <p className='flag accent-pattern-2'>視聴料</p>
            <p className='text'>
                選んだチャンネル、<br/>
                プラン・セット料金
            </p>
            </div>
            <div className='fee BasicFee'>
            <p className='flag accent-pattern-2'>基本料</p>
            <p><span className='fontLearge fontRobot'>429</span><span className='fontMedium'>円</span>(税込)</p>
            </div>
          </div>
        </div>

        {/* メインプラン */}
        {mainPlan && (
          <div className="ChFeeWrapper">
            <div className="chFee chFee2 chFee_style" id='priceInfo2'>
              <p className="tit">
                {mainPlan.description}をはじめ、<span><img src='/program/st/promo/generator_common/img/kihon_logo.gif' alt='基本プラン' className='guard'/></span>マークのある番組が全部見放題！
              </p>
              <div className="viewingFee">
                <div className="flag" style={{ 
                      backgroundColor: mainPlanStyle.backgroundColor || '#3b82f6' , 
                      color: mainPlanStyle.color || '#ffffff' 
                    }}>
                {mainPlan.name}
              </div>
                <div className="price">
                  初回視聴料
                    <span className="fontLearge fontRobot" style={{ color: priceColor || '#3b82f6' }}>
                      {mainPlan.price}
                    </span>
                    円<span className="fontSmall">（税込）</span>
                </div>
              </div>
              {mainPlan.note && (
                <p className="annotation">
                  {mainPlan.note}
                </p>
              )}

              <div className="mustReadbox" style={{ display: showMustReadBox ? 'block' : 'none' }}>
                <dl>
                  <dt onClick={() => setIsMustReadOpen(!isMustReadOpen)} className={isMustReadOpen ? 'is-open' : ''}>
                    <span>初回視聴料1,980円(税込)の注意事項</span>
                  </dt>
                  <dd className={isMustReadOpen ? 'is-open' : ''}>
                    <table className="cautionTable">
                      <tbody>
                        <tr>
                          <th>名称</th>
                          <td>スカパー！基本プラン 初回視聴料1,980円(税込)</td>
                        </tr>
                        <tr>
                            <th>内容</th>
                            <td>「スカパー！基本プラン」初回視聴料(通常： 3,600円/月(3,960円/月 税込))が、 1,800円/月( 1,980円 税込)になります。</td>
                        </tr>
                        <tr>
                            <th>対象者</th>
                            <td>スカパー！新規ご加入と同時に基本プラン(商品コード：011)をご契約されるお客さま</td>
                        </tr>
                        <tr>
                            <th>注意事項</th>
                            <td>
                            <p className="icon_type_01">2回目以降のご請求料金は自動的に3,600円/月(3,960円/月 税込)になります。</p>
                            <p className="icon_type_01">B-CASカード/ACAS番号1枚につき、1回のみ適用されます。また、基本プランの複数台料金設定の対象となったB-CASカード/ACAS番号は本サービスの対象外です。</p>
                            <p className="icon_type_01">スカパー！解約後、同一のB-CASカード・ACAS番号で再加入されるお客さまは適用対象とはなりません。</p>
                            <p className="icon_type_01">スカパー！基本料390円/月(429円/月 税込)が別途かかります。</p>
                            <p className="icon_type_01">ご契約内容が基本プラン複数台料金設定の適用条件を満たしている場合には、2台目・3台目は自動的に基本プラン複数台料金設定が適用されます。</p>
                            <p className="icon_type_01">本サービスは、現金を送金したり、ご指定の口座に振り込むものではありません。</p>
                            <p className="icon_type_01">解約のお申し出がない限り、「スカパー！基本プラン」の契約は継続いたします。</p>
                            <p className="icon_type_01">法人および業務用契約のお客さま(ご自宅以外の事務所、店舗、休憩所など不特定または多数の人が視聴できる場所に受信機を設置する場合)は、対象外となります。</p>
                            </td>
                        </tr>
                        <tr>
                            <th>主催者</th>
                            <td>スカパーJSAT（株）</td>
                        </tr>
                      </tbody>
                    </table>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        )}

        {/* 追加プラン */}
        {additionalPlans && additionalPlans.length > 0 && (
          <div className="ChFeeWrapper">
            {additionalPlans.map((plan, index) => (
              <div key={index} className="chFee chFee_style">
                <p className="tit" style={descriptionTextStyle}>
                  {plan.description}
                </p>
                <div className="viewingFee">
                  <div className="flag" style={{ 
                      backgroundColor: plan.backgroundColor || '#FABE00',
                      color: plan.textColor || '#000000'
                    }}>
                    {plan.name}
                  </div>
                  <p className="price">
                    視聴料
                    <span className="fontLearge fontRobot" style={{ color: plan.priceColor || '#FABE00' }}>
                      {plan.price}
                    </span>
                    <span className="text-lg ml-1" style={mainTextStyle}>
                      円/月（税込）
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flexWrapper">
            <div className="c-btn c-btn--blueline"><a href="https://www.skyperfectv.co.jp/plan/channel/basic/">各チャンネルの<br/>料金一覧はこちら</a></div>
            <div className="c-btn c-btn--blueline"><a href="https://www.skyperfectv.co.jp/plan/pack/basic/">各プラン・セットの<br/>料金一覧はこちら</a></div>
        </div>
      </div>
    </section>
  );
};

export default PricingComponent;