"use client";

import React from "react";
import { MenuDragAble } from "./menu-dragable";

interface MenuProps {
  collapsed: boolean;
}

export function Menu({ collapsed }: MenuProps) {
  return <MenuDragAble collapsed={collapsed} />;
}
