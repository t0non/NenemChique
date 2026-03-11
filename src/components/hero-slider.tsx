"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import Link from "next/link"
import slide1 from "@/imagens/SLIDE (1).png"
import slide2 from "@/imagens/SLIDE (2).png"
import slide3 from "@/imagens/SLIDE (3).png"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"

export function HeroSlider() {
  const slides = [
    { src: slide1, href: "/catalog?category=saida-maternidade", alt: "Saídas de Maternidade" },
    { src: slide2, href: "/catalog?category=macacoes", alt: "Macacões" },
    { src: slide3, href: "/catalog?category=kits", alt: "Kits Enxoval" },
  ]
  const [api, setApi] = useState<CarouselApi | null>(null)

  useEffect(() => {
    if (!api) return
    const id = setInterval(() => {
      api.scrollNext()
    }, 6000)
    return () => clearInterval(id)
  }, [api])

  return (
    <section className="mt-0 overflow-hidden">
      <div className="relative w-full h-[72vh] md:h-screen bg-[#FDF8FB]">
        <Carousel opts={{ align: "start", loop: true }} setApi={setApi} className="w-full h-full">
          <CarouselContent className="h-full ml-0">
            {slides.map((s, i) => (
              <CarouselItem key={i} className="basis-full h-full pl-0">
                <Link href={s.href} prefetch={false} className="relative w-full h-full block overflow-hidden bg-[#FDF8FB]" aria-label={s.alt}>
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    className="object-contain object-top md:object-cover md:object-center"
                    quality={70}
                    priority={i === 0}
                    loading={i === 0 ? undefined : "lazy"}
                    sizes="100vw"
                  />
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:inline-flex bg-white text-primary border-primary/20 hover:bg-primary hover:text-white shadow-md" />
          <CarouselNext className="hidden md:inline-flex bg-white text-primary border-primary/20 hover:bg-primary hover:text-white shadow-md" />
        </Carousel>
      </div>
    </section>
  )
}
