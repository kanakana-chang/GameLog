import Image, { type ImageProps } from "next/image";

function isRemoteSrc(src: ImageProps["src"]) {
  return typeof src === "string" && /^https?:\/\//.test(src);
}

export function CoverImage({ src, alt, unoptimized, ...props }: ImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={unoptimized ?? isRemoteSrc(src)}
      {...props}
    />
  );
}
