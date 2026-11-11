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
  wordmarkClassName = "font-display text-xl font-bold tracking-tight text-ink",
  onDark = false,
  priority = false,
}: BrandLogoProps) {
  const mark = (
    <Image
      src="/logo.png"
      alt={withWordmark ? "" : "Clutch"}
      width={onDark ? Math.max(20, size - 6) : size}
      height={onDark ? Math.max(20, size - 6) : size}
      priority={priority}
      className="shrink-0"
    />
  );

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      {onDark ? (
        <span
          className="grid shrink-0 place-items-center rounded-xl bg-white/95 shadow-sm"
          style={{ width: size, height: size }}
        >
          {mark}
        </span>
      ) : (
        mark
      )}
      {withWordmark ? (
        <span className={onDark ? "font-display text-xl font-bold tracking-tight text-white" : wordmarkClassName}>
          Clutch
        </span>
      ) : null}
    </span>
  );
}
