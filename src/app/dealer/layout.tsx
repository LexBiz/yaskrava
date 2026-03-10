import type {Metadata} from "next";

import "../globals.css";

export const metadata: Metadata = {
  title: "CRM дилера",
  icons: {
    icon: [{url: "/icon.png?v=3", type: "image/png", sizes: "512x512"}],
    shortcut: ["/icon.png?v=3"],
    apple: ["/apple-icon.png?v=3"],
  },
};

export default function DealerLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="uk">
      <body className="min-h-dvh bg-black text-white antialiased">{children}</body>
    </html>
  );
}
