export const WHATSAPP_NUMBER = "5531996244487";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

/**
 * Gera uma mensagem pré-formatada para WhatsApp com os detalhes do produto.
 * Reduz a fricção na venda consultiva: o vendedor recebe um lead qualificado e pronto para fechar.
 */
export function buildWhatsAppMessage({
  productName,
  size,
  color,
  price,
  mode = 'buy',
}: {
  productName: string;
  size?: string | null;
  color?: string | null;
  price?: string | null;
  mode?: 'buy' | 'doubt';
}): string {
  if (mode === 'doubt') {
    return `Olá! Tenho uma dúvida sobre: *${productName}*`;
  }
  const lines = [
    `Olá! Quero comprar:`,
    `🛍️ *${productName}*`,
    size ? `📏 Tamanho: ${size}` : null,
    color ? `🎨 Cor: ${color}` : null,
    price ? `💰 Preço visto no site: R$ ${price}` : null,
    ``,
    `Pode me ajudar com a compra?`,
  ].filter((l) => l !== null);
  return lines.join('\n');
}

export function buildWhatsAppUrl(params: Parameters<typeof buildWhatsAppMessage>[0]): string {
  return `${WHATSAPP_URL}?text=${encodeURIComponent(buildWhatsAppMessage(params))}`;
}

