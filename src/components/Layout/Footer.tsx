import React from 'react';
import { usePageStore } from '../../store/usePageStore';

const Footer: React.FC = () => {
  const { pageData } = usePageStore();

  // ページタイトルを取得（サフィックスを削除）
  const getPageTitle = () => {
    if (pageData?.globalSettings?.title) {
      const titleWithoutSuffix = pageData.globalSettings.title.replace(/｜スカパー！:.*$/, '').trim();
      return titleWithoutSuffix || 'タイトルを挿入';
    }
    return 'タイトルを挿入';
  };

  const pageTitle = getPageTitle();

  return (
    <footer id="footer">
      <div className="c-breadcrumb">
          <div className="c-breadcrumb__logo"><a href="/"><img src="https://www.skyperfectv.co.jp/global/assets/images/logo/logo_white.svg" alt="スカパー！"/></a></div>
          <ul className="c-breadcrumb-list">
          <li><a href="/program/">番組を探す</a></li>
          <li><a href="/program/special/">特集ページ</a></li>
          <li><span>{pageTitle}</span></li>
      </ul>
      </div>
      <script src="/global/assets/js/global.js"></script>
      <script src="/global/assets/js/jquery.min.js"></script>
    </footer>
  );
};
export default Footer;