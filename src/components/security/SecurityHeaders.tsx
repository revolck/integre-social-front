"use client";

import { useEffect } from "react";

/**
 * Componente para configurar headers de segurança no cliente
 * Implementa proteções contra XSS, clickjacking, MIME sniffing, etc.
 */
export function SecurityHeaders() {
  useEffect(() => {
    // Configurar headers de segurança via meta tags (para casos onde não é possível via servidor)
    const securityMetaTags = [
      {
        name: "referrer",
        content: "strict-origin-when-cross-origin",
      },
      {
        "http-equiv": "X-Content-Type-Options",
        content: "nosniff",
      },
      {
        "http-equiv": "X-Frame-Options",
        content: "DENY",
      },
      {
        "http-equiv": "X-XSS-Protection",
        content: "1; mode=block",
      },
      {
        name: "format-detection",
        content: "telephone=no",
      },
      {
        name: "theme-color",
        content: "#000000",
      },
      {
        name: "msapplication-TileColor",
        content: "#000000",
      },
      {
        name: "apple-mobile-web-app-capable",
        content: "yes",
      },
      {
        name: "apple-mobile-web-app-status-bar-style",
        content: "black-translucent",
      },
    ];

    // Adicionar meta tags se não existirem
    securityMetaTags.forEach(({ name, "http-equiv": httpEquiv, content }) => {
      const selector = name
        ? `meta[name="${name}"]`
        : `meta[http-equiv="${httpEquiv}"]`;
      const existingMeta = document.querySelector(selector);

      if (!existingMeta) {
        const meta = document.createElement("meta");
        if (name) meta.name = name;
        if (httpEquiv) meta.httpEquiv = httpEquiv;
        meta.content = content;
        document.head.appendChild(meta);
      }
    });

    // Prevenir drag and drop de arquivos na página (segurança)
    const preventDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const preventDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    // Prevenir abertura de links em janelas não seguras
    const preventUnsafeLinks = (e: Event) => {
      const target = e.target as HTMLAnchorElement;

      if (target.tagName === "A" && target.href) {
        // Se for link externo e não tiver rel="noopener", adicionar
        if (target.hostname !== window.location.hostname) {
          if (!target.rel.includes("noopener")) {
            target.rel = target.rel
              ? `${target.rel} noopener noreferrer`
              : "noopener noreferrer";
          }
        }
      }
    };

    // Prevenir execução de JavaScript em contextos não seguros
    const preventUnsafeScript = (e: Event) => {
      const target = e.target as HTMLElement;

      // Verificar se há tentativa de inserir script malicioso
      if (
        target.innerHTML &&
        (target.innerHTML.includes("<script") ||
          target.innerHTML.includes("javascript:") ||
          target.innerHTML.includes("onw+s*="))
      ) {
        console.warn("Tentativa de execução de script malicioso bloqueada");
        e.preventDefault();
        e.stopPropagation();
      }
    };

    // Monitorar mudanças no DOM suspeitas
    const domObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;

              // Verificar se script suspeito foi adicionado
              if (element.tagName === "SCRIPT") {
                const script = element as HTMLScriptElement;

                // Verificar se é um script não autorizado
                if (
                  !script.src.startsWith(window.location.origin) &&
                  !script.src.includes("googleapis.com") &&
                  !script.src.includes("googletagmanager.com")
                ) {
                  console.warn(
                    "Script suspeito detectado e removido:",
                    script.src
                  );
                  script.remove();
                }
              }

              // Verificar atributos suspeitos em elementos
              Array.from(element.attributes || []).forEach((attr) => {
                if (
                  attr.name.startsWith("on") ||
                  attr.value.includes("javascript:")
                ) {
                  console.warn(
                    "Atributo suspeito detectado e removido:",
                    attr.name
                  );
                  element.removeAttribute(attr.name);
                }
              });
            }
          });
        }
      });
    });

    // Configurar listeners
    document.addEventListener("dragover", preventDragOver);
    document.addEventListener("drop", preventDrop);
    document.addEventListener("click", preventUnsafeLinks, true);
    document.addEventListener("DOMNodeInserted", preventUnsafeScript, true);

    // Iniciar observador do DOM
    domObserver.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["onclick", "onload", "onerror", "href", "src"],
    });

    // Desabilitar console em produção (dificultar debug malicioso)
    if (process.env.NODE_ENV === "production") {
      const noop = () => {};
      const methods = ["log", "warn", "error", "info", "debug"];

      methods.forEach((method) => {
        (console as any)[method] = noop;
      });
    }

    // Detectar developer tools (em produção)
    if (process.env.NODE_ENV === "production") {
      let devtools = false;

      const detectDevTools = () => {
        const threshold = 160;

        if (
          window.outerHeight - window.innerHeight > threshold ||
          window.outerWidth - window.innerWidth > threshold
        ) {
          if (!devtools) {
            devtools = true;
            console.warn("Developer tools detectado");

            // Opcional: redirecionar ou alertar
            // window.location.href = "/security-warning";
          }
        } else {
          devtools = false;
        }
      };

      const devToolsInterval = setInterval(detectDevTools, 1000);

      return () => {
        clearInterval(devToolsInterval);
      };
    }

    // Cleanup
    return () => {
      document.removeEventListener("dragover", preventDragOver);
      document.removeEventListener("drop", preventDrop);
      document.removeEventListener("click", preventUnsafeLinks, true);
      document.removeEventListener(
        "DOMNodeInserted",
        preventUnsafeScript,
        true
      );
      domObserver.disconnect();
    };
  }, []);

  return null; // Componente não renderiza nada visualmente
}
