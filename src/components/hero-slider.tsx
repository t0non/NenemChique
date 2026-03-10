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
    <section className="bg-[#FDF8FB] mt-0">
      <div className="relative w-full h-[70vh] md:h-[90vh]">
        <Carousel opts={{ align: "start", loop: true }} setApi={setApi} className="w-full h-full">
          <CarouselContent className="h-full ml-0">
            {slides.map((s, i) => (
              <CarouselItem key={i} className="basis-full h-full">
                <Link href={s.href} prefetch={false} className="relative w-full h-full block bg-[#FDF8FB]" aria-label={s.alt}>
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    className="object-cover object-top"
                    quality={70}
                    priority={i === 0}
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
