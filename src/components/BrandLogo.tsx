import Image from "next/image";

type BrandLogoProps = {
  /** Height in pixels for the mark */
  size?: number;
  className?: string;
  /** Show the "Clutch" wordmark next to the mark */
  withWordmark?: boolean;
  wordmarkClassName?: string;
  onDark?: boolean;
  priority?: boolean;
};

export default function BrandLogo({
  size = 36,
  className = "",
  withWordmark = true,
  wordmarkClassName = "font-display text-lg font-bold tracking-tight text-ink sm:text-xl",
  onDark = false,
  priority = false,
}: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 sm:gap-2.5 ${className}`}>
      <span
        className={`grid shrink-0 place-items-center rounded-xl transition-colors duration-300 ${
          onDark ? "bg-white/95 shadow-sm" : "bg-transparent"
        }`}
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.png"
          alt={withWordmark ? "" : "Clutch"}
          width={Math.max(22, size - 4)}
          height={Math.max(22, size - 4)}
          priority={priority}
          className="shrink-0"
        />
      </span>
      {withWordmark ? (
        <span
          className={`transition-colors duration-300 ${
            onDark ? "font-display text-lg font-bold tracking-tight text-white sm:text-xl" : wordmarkClassName
          }`}
        >
          Clutch
        </span>
      ) : null}
    </span>
  );
}
