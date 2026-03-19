"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WhatsAppIcon } from "@/components/whatsapp-icon"
import { WHATSAPP_URL } from "@/lib/whatsapp"

export function FAQ() {
  const wa = WHATSAPP_URL
  return (
    <section id="faq" className="py-10 bg-white border-t border-primary/5">
      <div className="container-standard">
        <div className="max-w-2xl mx-auto mb-6 text-center">
          <Badge className="bg-primary/10 text-primary border-none mb-2 px-4 py-1">Perguntas Frequentes</Badge>
          <h2 className="text-2xl md:text-4xl font-light mb-1">Tudo o que você precisa saber</h2>
          <p className="text-muted-foreground font-light text-sm italic">Respostas rápidas para decidir com confiança.</p>
        </div>
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-primary/10 shadow-sm p-2 md:p-4">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-base font-medium">Os tecidos são hipoalergênicos e macios?</AccordionTrigger>
              <AccordionContent>
                Sim. Selecionamos algodões premium e tricot com toque delicado, pensados para a pele sensível do recém‑nascido. Sem aspereza e com acabamento cuidadoso.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-base font-medium">Qual o prazo de entrega?</AccordionTrigger>
              <AccordionContent>
                Envio em até 24h úteis. O prazo total aparece no checkout conforme seu CEP. Em BH e região, oferecemos retirada rápida em loja.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger className="text-base font-medium">Posso trocar se não servir?</AccordionTrigger>
              <AccordionContent>
                Claro. Você tem 30 dias para troca. Basta manter a peça sem uso, com etiqueta, e falar com a equipe no WhatsApp para agendar.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger className="text-base font-medium">Como escolho o tamanho ideal?</AccordionTrigger>
              <AccordionContent>
                Indicamos RN para a mala da maternidade e P/M para o primeiro mês. Em dúvida entre dois tamanhos, escolha o maior para durar mais.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger className="text-base font-medium">Tem desconto na primeira compra?</AccordionTrigger>
              <AccordionContent>
                Sim. Liberamos 10% para a primeira compra. Toque no topo para pegar o cupom e aplique no carrinho antes de finalizar.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger className="text-base font-medium">É seguro pagar no site?</AccordionTrigger>
              <AccordionContent>
                Sim. Utilizamos parceiros de pagamento certificados e antifraude. Seus dados são protegidos e você recebe confirmação por e‑mail/WhatsApp.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionTrigger className="text-base font-medium">As peças esquentam demais?</AccordionTrigger>
              <AccordionContent>
                Não. Nossos tricots e algodões têm respirabilidade e conforto térmico para evitar superaquecimento, mantendo o bebê aconchegado.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-8">
              <AccordionTrigger className="text-base font-medium">Como cuidar e lavar?</AccordionTrigger>
              <AccordionContent>
                Lave à mão ou no ciclo delicado, água fria, sabão neutro e seque à sombra. Isso preserva maciez, cor e forma por muito mais tempo.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-9">
              <AccordionTrigger className="text-base font-medium">Posso presentear com embalagem especial?</AccordionTrigger>
              <AccordionContent>
                Sim. Temos opção de embalagem para presente e cartão com mensagem. É só pedir pelo WhatsApp após a compra.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-10">
              <AccordionTrigger className="text-base font-medium">Como montar o enxoval completo sem erro?</AccordionTrigger>
              <AccordionContent>
                Nossas especialistas montam uma lista personalizada para sua realidade e clima. Fale agora e receba a curadoria pelo WhatsApp.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <div className="mt-6 flex justify-center">
            <Button asChild size="lg" className="bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full h-12 px-8 font-black text-xs tracking-widest">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                <WhatsAppIcon className="w-4 h-4 fill-white" />
                Tirar dúvida agora
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
