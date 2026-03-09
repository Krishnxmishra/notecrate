"use client";

interface LogoProps {
  size?: number;
  className?: string;
  /** "auto" (default) swaps light/dark. "light" always shows the light variant. */
  variant?: "auto" | "light";
}

export function Logo({ size = 22, className, variant = "auto" }: LogoProps) {
  const style = { width: size, height: size, objectFit: "contain" as const };
  const cls = `rounded-sm ${className ?? ""}`;

  if (variant === "light") {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/logo-light.png" alt="NoteCrate" width={size} height={size} className={cls} style={style} />
    );
  }

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-light.png" alt="NoteCrate" width={size} height={size} className={`block dark:hidden ${cls}`} style={style} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-dark.png" alt="NoteCrate" width={size} height={size} className={`hidden dark:block ${cls}`} style={style} />
    </>
  );
}
