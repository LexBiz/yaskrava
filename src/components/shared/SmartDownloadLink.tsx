"use client";

import type {CSSProperties} from "react";
import {useMemo} from "react";

interface Props {
  appStoreUrl: string;
  playStoreUrl: string;
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
}

function getSmartHref(appStoreUrl: string, playStoreUrl: string): string {
  if (typeof navigator === "undefined") return appStoreUrl;
  const ua = navigator.userAgent;
  if (/Android/.test(ua)) return playStoreUrl;
  return appStoreUrl;
}

export function SmartDownloadLink({appStoreUrl, playStoreUrl, className = "", style, children}: Props) {
  const href = useMemo(() => getSmartHref(appStoreUrl, playStoreUrl), [appStoreUrl, playStoreUrl]);

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
      {children}
    </a>
  );
}
