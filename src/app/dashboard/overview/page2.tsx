"use client";

import React from "react";
import Saudation from "@/theme/components/dashboard/overview/saudation";
import Facilits from "@/theme/components/dashboard/overview/facilits";

export default function Header() {
  return (
    <div className="p-6 md:items-center md:justify-between mb-6 gap-4">
      <Saudation name="Filipe Reis" />
      <Facilits />
    </div>
  );
}
