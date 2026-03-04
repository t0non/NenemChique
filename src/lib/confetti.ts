
"use client"

/**
 * Dispara confetes na tela.
 * Inclui verificação de window para evitar erros em ambientes de SSR.
 */
export const dispararConfete = async () => {
  if (typeof window === 'undefined') return;
  try {
    const { default: confetti } = await import('canvas-confetti');
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f3a8b9', '#6ca0cf', '#ffffff'],
      disableForReducedMotion: true,
    });
  } catch {
    // falhar silenciosamente em dev
  }
};
