import Image from "next/image";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src="/logo.png"
        alt="Aperture Logo"
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-contain"
        priority
        unoptimized
      />
    </div>
  );
}
