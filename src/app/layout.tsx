import type { ReactNode } from "react";

export const revalidate = 60;

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return children;
}
