"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import slide1 from "@/imagens/SLIDE (1).png"
import slide2 from "@/imagens/SLIDE (2).png"
import slide3 from "@/imagens/SLIDE (3).png"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel"

export function HeroSlider() {
  const slides = [slide1, slide2, slide3]
  const [api, setApi] = useState<CarouselApi | null>(null)

  useEffect(() => {
    if (!api) return
    const id = setInterval(() => {
      api.scrollNext()
    }, 6000)
    return () => clearInterval(id)
  }, [api])

  return (
    <section className="bg-[#FDF8FB] -mt-12 md:mt-0">
      <div className="relative w-full h-[52vh] md:h-[100dvh]">
        <Carousel opts={{ align: "start", loop: true }} setApi={setApi} className="w-full h-full">
          <CarouselContent className="h-full">
            {slides.map((src, i) => (
              <CarouselItem key={i} className="basis-full h-full">
                <div className="relative w-full h-full overflow-hidden">
                  <Image
                    src={src}
                    alt={`Slide ${i + 1}`}
                    fill
                    className="object-contain object-center md:object-cover md:object-center"
                    quality={70}
                    priority={i === 0}
                    sizes="100vw"
                  />
                </div>
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
