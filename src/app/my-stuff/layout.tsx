import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My saved learning",
  robots: { index: false, follow: false },
};

export default function MyStuffLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
