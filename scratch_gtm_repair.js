const fs = require('fs');

// 1. REPARAR product-client.tsx
const clientPath = 'c:\\Users\\Eduardo Tonon\\Desktop\\NenemChique-main\\src\\components\\product-client.tsx';
let clientContent = fs.readFileSync(clientPath, 'utf8');

const targetClientBuy = `className="flex items-center justify-center gap-3 w-full h-14 rounded-full font-bold bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/30 transition-all duration-200"`;
const replacementClientBuy = `className="flex items-center justify-center gap-3 w-full h-14 rounded-full font-bold bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-sm uppercase tracking-widest shadow-xl shadow-emerald-500/30 transition-all duration-200 track-btn-whatsapp" data-gtm="whatsapp"`;

const targetClientDoubt = `className="flex items-center justify-center gap-2 w-full h-10 rounded-full font-medium border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[11px] uppercase tracking-widest transition-colors"`;
const replacementClientDoubt = `className="flex items-center justify-center gap-2 w-full h-10 rounded-full font-medium border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-[11px] uppercase tracking-widest transition-colors track-btn-whatsapp" data-gtm="whatsapp"`;

if (clientContent.includes(targetClientBuy)) {
  clientContent = clientContent.replace(targetClientBuy, replacementClientBuy);
  console.log('SUCCESS: product-client.tsx buy button tracked!');
}
if (clientContent.includes(targetClientDoubt)) {
  clientContent = clientContent.replace(targetClientDoubt, replacementClientDoubt);
  console.log('SUCCESS: product-client.tsx doubt button tracked!');
}
fs.writeFileSync(clientPath, clientContent, 'utf8');

// 2. REPARAR product-card.tsx
const cardPath = 'c:\\Users\\Eduardo Tonon\\Desktop\\NenemChique-main\\src\\components\\product-card.tsx';
let cardContent = fs.readFileSync(cardPath, 'utf8');

const targetCardVariant = `className="w-full h-12 rounded-full font-bold bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-500/30 transition-all duration-200 flex items-center justify-center gap-2"`;
const replacementCardVariant = `className="w-full h-12 rounded-full font-bold bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-500/30 transition-all duration-200 flex items-center justify-center gap-2 track-btn-whatsapp" data-gtm="whatsapp"`;

if (cardContent.includes(targetCardVariant)) {
  cardContent = cardContent.replace(targetCardVariant, replacementCardVariant);
  console.log('SUCCESS: product-card.tsx variant modal buy button tracked!');
}
fs.writeFileSync(cardPath, cardContent, 'utf8');

console.log('ALL TRACKING SCRIPTS COMPLETE!');
