import { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className }: Props) {
  return (
    <div className={cn("mx-auto max-w-7xl px-6 sm:px-10", className)}>
      {children}
    </div>
  );
}
