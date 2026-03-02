
"use client"

import confetti from 'canvas-confetti';

/**
 * Dispara confetes na tela.
 * Inclui verificação de window para evitar erros em ambientes de SSR.
 */
export const dispararConfete = () => {
  if (typeof window !== 'undefined') {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f3a8b9', '#6ca0cf', '#ffffff']
    });
  }
};
