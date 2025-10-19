import { useOptimizedImage } from "@/hooks/useOptimizedImage";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export const OptimizedImage = ({
  src,
  alt,
  className = "",
  placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3C/svg%3E",
}: OptimizedImageProps) => {
  const { imageSrc, isLoaded, imgRef } = useOptimizedImage({ src, placeholder });

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`${className} transition-opacity duration-300 ${
        isLoaded ? "opacity-100" : "opacity-50"
      }`}
      loading="lazy"
    />
  );
};
