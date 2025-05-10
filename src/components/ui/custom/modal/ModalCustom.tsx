"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

// Tipos para as props do componente
export interface ModalProps
  extends React.ComponentProps<typeof DialogPrimitive.Root> {
  /**
   * Tamanho da modal
   */
  size?:
    | "xs"
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "full";

  /**
   * Radio das bordas
   */
  radius?: "none" | "sm" | "md" | "lg";

  /**
   * Sombra da modal
   */
  shadow?: "none" | "sm" | "md" | "lg";

  /**
   * Tipo de backdrop
   */
  backdrop?: "transparent" | "opaque" | "blur";

  /**
   * Comportamento de scroll
   */
  scrollBehavior?: "normal" | "inside" | "outside";

  /**
   * Posição da modal na tela
   */
  placement?: "auto" | "top" | "center" | "bottom";

  /**
   * Se a modal está aberta
   */
  isOpen?: boolean;

  /**
   * Se a modal pode ser fechada clicando fora
   */
  isDismissable?: boolean;

  /**
   * Se a modal pode ser fechada pressionando ESC
   */
  isKeyboardDismissDisabled?: boolean;

  /**
   * Se o scroll da página deve ser bloqueado quando a modal estiver aberta
   */
  shouldBlockScroll?: boolean;

  /**
   * Se o botão de fechar deve ser escondido
   */
  hideCloseButton?: boolean;

  /**
   * Botão de fechar personalizado
   */
  closeButton?: React.ReactNode;

  /**
   * Props de animação
   */
  motionProps?: any;

  /**
   * Container do portal
   */
  portalContainer?: HTMLElement;

  /**
   * Se a animação deve ser desativada
   */
  disableAnimation?: boolean;

  /**
   * Classes personalizadas
   */
  classNames?: {
    wrapper?: string;
    base?: string;
    backdrop?: string;
    header?: string;
    body?: string;
    footer?: string;
    closeButton?: string;
  };

  /**
   * Função chamada quando o estado de abertura muda
   */
  onOpenChange?: (isOpen: boolean) => void;

  /**
   * Função chamada quando a modal é fechada
   */
  onClose?: () => void;
}

// Factory function para ModalContext
const createModalContext = () => {
  return React.createContext<{
    isOpen: boolean;
    onClose: () => void;
    size: ModalProps["size"];
    radius: ModalProps["radius"];
    scrollBehavior: ModalProps["scrollBehavior"];
    classNames: Required<ModalProps>["classNames"];
  }>({
    isOpen: false,
    onClose: () => {},
    size: "md",
    radius: "lg",
    scrollBehavior: "normal",
    classNames: {},
  });
};

const ModalContext = createModalContext();

/**
 * Hook para acessar o contexto da modal
 */
export const useModalContext = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error(
      "useModalContext deve ser usado dentro de um ModalProvider"
    );
  }
  return context;
};

// Mapeamento de tamanhos para classes
const sizeClasses = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  full: "max-w-full",
};

// Mapeamento de raios para classes
const radiusClasses = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
};

// Mapeamento de sombras para classes
const shadowClasses = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
};

// Mapeamento de comportamentos de scroll para classes
const scrollBehaviorClasses = {
  normal: "overflow-auto",
  inside: "overflow-y-auto",
  outside: "overflow-y-visible",
};

// Mapeamento de posições para classes
const placementClasses = {
  auto: "top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]",
  top: "top-4 left-[50%] translate-x-[-50%]",
  center: "top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]",
  bottom: "bottom-4 left-[50%] translate-x-[-50%]",
};

// Mapeamento de backdrops para classes
const backdropClasses = {
  transparent: "bg-transparent",
  opaque: "bg-black/50",
  blur: "backdrop-blur-sm bg-black/30",
};

/**
 * Componente principal Modal
 */
