import React from 'react';
import AstraFluxLogo from './AstraFluxLogo';

/**
 * 历史组件别名映射 -> 统一重定向至 AstraFluxLogo
 * 彻底替换旧版莫比乌斯环，保障品牌独立与零侵权
 */
export default function SparkLinkLogo(props) {
  return <AstraFluxLogo {...props} />;
}
