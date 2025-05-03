"use client";
import { cn } from "@/lib/utils";
import React from "react";

const MenuLabel = ({
  label,
  className,
}: {
  label: string;
  className?: string;
}) => {
  return (
    <p
      className={cn(
        "text-xs font-semibold text-default-800 py-4 max-w-[248px] truncate uppercase",
        className
      )}
    >
      {label}
    </p>
  );
};

export default MenuLabel;
