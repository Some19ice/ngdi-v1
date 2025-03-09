import Image from "next/image"

export function Banner() {
  return (
    <div className="w-full bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center py-2">
          <Image
            src="/images/logo.png"
            alt="NGDI Portal Logo"
            width={800}
            height={50}
            className="h-auto w-auto"
            priority
          />
        </div>
      </div>
    </div>
  )
}