export function Modal({
  children,
  isOpen,
  defaultOpen,
  onOpenChange,
  onClose,
  isDismissable = true,
  isKeyboardDismissDisabled = false,
  size = "md",
  radius = "lg",
  shadow = "lg",
  backdrop = "opaque",
  scrollBehavior = "normal",
  placement = "center",
  shouldBlockScroll = true,
  hideCloseButton = false,
  closeButton,
  motionProps,
  portalContainer,
  disableAnimation = false,
  classNames = {},
  ...props
}: ModalProps) {
  // Função para fechar a modal
  const handleClose = React.useCallback(() => {
    onClose?.();
    onOpenChange?.(false);
  }, [onClose, onOpenChange]);

  // Contexto para ser passado para os componentes filhos
  const modalContext = React.useMemo(() => {
    return {
      isOpen: isOpen ?? false,
      onClose: handleClose,
      size,
      radius,
      scrollBehavior,
      classNames: classNames as Required<ModalProps>["classNames"],
    };
  }, [isOpen, handleClose, size, radius, scrollBehavior, classNames]);

  return (
    <ModalContext.Provider value={modalContext}>
      <DialogPrimitive.Root
        open={isOpen}
        defaultOpen={defaultOpen}
        onOpenChange={(open) => {
          if (isDismissable || !open) {
            onOpenChange?.(open);
            if (!open) onClose?.();
          }
        }}
        {...props}
      >
        {children}
      </DialogPrimitive.Root>
    </ModalContext.Provider>
  );
}

/**
 * Componente de gatilho para a modal
 */
function ModalTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return (
    <DialogPrimitive.Trigger
      data-slot="modal-trigger"
      className={cn("", className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Trigger>
  );
}

// Interface estendida para as props do ModalPortal
interface ModalPortalProps
  extends React.ComponentProps<typeof DialogPrimitive.Portal> {
  container?: HTMLElement;
  className?: string;
}

/**
 * Componente que serve como portal para renderizar a modal
 */
function ModalPortal({
  className,
  children,
  container,
  ...props
}: ModalPortalProps) {
  return (
    <DialogPrimitive.Portal
      data-slot="modal-portal"
      container={container}
      {...props}
    >
      {children}
    </DialogPrimitive.Portal>
  );
}

/**
 * Componente para fechar a modal
 */
function ModalClose({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return (
    <DialogPrimitive.Close
      data-slot="modal-close"
      className={cn("", className)}
      {...props}
    />
  );
}

/**
 * Componente de overlay (fundo escuro) da modal
 */
function ModalOverlay({
  className,
  backdrop = "opaque",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay> & {
  backdrop?: "transparent" | "opaque" | "blur";
}) {
  return (
    <DialogPrimitive.Overlay
      data-slot="modal-overlay"
      className={cn(
        "fixed inset-0 z-50",
        backdropClasses[backdrop],
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

// Interface para estender as props do DialogPrimitive.Content
interface ModalContentProps
  extends React.ComponentProps<typeof DialogPrimitive.Content> {
  isKeyboardDismissDisabled?: boolean;
  isDismissable?: boolean;
  hideCloseButton?: boolean;
  closeButton?: React.ReactNode;
  shadow?: "none" | "sm" | "md" | "lg";
  placement?: "auto" | "top" | "center" | "bottom";
}

/**
 * Componente principal de conteúdo da modal
 */
function ModalContent({
  className,
  children,
  onEscapeKeyDown,
  onPointerDownOutside,
  onInteractOutside,
  isKeyboardDismissDisabled,
  isDismissable,
  hideCloseButton,
  closeButton,
  shadow = "lg",
  placement = "center",
  ...props
}: ModalContentProps) {
  const {
    onClose,
    size = "md",
    radius = "lg",
    scrollBehavior = "normal",
    classNames = {},
  } = useModalContext();

  // Renderização do conteúdo da modal
  return (
    <DialogPrimitive.Content
      data-slot="modal-content"
      onEscapeKeyDown={(e) => {
        if (onEscapeKeyDown) {
          onEscapeKeyDown(e);
        }
        // Não propaga evento se isKeyboardDismissDisabled for true
        if (isKeyboardDismissDisabled) {
          e.preventDefault();
        }
      }}
      onPointerDownOutside={(e) => {
        if (onPointerDownOutside) {
          onPointerDownOutside(e);
        }
        // Não propaga evento se isDismissable for false
        if (isDismissable === false) {
          e.preventDefault();
        }
      }}
      onInteractOutside={(e) => {
        if (onInteractOutside) {
          onInteractOutside(e);
        }
        // Não propaga evento se isDismissable for false
        if (isDismissable === false) {
          e.preventDefault();
        }
      }}
      className={cn(
        "fixed z-50 grid w-full gap-4 border p-6 bg-background",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 duration-200",
        sizeClasses[size],
        radiusClasses[radius],
        shadowClasses[shadow as keyof typeof shadowClasses],
        placementClasses[placement as keyof typeof placementClasses],
        scrollBehaviorClasses[scrollBehavior],
        classNames?.base,
        className
      )}
      {...props}
    >
      {children}

      {/* Botão de fechar (pode ser personalizado ou escondido) */}
      {!hideCloseButton &&
        (closeButton || (
          <ModalClose
            className={cn(
              "absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity",
              "hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden",
              "disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              classNames?.closeButton
            )}
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </ModalClose>
        ))}
    </DialogPrimitive.Content>
  );
}

// Interface para as props do ModalContentWrapper
interface ModalContentWrapperProps extends ModalContentProps {
  backdrop?: "transparent" | "opaque" | "blur";
  container?: HTMLElement;
  motionProps?: any;
  disableAnimation?: boolean;
}

/**
 * Wrapper do conteúdo da modal com overlay e portal
 */
function ModalContentWrapper({
  children,
  className,
  backdrop = "opaque",
  container,
  isDismissable,
  isKeyboardDismissDisabled,
  hideCloseButton,
  closeButton,
  shadow = "lg",
  placement = "center",
  motionProps,
  disableAnimation = false,
  ...props
}: ModalContentWrapperProps) {
  const Content = disableAnimation ? React.Fragment : motion.div;
  const contentProps = disableAnimation
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.15 },
        ...motionProps,
      };

  return (
    <ModalPortal container={container}>
      <ModalOverlay backdrop={backdrop} />
      <Content {...contentProps}>
        <ModalContent
          className={className}
          isDismissable={isDismissable}
          isKeyboardDismissDisabled={isKeyboardDismissDisabled}
          hideCloseButton={hideCloseButton}
          closeButton={closeButton}
          shadow={shadow}
          placement={placement}
          {...props}
        >
          {children}
        </ModalContent>
      </Content>
    </ModalPortal>
  );
}

/**
 * Componente para o cabeçalho da modal
 */
function ModalHeader({ className, ...props }: React.ComponentProps<"div">) {
  const { classNames = {} } = useModalContext();

  return (
    <div
      data-slot="modal-header"
      className={cn(
        "flex flex-col gap-2 text-center sm:text-left",
        classNames?.header,
        className
      )}
      {...props}
    />
  );
}

/**
 * Componente para o rodapé da modal
 */
function ModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  const { classNames = {} } = useModalContext();

  return (
    <div
      data-slot="modal-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        classNames?.footer,
        className
      )}
      {...props}
    />
  );
}

/**
 * Componente para o título da modal
 */
function ModalTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="modal-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

/**
 * Componente para a descrição da modal
 */
function ModalDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="modal-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

/**
 * Componente para o corpo da modal
 */
function ModalBody({ className, ...props }: React.ComponentProps<"div">) {
  const { scrollBehavior = "normal", classNames } = useModalContext();

  return (
    <div
      data-slot="modal-body"
      className={cn(
        scrollBehaviorClasses[scrollBehavior],
        "py-2",
        classNames?.body,
        className
      )}
      {...props}
    />
  );
}

// Exportação dos componentes
export {
  Modal as ModalCustom,
  ModalTrigger,
  ModalContent,
  ModalContentWrapper,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalTitle,
  ModalDescription,
  ModalClose,
  ModalOverlay,
};
