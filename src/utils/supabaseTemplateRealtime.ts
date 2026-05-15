/**
 * @deprecated Free プラン向けに dynamicTemplateSync（ポーリング）へ移行しました。
 */
export {
  subscribeDynamicTemplateSync as subscribeComponentTemplateByUniqueId,
  fetchAndApplyTemplateByUniqueId,
  refreshDynamicTemplateNow,
} from './dynamicTemplateSync';
