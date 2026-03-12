 "use client"
 
 import dynamic from "next/dynamic"
 
 const LeadCapturePopup = dynamic(() => import("@/components/lead-capture-popup").then(m => m.LeadCapturePopup), {
   ssr: false,
 })
 
 export function ClientLeadWrapper() {
   return <LeadCapturePopup />
 }
