import React from 'react';
import { ComponentData } from '../../../types';
import { useComponentData } from '../../../hooks/useComponentData';
import { useDataPropBinding } from '../../../hooks/useDataPropBinding';

interface AppIntroComponentProps {
  component: ComponentData;
  isEditing?: boolean;
}

const AppIntroComponent: React.FC<AppIntroComponentProps> = ({ component }) => {
  const { props, style, globalStyles } = useComponentData(component);
  const containerRef = useDataPropBinding({ props });

  const { balloonText } = props;
  const {
    backgroundColor,
    textColor,
    headlineColor,
    descriptionColor,
    cardBackgroundColor,
    cardTextColor,
    accentColor
  } = style || {};

  const { mainColor, baseColor, base2Color, accentColor: globalAccentColor } = globalStyles;

  const containerStyle = {
    backgroundColor: backgroundColor || baseColor,
  };

  return (
    <section ref={containerRef} id='streamingArea' style={containerStyle} className="baseColor base-pattern-1">
      <div className='sectionInner'>
        <h3 className="commonColor">スカパー！番組配信とは</h3>
        <p className='text commonColor'>
          スカパー！ご加入のお客さまは、スマホ・タブレット・PCなどでも<br />
          追加料金なしで契約商品をご視聴いただけます。
        </p>
        <p className='annotion commonColor'>※ご契約している商品でも一部視聴できないチャンネル・番組がございます。</p>

        <div className='viewingMethod2'>
          <div className="viewindFlex">
            <div className='viewingItem'>
              <div className='viewingBallon accentColor'>
                {balloonText || 'ブラックリスト'}をマイリスト登録すれば便利！
              </div>
              <div className='innerFlex'>
                <p className='img'>
                  <img
                    src="/program/st/promo/generator_common/img/streamingApp_logo.svg"
                    alt="スカパー！番組配信"
                  />
                </p>
                <p className='text commonColor'>
                  スカパー！番組配信を<br />
                  見るならアプリがおすすめ！
                </p>
              </div>
            </div>
            <div className='viewingItem app'>
              <a href="https://itunes.apple.com/jp/app/id1059697991/" target="_blank" rel="noopener noreferrer">
                <img 
                  src="/program/st/promo/generator_common/img/downloadBtn_appstore.svg" 
                  alt="App Store"
                />
              </a>
              <a href="https://play.google.com/store/apps/details?id=com.yomumiru" target="_blank" rel="noopener noreferrer">
                <img 
                  src="/program/st/promo/generator_common/img/downloadBtn_googleplay.svg" 
                  alt="Google Play"
                />
              </a>
            </div>
          </div>
          
          <ul className='viewingNote'>
            <li>※Androidタブレットは、動作保証外のため正しく動作しない/表示されない場合があります。</li>
          </ul>
          
          <div className='viewingPoint'>
            <p className='viewingPoint_tit'>スカパー！番組アプリなら</p>
            <div className='viewingPoint_flex'>
              <div className='viewingPoint_flexItem'>
                <p className='pointTit'>point1</p>
                <div className='pointText'>
                  <p>
                    番組配信の視聴はもちろん、<br />
                    <span>気になる番組が探しやすい！</span>
                  </p>
                </div>
              </div>
              <div className='viewingPoint_flexItem'>
                <p className='pointTit'>point2</p>
                <div className='pointText'>
                  <p>
                    気になった番組をマイリストに<br />
                    登録すれば、<span>配信・放送前に通知が<br />
                    来るので見逃す心配なし！</span>
                  </p>
                </div>
              </div>
            </div>
            <ul className='viewingNote'>
              <li>※スカパー！番組配信は、WEBブラウザでもご視聴いただけます。</li>
              <li>※dボタン・FireTV・AndroidTV・Net-VISIONでテレビでもご視聴いただけます。（ご利用には、テレビとインターネット回線の接続が必要です。）</li>
            </ul>
          </div>
        </div>

        <h4>基本プランなら、50chのうち37chが番組配信も楽しめる！</h4>

        <p className='img osusumePoint'>
          <picture>
            <source
              media="(max-width: 768px)"
              srcSet="/program/st/promo/generator_common/img/streamingArea_img_sp.png"
            />
            <img
              src="/program/st/promo/generator_common/img/streamingArea_img.png"
              alt="番組配信チャンネル一覧" style={{ width: '100%' }}
            />
          </picture>
        </p>
      </div>

      <style>
        {`
          @media (min-width: 769px) {
            #streamingArea {
              padding: 120px 0;
            }
            #streamingArea .text {
              font-size: 16px;
              line-height: 1.8;
              text-align: center;
            }
            #streamingArea .annotion {
              font-size: 14px;
              line-height: 1;
              margin-top: 24px;
              text-align: center;
              margin: 20px 0 50px;
            }
            #streamingArea h4 {
              font-size: 30px;
              line-height: 1;
              font-weight: 500;
              margin-bottom: 41px;
              text-align: center;
            }

            #streamingArea .viewingMethod2 {
              border: 2px solid #D3D3D3;
              background: #F6F6F6;
              border-radius: 12px;
              padding: 35px 0;
              max-width: 760px;
              width: 100%;
              margin: 0 auto;
            }
            #streamingArea .viewingMethod2 + h4,
            #streamingArea .viewingMethod2 + .img.osusumePoint {
              margin-top: 50px;
            }

            #streamingArea .viewingMethod2 .viewingBallon {
              color: #0099FF;
              font-size: 16px;
              font-weight: 500;
              line-height: normal;
              position: relative;
              background: #fff;
              border: 2px solid #0099FF;
              border-radius: 5px;
              text-align: center;
              padding: 10px;
              margin-bottom: 20px;
              max-width: 360px;
              width: 100%;
            }
            #streamingArea .viewingMethod2 .viewingBallon:after, #streamingArea .viewingMethod2 .viewingBallon:before {
              top: 100%;
              left: 12%;
              border: solid transparent;
              content: "";
              height: 0;
              width: 0;
              position: absolute;
              pointer-events: none;
            }
            #streamingArea .viewingMethod2 .viewingBallon:after {
              border-color: rgba(255, 255, 255, 0);
              border-top-color: #fff;
              border-width: 10px;
              margin-left: -10px;
            }
            #streamingArea .viewingMethod2 .viewingBallon:before {
              border-color: rgba(0, 153, 255, 0);
              border-top-color: #0099FF;
              border-width: 13px;
              margin-left: -13px;
            }

            #streamingArea .viewingMethod2 .viewindFlex {
              display: flex;
              justify-content: center;
              align-items: flex-start;
            }
            #streamingArea .viewingMethod2 .viewindFlex .viewingItem:not(:last-child) {
              margin-right: 40px;
            }
            #streamingArea .viewingMethod2 .viewindFlex .viewingItem.app {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
            }
            #streamingArea .viewingMethod2 .viewindFlex .viewingItem.app a:not(:last-child) {
              margin-bottom: 10px;
            }
            #streamingArea .viewingMethod2 .viewindFlex .innerFlex {
              display: flex;
              justify-content: flex-start;
              align-items: center;
            }
            #streamingArea .viewingMethod2 .viewindFlex .innerFlex .img {
              margin-right: 20px;
            }
            #streamingArea .viewingMethod2 .viewindFlex .innerFlex .text {
              font-size: 18px;
              font-weight: 500;
              line-height: 1.8;
              text-align: left;
              color: #000;
            }
            #streamingArea .viewingMethod2 .viewingNote {
              font-size: 14px;
              font-weight: 400;
              line-height: 1.8;
              max-width: max-content;
              margin: 20px auto 0;
              color: #000;
            }

            #streamingArea .viewingMethod2 .viewingPoint {
              border-top: 3px solid #222;
              padding-top: 30px;
              max-width: 660px;
              width: 100%;
              margin: 30px auto 0;
            }
            #streamingArea .viewingMethod2 .viewingPoint .viewingPoint_tit {
              font-size: 24px;
              font-weight: 500;
              line-height: 1.35;
              text-align: center;
              margin-bottom: 20px;
              color: #000!important;
            }
            #streamingArea .viewingMethod2 .viewingPoint .viewingPoint_flex {
              display: flex;
              justify-content: space-between;
            }
            #streamingArea .viewingMethod2 .viewingPoint .viewingPoint_flex .viewingPoint_flexItem:not(:last-child){
              margin-right: 20px;
            }
            #streamingArea .viewingMethod2 .viewingPoint .viewingPoint_flex .viewingPoint_flexItem {
              background: #fff;
              border-radius: 5px;
              border: 1px solid #D3D3D3;
              padding: 21px 32px 30px;
              width: calc(100%/2 - 10px);
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            #streamingArea .viewingMethod2 .viewingPoint .viewingPoint_flex .viewingPoint_flexItem .pointTit {
              color: #0099FF;
              font-size: 18px;
              font-weight: 500;
              line-height: 1.8;
              text-align: center;
              border-bottom: 1px solid #D3D3D3;
              padding-bottom: 15px;
            }
            #streamingArea .viewingMethod2 .viewingPoint .viewingPoint_flex .viewingPoint_flexItem .pointText{
              flex-grow: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              font-weight: 500;
              line-height: 1.8;
              text-align: center;
              letter-spacing: -0.01rem;
              margin-top: 15px;
              color: #000;
            }
            #streamingArea .viewingMethod2 .viewingPoint .viewingPoint_flex .viewingPoint_flexItem .pointText span{
              color: #0099FF;
            }


            #streamingArea .viewingMethod {
              margin-top: 100px;
            }
            #streamingArea .viewingMethod .tit {
              display: flex;
              width: 100%;
              min-height: 80px;
              justify-content: center;
              align-items: center;
              font-size: 26px;
              line-height: 1.3;
              font-weight: bold;
              background: #C3000F;
              text-align: center;
              margin: 0 0 50px;
            }
            #streamingArea .viewingMethod .flexWrapper {
              display: flex;
              justify-content: center;
              text-align: center;
            }
            #streamingArea .viewingMethod .flexWrapper .box {
              max-width: 384px;
              width: 100%;
              margin: 0 auto;
              box-sizing: initial;
              padding: 0 5px;
            }
            #streamingArea .viewingMethod .flexWrapper .box:not(:last-child) {
              position: relative;
            }
            #streamingArea .viewingMethod .flexWrapper .box:not(:last-child)::after {
              content: "";
              background: #fff;
              width: 3px;
              height: 100%;
              position: absolute;
              right: 0;
              top: 0;
              bottom: 0;
              margin: auto;
            }
            #streamingArea .viewingMethod .flexWrapper .box .img {
              margin-bottom: 32px;
            }
            #streamingArea .viewingMethod .flexWrapper .box .img img {
              max-width: 126px;
              height: auto;
            }
            #streamingArea .viewingMethod .flexWrapper .box .textExplain {
              font-size: 18px;
              line-height: 1.8;
              font-weight: 500;
            }
            #streamingArea .viewingMethod .flexWrapper .box .annotation {
              font-size: 14px;
              line-height: 1;
              margin: 20px 0 0;
            }
            #streamingArea .viewingMethod .streamingInfo {
              text-align: center;
              margin: 40px 0 0;
            }
            #streamingArea .viewingMethod .streamingInfo p.text {
              font-size: 18px;
              line-height: 1.8;
              font-weight: 500;
              margin: 0 0 30px;
            }
            #streamingArea .viewingMethod .streamingInfo .streamingIcon a {
              margin: 0 auto;
            }
          }

          @media (min-width: 769px) and (max-width: 900px){
            #streamingArea .viewingMethod .flexWrapper .box {
              max-width: 42.66vw;
            }
            #streamingArea .viewingMethod .flexWrapper .box:not(:last-child)::after {
              width: 0.33vw;
              height: 100%;
            }
            #streamingArea .viewingMethod .flexWrapper .box .img {
              margin-bottom: 3.55vw;
            }
            #streamingArea .viewingMethod .flexWrapper .box .img img {
              max-width: 14vw;
              height: auto;
            }
            #streamingArea .viewingMethod .flexWrapper .box .textExplain {
              font-size: 2vw;
            }
            #streamingArea .viewingMethod .flexWrapper .box .annotation {
              font-size: 1.55vw;
              margin: 2.22vw 0 0;
            }
          }

          @media (max-width: 768px) {
            #streamingArea {
              padding: 24vw 0;
            }
            #streamingArea .text {
              font-size: 4vw;
              line-height: 1.8;
              text-align: left;
            }
            #streamingArea .annotion {
              font-size: 3.46vw;
              line-height: 1.8;
              text-align: left;
              margin: 4vw 0 9.33vw;
            }
            #streamingArea h4 {
              font-size: 5.33vw;
              line-height: 1.8;
              font-weight: 500;
              margin-top: 9.33vw;
              margin-bottom: 8vw;
              text-align: center;
            }
            #streamingArea .viewingMethod2 + .img.osusumePoint {
              margin-top: 9.33vw;
            }
            #streamingArea .img {
              display: flex;
              justify-content: center;
            }


            #streamingArea .viewingMethod2 .viewingBallon {
              color: #0099FF;
              background: #fff;
              font-size: 4vw;
              font-weight: 500;
              line-height: normal;
              position: relative;
              border: 0.53vw solid #0099FF;
              border-radius: 1.33vw;
              text-align: center;
              padding: 1.73vw;
              margin-bottom: 4.53vw;
            }
            #streamingArea .viewingMethod2 .viewingBallon:after, #streamingArea .viewingMethod2 .viewingBallon:before {
              top: 100%;
              left: 8vw;
              border: solid transparent;
              content: "";
              height: 0;
              width: 0;
              position: absolute;
              pointer-events: none;
            }
            #streamingArea .viewingMethod2 .viewingBallon:after {
              border-color: rgba(255, 255, 255, 0);
              border-top-color: #fff;
              border-width: 2.66vw;
              margin-left: -2.66vw;
            }
            #streamingArea .viewingMethod2 .viewingBallon:before {
              border-color: rgba(0, 153, 255, 0);
              border-top-color: #0099FF;
              border-width: 3.46vw;
              margin-left: -3.46vw;
            }
            #streamingArea .viewingMethod2 {
              border: 0.53vw solid #D3D3D3;
              background: #F6F6F6;
              border-radius: 3.2vw;
              padding: 8vw 4vw;
            }
            #streamingArea .viewingMethod2 .viewindFlex .viewingItem:not(:last-child) {
              margin-bottom: 5.33vw;
            }
            #streamingArea .viewingMethod2 .viewindFlex .viewingItem.app {
              display: flex;
            }
            #streamingArea .viewingMethod2 .viewindFlex .viewingItem.app a:not(:last-child) {
              margin-right: 2.66vw;
            }
            #streamingArea .viewingMethod2 .viewindFlex .innerFlex {
              display: flex;
              justify-content: flex-start;
              align-items: center;
            }
            #streamingArea .viewingMethod2 .viewindFlex .innerFlex .img {
              margin-right: 2.66vw;
              width: 16vw;
              height: auto;
            }
            #streamingArea .viewingMethod2 .viewindFlex .innerFlex .text {
              font-size: 4.8vw;
              font-weight: 500;
              line-height: 1.6;
              text-align: left;
              letter-spacing: -0.01rem;
              color: #000;
            }
            #streamingArea .viewingMethod2 .viewingNote {
              font-size: 3.46vw;
              font-weight: 400;
              line-height: 1.8;
              margin-top: 5.33vw;
              color: #000;
            }
            #streamingArea .viewingItem.app{
              display: flex;
              justify-content: space-between;
            }
            #streamingArea .viewingItem.app a:not(:last-child){
              margin-right: 2.66vw;
            }
            #streamingArea .viewingItem.app a{
              width: calc(100%/2 - 1.33vw);
            }

            #streamingArea .viewingMethod2 .viewingPoint {
              margin-top: 16.53vw;
              position: relative;
            }
            #streamingArea .viewingMethod2 .viewingPoint::before{
              content: "";
              position: absolute;
              top: -8vw;
              left: -4.33vw;
              width: calc(100vw - 10.66vw);
              margin: 0 auto;
              height: 0.53vw;
              background: #222;
            }
            #streamingArea .viewingMethod2 .viewingPoint .viewingPoint_tit {
              font-size: 5.6vw;
              font-weight: 500;
              line-height: 1.35;
              text-align: center;
              margin-bottom: 5.33vw;
              color: #000!important;
            }
            #streamingArea .viewingMethod2 .viewingPoint .viewingPoint_flex .viewingPoint_flexItem:not(:last-child){
              margin-bottom: 3.33vw;
            }
            #streamingArea .viewingMethod2 .viewingPoint .viewingPoint_flex .viewingPoint_flexItem {
              background: #fff;
              border-radius: 1.33vw;
              border: 0.13vw solid #707070;
              padding: 4.66vw 3.33vw 6.66vw;
            }
            #streamingArea .viewingMethod2 .viewingPoint .viewingPoint_flex .viewingPoint_flexItem .pointTit {
              color: #0099FF;
              font-size: 4.8vw;
              text-align: center;
              border-bottom: 0.26vw solid #D3D3D3;
              padding-bottom: 4vw;
            }
            #streamingArea .viewingMethod2 .viewingPoint .viewingPoint_flex .viewingPoint_flexItem .pointText{
              font-size: 4.26vw;
              font-weight: 500;
              line-height: 1.6;
              text-align: center;
              margin-top: 4vw;
              color: #000;
            }
            #streamingArea .viewingMethod2 .viewingPoint .viewingPoint_flex .viewingPoint_flexItem .pointText span{
              color: #0099FF;
            }


            #streamingArea .viewingMethod {
              margin-top: 16vw;
            }
            #streamingArea .viewingMethod .tit {
              font-size: 5.33vw;
              line-height: 1.5;
              font-weight: bold;
              background: #C3000F;
              padding: 4.53vw 0 5.2vw;
              text-align: center;
              margin: 0 0 9.33vw;
            }
            #streamingArea .viewingMethod .flexWrapper {
              display: flex;
              flex-direction: column;
              text-align: center;
            }
            #streamingArea .viewingMethod .flexWrapper .box {
              width: 100%;
              margin: 0 auto;
              box-sizing: initial;
            }
            #streamingArea .viewingMethod .flexWrapper .box:not(:last-child) {
              padding-bottom: 60px;
              margin-bottom: 60px;
              position: relative;
            }
            #streamingArea .viewingMethod .flexWrapper .box:not(:last-child)::after {
              content: "";
              display: inline-block;
              position: absolute;
              bottom: 0;
              right: 0;
              left: 0;
              margin: auto;
              width: 89.33vw;
              height: 0.8vw;
              background: #fff;
            }
            #streamingArea .viewingMethod .flexWrapper .box .flexInner {
              display: flex;
              justify-content: space-between;
              align-items: center;
              gap: 5.33vw;
            }
            #streamingArea .viewingMethod .flexWrapper .box .img img {
              width: 26.66vw;
              height: auto;
            }
            #streamingArea .viewingMethod .flexWrapper .box .textExplain {
              max-width: 57.33vw;
              font-size: 4.8vw;
              line-height: 1.8;
              font-weight: 400;
              text-align: left;
            }
            #streamingArea .viewingMethod .flexWrapper .box .annotation {
              font-size: 3.46vw;
              line-height: 1.7;
              margin: 4vw 0 0;
            }
            #streamingArea .viewingMethod .streamingInfo {
              text-align: center;
              margin: 13.33vw 0 0;
            }
            #streamingArea .viewingMethod .streamingInfo p.text {
              font-size: 4.8vw;
              line-height: 1.8;
              font-weight: 500;
              margin: 0 0 8vw;
            }
            #streamingArea .viewingMethod .streamingInfo .streamingIcon a {
              margin: 0 auto;
            }
          }
        `}
      </style>
    </section>
  );
};

export default AppIntroComponent;