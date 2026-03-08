"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof Link>;

export function LandingCtaTrackedLink({ href, children, onClick, ...rest }: Props) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (typeof onClick === "function") onClick(e);
    fetch("/api/landing/cta-click", { method: "POST", keepalive: true }).catch(() => {});
  };

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
