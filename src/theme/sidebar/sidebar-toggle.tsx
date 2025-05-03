"use client";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Icon } from "@/components/ui/custom/Icons";
import { motion } from "framer-motion";

interface SidebarToggleProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ collapsed, onToggle }: SidebarToggleProps) {
  const isDesktop = useMediaQuery("(min-width: 1280px)");

  if (!isDesktop) return null;

  return (
    <Button
      onClick={onToggle}
      className="rounded-md h-auto p-0 hover:bg-transparent hover:text-default-800 text-default-500"
      variant="ghost"
      size="icon"
    >
      {collapsed ? (
        <motion.div
          key="collapsed"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -20, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Icon name="ChevronRight" className="h-6 w-6" />
        </motion.div>
      ) : (
        <motion.div
          key="expanded"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Icon name="Menu" className="h-6 w-6" />
        </motion.div>
      )}
    </Button>
  );
}
