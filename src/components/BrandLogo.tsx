import Image from "next/image";

type BrandLogoProps = {
  /** Height in pixels for the mark */
  size?: number;
  className?: string;
  /** Show the "Clutch" wordmark next to the mark */
  withWordmark?: boolean;
  wordmarkClassName?: string;
  priority?: boolean;
};

export default function BrandLogo({
  size = 36,
  className = "",
  withWordmark = true,
  wordmarkClassName = "font-display text-xl font-bold tracking-tight text-ink",
  priority = false,
}: BrandLogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/logo.png"
        alt={withWordmark ? "" : "Clutch"}
        width={size}
        height={size}
        priority={priority}
        className="shrink-0 rounded-lg"
      />
      {withWordmark ? <span className={wordmarkClassName}>Clutch</span> : null}
    </span>
  );
}
