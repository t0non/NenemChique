"use client"

import dynamic from 'next/dynamic';

// Lazy load: componentes que só são necessários após interação do usuário
// FloatingCartButton: botão flutuante do carrinho
// ClientLeadWrapper: popup de lead capture
const FloatingCartButton = dynamic(
  () => import('@/components/floating-cart-button').then(m => m.FloatingCartButton),
  { ssr: false }
);

const ClientLeadWrapper = dynamic(
  () => import('@/components/client-lead-wrapper').then(m => m.ClientLeadWrapper),
  { ssr: false }
);

export function LazyClientComponents() {
  return (
    <>
      <ClientLeadWrapper />
      <FloatingCartButton />
    </>
  );
}
