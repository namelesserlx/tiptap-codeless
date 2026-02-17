import COS from 'cos-js-sdk-v5';

/** 从环境变量读取，部署到 GitHub Pages 时通过 GitHub Actions Secrets 注入 */
const SECRET_ID = import.meta.env.VITE_COS_SECRET_ID ?? '';
const SECRET_KEY = import.meta.env.VITE_COS_SECRET_KEY ?? '';
const BUCKET = import.meta.env.VITE_COS_BUCKET ?? '';
const REGION = import.meta.env.VITE_COS_REGION ?? '';
const CUSTOM_DOMAIN = import.meta.env.VITE_COS_CUSTOM_DOMAIN ?? '';

export const isCosConfigured = (): boolean => Boolean(SECRET_ID && SECRET_KEY && BUCKET && REGION);

export const cos = isCosConfigured()
    ? new COS({ SecretId: SECRET_ID, SecretKey: SECRET_KEY })
    : (null as unknown as COS);

export const COS_CONFIG = {
    Bucket: BUCKET,
    Region: REGION,
    SliceSize: 1024 * 1024 * 50,
    customDomain: CUSTOM_DOMAIN || undefined,
};
