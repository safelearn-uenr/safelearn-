import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SafeLearn App — academic access, simplified",
  description: "Protected short-course video learning with clear access and a solo-admin approval layer.",
  icons: { icon: "https://dummyimage.com/64x64/151716/f4b544.png&text=S" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
