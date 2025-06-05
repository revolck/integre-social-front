import { ReactNode } from "react";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import { ToasterCustom } from "@/components/ui/custom/toast";

interface Props {
  children: ReactNode;
  defaultTheme?: string;
}

export function AppProvider({ children, defaultTheme = "system" }: Props) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        {children}
        <ToasterCustom
          position="top-right"
          theme="system"
          richColors={true}
          closeButton={false}
          maxToasts={5}
          gap={8}
          defaultDuration={5000}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}
