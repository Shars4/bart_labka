import { cn } from 'cn';
import Image from 'next/image';
import { TennisBall } from '@/components/brand';
import { isBundledImage } from '@/lib/animals';

interface AnimalPhotoProps {
  src: string | null;
  alt: string;
  sizes: string;
  /** Above-the-fold LCP candidate: load eagerly with high fetch priority. */
  priority?: boolean;
  className?: string;
}

/**
 * Bundled photos go through Next.js image optimization. External URLs
 * entered by an admin are shown as-is (`unoptimized`), so any host works
 * without listing it in next.config.
 */
export function AnimalPhoto({
  src,
  alt,
  sizes,
  priority,
  className,
}: AnimalPhotoProps) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={`${alt} (bez fotografie)`}
        className={cn('flex items-center justify-center bg-sky', className)}
      >
        <TennisBall className="size-16 opacity-60" />
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden bg-mist', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        loading={priority ? 'eager' : undefined}
        fetchPriority={priority ? 'high' : undefined}
        unoptimized={!isBundledImage(src)}
        className="object-cover"
      />
    </div>
  );
}
