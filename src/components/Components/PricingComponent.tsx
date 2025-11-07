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
      <h3>コンテンツを見るには</h3>
      <div className='priceInfo priceInfo1'>
        {/* <p className='subTitle alignBaseline main-pattern-1'><span className='textLarge'>ご加入月は<span className='price'>0</span>円</span>で<br className='sp'/>人気番組が楽しめる！</p> */}
        <p className='subTitle main-pattern-1'><span className='textLarge'>契約月は無料</span>で<br className='sp'/>人気番組が楽しめる！</p>

        <div className='priceTable'>
          <div className='priceBox thisMonth mainColor'>
            {/* <p className='tit accent-pattern-1'>ご加入月</p> */}
            <p className='tit accent-pattern-1'>契約月</p>
            <div className='fee viewingFee'>
            <p className='flag accent-pattern-2'>視聴料</p>
            <p><span className='fontLearge fontRobot'>0</span><span className='fontMedium'>円</span>(税込)</p>
            </div>
            {/* <div className='fee BasicFee'>
            <p className='flag accent-pattern-2'>基本料</p>
            <p><span className='fontLearge fontRobot'>0</span><span className='fontMedium'>円</span>(税込)</p>
            </div> */}
          </div>

          <div className='priceBox nextMonth mainColor'>
            <p className='tit accent-pattern-1'>翌月以降</p>
            <div className='fee viewingFee'>
            <p className='flag accent-pattern-2'>視聴料</p>
            {/* <p className='text'>
                選んだチャンネル、<br/>
                プラン・セット料金
            </p> */}
            <p className='text'>
                選んだプラン料金
            </p>
            </div>
            {/* <div className='fee BasicFee'>
            <p className='flag accent-pattern-2'>基本料</p>
            <p><span className='fontLearge fontRobot'>429</span><span className='fontMedium'>円</span>(税込)</p>
            </div> */}
          </div>
        </div>

        {/* メインプラン */}
        {/* {mainPlan && (
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
        )} */}

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

        {/* <div className="flexWrapper">
            <div className="c-btn c-btn--blueline"><a href="/plan/channel/basic/">各チャンネルの<br/>料金一覧はこちら</a></div>
            <div className="c-btn c-btn--blueline"><a href="/plan/pack/basic/">各プラン・セットの<br/>料金一覧はこちら</a></div>
        </div> */}
      </div>


      <style>
        {`
        @media (min-width: 769px) {
          #priceArea {
            background: #1B1B1B;
            padding: 120px 0 140px 0;
          }
          #priceArea .subTitle {
            background: #C3000F;
            width: 100%;
            padding: 18px;
            display: flex;
            justify-content: center;
            align-items: baseline;
            font-size: 26px;
            line-height: normal;
            font-weight: bold;
            margin: 0 0 50px;
            text-align: center;
          }
          #priceArea .subTitle.alignBaseline {
            align-items: baseline;
          }
          #priceArea .subTitle span.textLarge {
            font-size: 36px;
            line-height: inherit;
          }
          #priceArea .subTitle span.price {
            font-family: 'Roboto', sans-serif;
            font-size: 62px;
            line-height: 1.3;
            font-weight: 500;
            padding: 0 2px;
          }
          #priceArea .priceInfo2 .subTitle {
            max-width: 1160px;
            width: 100%;
            margin: 0 auto 50px;
          }
          #priceArea .priceInfo + .flexWrapper {
            margin-top: 120px;
          }
          #priceArea .priceInfo1 {
            max-width: 1160px;
            width: 100%;
            margin: 0 auto;
          }
          #priceArea .priceTable {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 40px;
            margin: 0 0 60px;
            position: relative;
          }
          #priceArea .priceTable::after {
            content: "";
            display: inline-block;
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            margin: auto;
            width: 0;
            height: 0;
            border-style: solid;
            border-top: 27px solid transparent;
            border-bottom: 27px solid transparent;
            border-left: 20px solid var(--main-color)!important;
            border-right: 0;
          }
          #priceArea .priceTable .priceBox {
            max-width: 360px;
            width: 100%;
            background: #C3000F;
          }
          #priceArea .priceTable .tit {
            background: #E60012;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            min-height: 60px;
            font-size: 22px;
            line-height: 1.3;
            font-weight: 500;
            text-align: center;
          }
          #priceArea .priceTable .fee {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 14px;
            line-height: 1.3;
            font-weight: bold;
            min-height: 90px;
            margin: 0 20px;
            padding: 0 16px;
          }
          #priceArea .priceTable .viewingFee:not(:last-child) {
            border-bottom: 1px solid #fff;
          }
          #priceArea .priceTable .fee .flag {
            color: #E60012;
            background: #fff;
            font-size: 16px;
            line-height: 1.3;
            font-weight: bold;
            padding: 5px 8px 4px 8px;
          }
          #priceArea .priceTable .fontLearge {
            font-size: 52px;
            line-height: 1.3;
          }
          #priceArea .priceTable .fontMedium {
            font-size: 22px;
            line-height: 1.3;
            font-weight: bold;
          }
          #priceArea .priceTable .text {
            font-size: 22px;
            line-height: 1.5;
            font-weight: bold;
          }


          #priceArea .chFee {
            margin-bottom: 60px;
          }
          #priceArea .chFee .tit {
            font-size: 26px;
            line-height: 1.3;
            font-weight: 500;
            text-align: center;
            margin: 0 0 19px;
          }
          #priceArea .chFee2 .tit img {
            width: auto;
            height: 37px;
            margin-right: 12px;
          }
          #priceArea .chFee .viewingFee {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 30px;
          }
          #priceArea .chFee .viewingFee .flag {
            font-size: 32px;
            line-height: initial;
            font-weight: bold;
            display: flex;
            justify-content: center;
            align-items: center;
            max-width: 380px;
            width: 100%;
            min-height: 80px;
            border-radius: 6px;
            text-align: center;
            padding: 17px 30px;
            word-break: break-all;
          }
          #priceArea .chFee2 .viewingFee .flag {
            background: #0099FF;
            color: #fff;
          }
          #priceArea .chFee .viewingFee .price {
            font-size: 30px;
            line-height: 1.3;
            font-weight: bold;
          }
          #priceArea .chFee .viewingFee .price .fontLearge {
            font-size: 66px;
            line-height: 1.3;
            font-weight: bold;
          }
          #priceArea .chFee2 .viewingFee .price .fontLearge {
            color: #0099FF;
          }
          #priceArea .chFee .viewingFee .price .fontSmall {
            font-size: 22px;
            line-height: 1.3;
            font-weight: bold;
          }
          #priceArea .chFee .annotation {
            font-size: 20px;
            line-height: 2.2;
            text-align: center;
            margin-top: 12px;
          }
          #priceArea .chFee .mustReadbox {
            margin: 12px auto 0;
            display: none;
          }
          #priceArea .flexWrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 40px;
          }
          #priceArea .flexWrapper .c-btn a {
            min-width: 360px;
            min-height: 85px;
            font-size: 18px;
            line-height: 1.5;
          }

          #priceArea .priceInfo2 .img {
            margin: 0 0 50px;
            text-align: center;
          }


          #priceArea .mustReadbox {
            box-sizing: border-box;
            border: 2px solid #D3D3D3;
            background: #fff;
            color: #222222;
            margin: 0 auto 60px;
            max-width: 760px;
            width: 100%;
          }
          #priceArea .mustReadbox dl {
            margin: 0;
          }
          #priceArea .mustReadbox dl dt {
            position: relative;
            padding: 15px 70px 15px 65px;
            font-size: 22px;
            font-weight: 500;
            cursor: pointer;
          }
          #priceArea .mustReadbox dl dt::before {
            content: "";
            width: 26px;
            height: 26px;
            position: absolute;
            top: 50%;
            left: 42px;
            -webkit-transform: translate(-50%, -50%);
            -ms-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
            background: url(/program/st/promo/generator_common/img/payment_icon01.png) no-repeat center center;
            background-size: cover;
          }
          #priceArea .mustReadbox dl dt::after {
            content: "";
            width: 24px;
            height: 24px;
            background: #0099ff;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            right: 20px;
            -webkit-transform: translate(-50%, -50%);
            -ms-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
          }
          #priceArea .mustReadbox dl dt > span::before {
            content: "";
            width: 13px;
            height: 2px;
            background: #ffffff;
            position: absolute;
            top: 50%;
            right: 31px;
            -webkit-transform: translate(-50%, -50%);
            -ms-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
            z-index: 1;
          }
          #priceArea .mustReadbox dl dt > span::after {
            content: "";
            width: 13px;
            height: 2px;
            background: #ffffff;
            position: absolute;
            top: 50%;
            right: 31px;
            -webkit-transform: translate(-50%, -50%) rotate(-90deg);
            -ms-transform: translate(-50%, -50%) rotate(-90deg);
            transform: translate(-50%, -50%) rotate(-90deg);
            transition: all .5s;
            z-index: 1;
          }
          #priceArea .mustReadbox dl dt.is-open > span::after {
            -webkit-transform: translate(-50%, -50%) rotate(0deg);
            -ms-transform: translate(-50%, -50%) rotate(0deg);
            transform: translate(-50%, -50%) rotate(0deg);
          }
          #priceArea .mustReadbox dl dd {
            display: none;
            padding: 0;
            color: #888;
            font-size: 14px;
            line-height: 1.57;
            border-top: 1px solid #0099ff;
          }
          #priceArea .mustReadbox dl dd.is-open{
            display: block;
          }
          #priceArea .mustReadbox dl dd .cautionTable {
            width: 100%;
            border-spacing: 0px;
            margin: 0 auto;
          }
          #priceArea .mustReadbox dl dd .cautionTable th {
            background-color: #09f;
            border-right: 1px solid #ccc;
            border-bottom: 1px solid #ccc;
            color: #fff;
            padding: 20px 5px;
            width: 25%;
          }
          #priceArea .mustReadbox dl dd .cautionTable td {
            padding: 10px;
            border-bottom: 1px solid #ccc;
          }
          #priceArea .mustReadbox dl dd .cautionTable td .icon_type_01, #priceArea .mustReadbox dl dd .cautionTable td .icon_type_02 {
            margin: 5px 0 0;
            padding: 0 0 0 1rem;
            font-size: 14px;
            color: #888;
            line-height: 1.57;
          }
          #priceArea .mustReadbox dl dd .cautionTable td .icon_type_01::before {
            content: "※";
            margin-left: -1rem;
          }
          #priceArea .mustReadbox dl dd .cautionTable tr:last-child th,
          #priceArea .mustReadbox dl dd .cautionTable tr:last-child td {
            border-bottom: none;
          }
        }


        @media (max-width: 768px) {
          #priceArea {
            background: #1B1B1B;
            padding: 24vw 0;
          }
          #priceArea .subTitle {
            background: #C3000F;
            display: block;
            width: 100%;
            min-height: 29.46vw;
            font-size: 5.33vw;
            line-height: 1.5;
            font-weight: bold;
            padding: 4.53vw 5.33vw 5.2vw;
            margin: 0 0 9.33vw;
            text-align: center;
          }
          #priceArea .subTitle span.textLarge {
            font-size: 8vw;
            line-height: 1.1;
          }
          #priceArea .subTitle span.price {
            font-family: 'Roboto', sans-serif;
            font-size: 14.93vw;
            line-height: 1.3;
            font-weight: 500;
          }
          #priceArea .priceInfo2 .subTitle {
            width: 89.33vw;
            margin: 0 auto 8vw;
          }
          #priceArea .priceInfo1 {
            padding: 0 5.33vw;
          }
          #priceArea .priceInfo:not(:last-child) {
            padding-bottom: 9.33vw;
          }
          #priceArea .priceTable {
            display: flex;
            flex-direction: column;
            gap: 12.8vw;
            margin: 0 0 13.33vw;
            position: relative;
          }
          #priceArea .priceTable::after {
            content: "";
            display: inline-block;
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            left: 0;
            transform: rotate(90deg);
            margin: auto;
            width: 0;
            height: 0;
            border-style: solid;
            border-top: 7.19vw solid transparent;
            border-bottom: 7.19vw solid transparent;
            border-left: 5.33vw solid var(--main-color)!important;
            border-right: 0;
          }
          #priceArea .priceTable .priceBox {
            width: 100%;
            background: #C3000F;
          }
          #priceArea .priceTable .tit {
            background: #E60012;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 13.33vw;
            font-size: 4.8vw;
            font-weight: 500;
            line-height: 1.8;
            text-align: center;
          }
          #priceArea .priceTable .fee {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 3.46vw;
            line-height: 1.3;
            font-weight: bold;
            min-height: 21.86vw;
            margin: 0 6.13vw;
            padding: 0 4.6vw;
          }
          #priceArea .priceTable .viewingFee {
            border-bottom: 0.26vw solid #fff;
          }
          #priceArea .priceTable .fee .flag {
            color: #E60012;
            background: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-width: 15.46vw;
            height: 6.93vw;
            font-size: 3.73vw;
            line-height: 1.3;
            font-weight: bold;
          }
          #priceArea .priceTable .fontLearge {
            font-size: 13.33vw;
            line-height: 1.3;
          }
          #priceArea .priceTable .fontMedium {
            font-size: 6.93vw;
            line-height: 1.3;
            font-weight: bold;
          }
          #priceArea .priceTable .text {
            font-size: 4.8vw;
            line-height: 1.5;
            font-weight: bold;
          }

          #priceArea .chFee {
            margin-bottom: 13.33vw;
          }
          #priceArea .chFee .tit {
            font-size: 4.8vw;
            line-height: 1.8;
            font-weight: bold;
            text-align: center;
            margin: 0 0 5.33vw;
          }
          #priceArea .chFee2 .tit img {
            width: auto;
            height:  9.46vw;
            margin-right: 1.33vw;
          }
          #priceArea .chFee .viewingFee {
            display: flex;
            flex-direction: column;
            gap: 1.33vw;
            text-align: center;
          }
          #priceArea .chFee .viewingFee .flag {
            font-size: 5.33vw;
            line-height: initial;
            font-weight: bold;
            width: 100%;
            padding: 2.66vw 1.39vw;
            border-radius: 1.6vw;
            text-align: center;
            margin: 0 auto;
            word-break: break-all;
          }
          #priceArea .chFee2 .viewingFee .flag {
            background: #0099FF;
            color: #fff;
          }
          #priceArea .chFee .viewingFee .price {
            font-size: 5.33vw;
            line-height: 1.3;
            font-weight: bold;
          }
          #priceArea .chFee .viewingFee .price .fontLearge {
            font-size: 13.33vw;
            line-height: 1.3;
            font-weight: bold;
          }
          #priceArea .chFee2 .viewingFee .price .fontLearge {
            color: #0099FF;
          }
          #priceArea .chFee .viewingFee .price .fontSmall {
            font-size: 3.46vw;
            line-height: 1.3;
            font-weight: bold;
          }
          #priceArea .chFee .annotation {
            font-size: 4vw;
            line-height: 1.5;
            text-align: center;
            margin-top: 2.66vw;
          }
          #priceArea .chFee .mustReadbox {
            width: 100%;
            margin: 2.66vw auto 0;
            display: none;
          }
          #priceArea .flexWrapper {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 8vw;
          }
          #priceArea .priceInfo2 .flexWrapper {
            padding: 0 5.33vw;
          }
          #priceArea .flexWrapper .c-btn {
            width: 100%;
          }
          #priceArea .flexWrapper .c-btn a {
            max-width: none;
            width: 100%;
            font-size: 4.26vw;
            line-height: 1.5;
            margin: 0 auto;
          }
          #priceArea .priceInfo1 .flexWrapper .c-btn a {
            height: 21.33vw;
            border: 0.53vw solid;
          }
          #priceArea .priceInfo2 .flexWrapper .c-btn a {
            height: 16vw;
          }
          .fw .flexWrapper .c-btn--blueline a:after, .fw .flexWrapper .c-btn--blueline button:after {
            background: url(/global/assets/images/icon/icon_arrow-a_blue.svg) no-repeat center center;
            background-size: 100% auto;
            width: 5.33vw;
            height: 5.33vw;
            right: 4vw;
          }

          #priceArea .priceInfo2 .img {
            display: flex;
            justify-content: center;
            margin: 0 0 9.33vw;
          }
          #priceArea .priceInfo2 .img img {
            width: 96vw;
            margin: 0 auto;
          }
          #priceArea .mustReadbox {
            background: #fff;
            color: #222222;
            box-sizing: border-box;
            border: 0.53vw solid #D3D3D3;
            margin: 0 5.33vw 13.33vw;
          }
          #priceArea .mustReadbox dl {
            margin: 0;
          }
          #priceArea .mustReadbox dl dt {
            position: relative;
            padding: 2.5vw 11.5vw 2.5vw 9vw;
            font-size: 3.7vw;
            font-weight: 500;
            cursor: pointer;
            text-align: center;
          }
          #priceArea .mustReadbox dl dt::before {
            content: "";
            width: 6.66vw;
            height: 6.66vw;
            position: absolute;
            top: 50%;
            left: 5.92vw;
            -webkit-transform: translate(-50%, -50%);
            -ms-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
            background: url(/program/st/promo/generator_common/img/payment_icon01.png) no-repeat center center;
            background-size: contain;
          }
          #priceArea .mustReadbox dl dt::after {
            content: "";
            width: 7.19vw;
            height: 7.19vw;
            background: #0099ff;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            right: 0vw;
            -webkit-transform: translate(-50%, -50%);
            -ms-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
          }
          #priceArea .mustReadbox dl dt > span::before {
            content: "";
            width: 4vw;
            height: 0.53vw;
            background: #ffffff;
            position: absolute;
            top: 50%;
            right: 3.13vw;
            -webkit-transform: translate(-50%, -50%);
            -ms-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
            z-index: 1;
          }
          #priceArea .mustReadbox dl dt > span::after {
            content: "";
            width: 4vw;
            height: 0.53vw;
            background: #ffffff;
            position: absolute;
            top: 50%;
            right: 3.13vw;
            -webkit-transform: translate(-50%, -50%) rotate(-90deg);
            -ms-transform: translate(-50%, -50%) rotate(-90deg);
            transform: translate(-50%, -50%) rotate(-90deg);
            transition: all .5s;
            z-index: 1;
          }
          #priceArea .mustReadbox dl dt.is-open > span::after {
            -webkit-transform: translate(-50%, -50%) rotate(0deg);
            -ms-transform: translate(-50%, -50%) rotate(0deg);
            transform: translate(-50%, -50%) rotate(0deg);
          }
          #priceArea .mustReadbox dl dd {
            display: none;
            padding: 0;
            color: #888;
            font-size: 3.4vw;
            line-height: 1.57;
            border-top: 1px solid #0099ff;
          }
          #priceArea .mustReadbox dl dd .cautionTable {
            border: none;
            width: 100%;
            border-spacing: 0px;
            margin: 0 auto;
          }
          #priceArea .mustReadbox dl dd .cautionTable th {
            background-color: #09f;
            border-right: 1px solid #ccc;
            border-bottom: 1px solid #ccc;
            color: #fff;
            padding: 3vw 1vw;
            width: 25%;
          }
          #priceArea .mustReadbox dl dd .cautionTable td {
            font-size: 3vw;
            padding: 1.4vw;
            border-bottom: 1px solid #ccc;
          }
          #priceArea .mustReadbox dl dd .cautionTable td .icon_type_01, #priceArea .mustReadbox dl dd .cautionTable td .icon_type_02 {
            margin: 0.8vw 0 0;
            padding: 0 0 0 1rem;
            color: #888;
            line-height: 1.57;
          }
          #priceArea .mustReadbox dl dd .cautionTable td .icon_type_01::before {
            content: "※";
            margin-left: -1rem;
          }
          #priceArea .mustReadbox dl dd .cautionTable tr:last-child th,
          #priceArea .mustReadbox dl dd .cautionTable tr:last-child td {
            border-bottom: none;
          }
        }
        `}
      </style>
    </section>
  );
};

export default PricingComponent;