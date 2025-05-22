// "use client";

// import * as React from "react";
// import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
// import { motion } from "framer-motion";
// import { cn } from "@/lib/utils";
// import { checkboxCustomVariants, checkboxLabelVariants } from "./variants";
// import type { CheckboxCustomProps } from "./types";

// /**
//  * Componente CheckboxCustom - Um checkbox avançado com animações e estilos personalizáveis
//  */
// const CheckboxCustom = React.forwardRef;
// React.ElementRef<typeof CheckboxPrimitive.Root>,
//   CheckboxCustomProps >
//     ((
//       {
//         className,
//         size = "md",
//         variant = "default",
//         label,
//         labelPosition = "right",
//         disabled,
//         checked,
//         defaultChecked,
//         onCheckedChange,
//         ...props
//       },
//       ref
//     ) => {
//       // Controla o estado interno do checkbox
//       const [isChecked, setIsChecked] = React.useState<boolean>(
//         checked ?? defaultChecked ?? false
//       );

//       // Atualiza o estado quando as props mudam
//       React.useEffect(() => {
//         setIsChecked(checked ?? defaultChecked ?? false);
//       }, [checked, defaultChecked]);

//       // Handler para mudança de estado
//       const handleCheckedChange = (newChecked: boolean | "indeterminate") => {
//         setIsChecked(newChecked === true);
//         onCheckedChange?.(newChecked);
//       };

//       // Componente do checkbox com a animação
//       const checkboxElement = (
//         <CheckboxPrimitive.Root
//           ref={ref}
//           checked={checked}
//           defaultChecked={defaultChecked}
//           disabled={disabled}
//           onCheckedChange={handleCheckedChange}
//           className="hidden"
//           {...props}
//           asChild
//         >
//           <motion.button
//             className={cn(
//               checkboxCustomVariants({
//                 size,
//                 variant,
//               }),
//               className
//             )}
//             whileTap={{ scale: 0.95 }}
//             whileHover={{ scale: 1.05 }}
//             data-state={isChecked ? "checked" : "unchecked"}
//           >
//             <CheckboxPrimitive.Indicator forceMount asChild>
//               <motion.svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 strokeWidth="3.5"
//                 stroke="currentColor"
//                 className={cn({
//                   "size-3": size === "sm",
//                   "size-3.5": size === "md",
//                   "size-4": size === "lg",
//                 })}
//                 initial="unchecked"
//                 animate={isChecked ? "checked" : "unchecked"}
//               >
//                 <motion.path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   d="M4.5 12.75l6 6 9-13.5"
//                   variants={{
//                     checked: {
//                       pathLength: 1,
//                       opacity: 1,
//                       transition: {
//                         duration: 0.2,
//                         delay: 0.2,
//                       },
//                     },
//                     unchecked: {
//                       pathLength: 0,
//                       opacity: 0,
//                       transition: {
//                         duration: 0.2,
//                       },
//                     },
//                   }}
//                 />
//               </motion.svg>
//             </CheckboxPrimitive.Indicator>
//           </motion.button>
//         </CheckboxPrimitive.Root>
//       );

//       // Se tiver label, renderiza com o label
//       if (label) {
//         return (
//           <div
//             className="flex items-center gap-2"
//             data-slot="checkbox-custom-container"
//           >
//             {labelPosition === "left" && (
//               <label
//                 className={cn(
//                   checkboxLabelVariants({
//                     disabled: !!disabled,
//                     size,
//                   })
//                 )}
//                 data-slot="checkbox-custom-label"
//               >
//                 {label}
//               </label>
//             )}
//             {checkboxElement}
//             {labelPosition === "right" && (
//               <label
//                 className={cn(
//                   checkboxLabelVariants({
//                     disabled: !!disabled,
//                     size,
//                   })
//                 )}
//                 data-slot="checkbox-custom-label"
//               >
//                 {label}
//               </label>
//             )}
//           </div>
//         );
//       }

//       // Sem label, retorna apenas o checkbox
//       return checkboxElement;
//     });

// CheckboxCustom.displayName = "CheckboxCustom";

// export { CheckboxCustom };
