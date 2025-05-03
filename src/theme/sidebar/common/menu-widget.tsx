"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import React from "react";

interface MenuWidgetProps {
  collapsed?: boolean;
}

const MenuWidget = ({ collapsed = false }: MenuWidgetProps) => {
  if (collapsed) return null;

  return (
    <div className="dark">
      <div className="bg-default-50 mb-16 mt-24 p-4 relative text-center rounded-2xl text-white">
        <Image
          className="mx-auto relative -mt-[73px]"
          alt=""
          src="/images/svg/rabit.svg"
          priority
          width={99}
          height={114}
        />
        <div className="max-w-[160px] mx-auto mt-6">
          <div className="">Unlimited Access</div>
          <div className="text-xs font-light">
            Upgrade your system to business plan
          </div>
        </div>
        <div className="mt-6">
          <Button
            size="sm"
            className="bg-white text-default-50 hover:bg-background/90 w-full"
          >
            Upgrade
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuWidget;
