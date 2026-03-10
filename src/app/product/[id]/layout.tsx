 import { PRODUCTS } from '@/lib/data'
 
 export default function ProductLayout({ children }: { children: React.ReactNode }) {
   return children
 }
 
 export function generateStaticParams() {
   return PRODUCTS.map(p => ({ id: p.id }))
 }
