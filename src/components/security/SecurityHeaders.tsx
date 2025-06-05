"use client";

import { useEffect } from "react";

export function SecurityHeaders() {
  useEffect(() => {
    const metaTags = [
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { "http-equiv": "X-Content-Type-Options", content: "nosniff" },
      { "http-equiv": "X-Frame-Options", content: "DENY" },
      { "http-equiv": "X-XSS-Protection", content: "1; mode=block" },
      { name: "format-detection", content: "telephone=no" },
    ];

    metaTags.forEach(({ name, "http-equiv": httpEquiv, content }) => {
      const meta = document.createElement("meta");
      if (name) meta.name = name;
      if (httpEquiv) meta.httpEquiv = httpEquiv;
      meta.content = content;
      document.head.appendChild(meta);
    });

    const preventDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener("dragover", preventDrop);
    document.addEventListener("drop", preventDrop);

    return () => {
      document.removeEventListener("dragover", preventDrop);
      document.removeEventListener("drop", preventDrop);
    };
  }, []);

  return null;
}
