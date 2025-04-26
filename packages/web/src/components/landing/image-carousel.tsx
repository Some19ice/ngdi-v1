"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageCarouselProps {
  images: {
    src: string
    alt: string
    caption?: string
  }[]
  interval?: number
}

export function ImageCarousel({ images, interval = 5000 }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  // Auto-advance the carousel
  useEffect(() => {
    if (images.length <= 1) return

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        // Skip failed images
        let nextIndex = (prevIndex + 1) % images.length
        let attempts = 0

        while (
          failedImages.has(images[nextIndex].src) &&
          attempts < images.length
        ) {
          nextIndex = (nextIndex + 1) % images.length
          attempts++
        }

        return nextIndex
      })
    }, interval)

    return () => clearInterval(timer)
  }, [images, images.length, interval, failedImages])

  const goToNext = () => {
    let nextIndex = (currentIndex + 1) % images.length
    let attempts = 0

    while (
      failedImages.has(images[nextIndex].src) &&
      attempts < images.length
    ) {
      nextIndex = (nextIndex + 1) % images.length
      attempts++
    }

    setCurrentIndex(nextIndex)
  }

  const goToPrevious = () => {
    let prevIndex = (currentIndex - 1 + images.length) % images.length
    let attempts = 0

    while (
      failedImages.has(images[prevIndex].src) &&
      attempts < images.length
    ) {
      prevIndex = (prevIndex - 1 + images.length) % images.length
      attempts++
    }

    setCurrentIndex(prevIndex)
  }

  const handleImageLoad = (src: string) => {
    setLoadedImages((prev) => {
      const newSet = new Set(prev)
      newSet.add(src)
      return newSet
    })
  }

  const handleImageError = (src: string) => {
    setFailedImages((prev) => {
      const newSet = new Set(prev)
      newSet.add(src)
      return newSet
    })
  }

  // Filter out failed images
  const validImages = images.filter((img) => !failedImages.has(img.src))

  if (validImages.length === 0) {
    return null
  }

  return (
    <div className="relative h-[450px] w-full max-w-lg overflow-hidden rounded-lg shadow-2xl">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40 backdrop-blur-sm"></div>

      {validImages.map((image, index) => (
        <div
          key={image.src}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index === 0}
            onLoad={() => handleImageLoad(image.src)}
            onError={() => handleImageError(image.src)}
            quality={85}
          />
        </div>
      ))}

      {/* Navigation arrows */}
      {validImages.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-primary/40 text-white backdrop-blur-sm hover:bg-primary/60"
            onClick={goToPrevious}
            aria-label="Previous image"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 z-10 h-8 w-8 -translate-y-1/2 rounded-full bg-primary/40 text-white backdrop-blur-sm hover:bg-primary/60"
            onClick={goToNext}
            aria-label="Next image"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </>
      )}

      {/* Caption */}
      {validImages[currentIndex]?.caption && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 to-transparent p-6 text-white">
          <p className="font-medium text-center">
            {validImages[currentIndex].caption}
          </p>
        </div>
      )}

      {/* Indicators */}
      {validImages.length > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 pb-2">
          {validImages.map((_, index) => (
            <button
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex
                  ? "w-6 bg-white"
                  : "w-1.5 bg-white/60 hover:bg-white/80"
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
