import Image from "next/image";

export function UserAvatar({
  src,
  name,
  size,
  className = "",
  rounded = "full",
}: {
  src?: string | null;
  name: string;
  size: number;
  className?: string;
  rounded?: "full" | "2xl";
}) {
  const initial = (name.trim().slice(0, 1) || "G").toUpperCase();
  const roundClass = rounded === "2xl" ? "rounded-2xl" : "rounded-full";
  const shared = `shrink-0 overflow-hidden ${roundClass} ${className}`;

  const inline = Boolean(
    src && (src.startsWith("data:") || src.startsWith("blob:")),
  );

  if (src && inline) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- data/blob URLs
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className={`${shared} object-cover`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (src) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={`${shared} object-cover`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center bg-gradient-to-br from-[#6C5CE7] to-[#a78bfa] font-bold text-white ${shared}`}
      style={{ width: size, height: size, fontSize: Math.max(12, Math.round(size * 0.38)) }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
