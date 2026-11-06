/**
 * Qalereya və Karusel Konfiqurasiyası
 */

export const GALLERY_CONFIG = {
  // Karuseldə növbəti şəkilə avtomatik keçid vaxtı (millisaniyə)
  AUTO_ADVANCE_MS: 1000,

  // İstifadəçi toxunuşundan sonra avtomatik keçidin bərpa olunma vaxtı (millisaniyə)
  RESUME_DELAY_MS: 3000,

  // Karuselin əsas hündürlüyü
  CAROUSEL_HEIGHT: 310,

  // Miniatür önizləmələrin hündürlüyü
  THUMBNAIL_HEIGHT: 64,
} as const;

export const AUTO_ADVANCE_MS = GALLERY_CONFIG.AUTO_ADVANCE_MS;
export const RESUME_DELAY_MS = GALLERY_CONFIG.RESUME_DELAY_MS;

