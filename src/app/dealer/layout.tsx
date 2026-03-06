import type {Metadata} from "next";

import "../globals.css";

export const metadata: Metadata = {
  title: "Dealer CRM",
};

export default function DealerLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-black text-white antialiased">{children}</body>
    </html>
  );
}
