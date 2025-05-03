"use client";
import React from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/custom/Icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetHeader,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Logo from "@/components/partials/logo/logoTheme";
import { useMobileMenuConfig } from "@/hooks/use-mobile-menu";
import { useMediaQuery } from "@/hooks/use-media-query";

export function SheetMenu() {
  const [mobileMenuConfig, setMobileMenuConfig] = useMobileMenuConfig();
  const { isOpen } = mobileMenuConfig;

  const isDesktop = useMediaQuery("(min-width: 1280px)");
  if (isDesktop) return null;

  return (
    <Sheet
      open={isOpen}
      onOpenChange={() => setMobileMenuConfig({ isOpen: !isOpen })}
    >
      <SheetTrigger className="xl:hidden" asChild>
        <Button className="h-8" variant="ghost" size="icon">
          <Icon name="AlignRight" className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader>
          <Link href="/dashboard/analytics" className="flex gap-2 items-center">
            <Logo className="text-default-900 h-8 w-8 [&>path:nth-child(3)]:text-background [&>path:nth-child(2)]:text-background" />
            <h1 className="text-xl font-semibold text-default-900">DashCode</h1>
          </Link>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
