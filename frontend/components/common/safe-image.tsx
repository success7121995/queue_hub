"use client";

import Image from "next/image";
import { useState } from "react";
import { UserCircle } from "lucide-react";

interface SafeImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackIcon?: React.ReactNode;
}

const SafeImage = ({ 
  src, 
  alt, 
  width, 
  height, 
  className = "", 
  fallbackIcon = <UserCircle size={width} className="text-gray-400" />
}: SafeImageProps) => {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError || !src) {
    return fallbackIcon;
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
        unoptimized={true}
      />
    </div>
  );
};

export default SafeImage; 