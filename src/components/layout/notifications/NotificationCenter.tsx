"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useApp } from "@/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Icon } from "@/components/ui/custom/Icons";
import { cn } from "@/lib/utils";
import { websocketConfig } from "@/config/api";
import { toastCustom } from "@/components/ui/custom/toast";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "system";
  priority: "low" | "normal" | "high" | "urgent";
  category: "system" | "user" | "financial" | "security" | "update";
  read: boolean;
  timestamp: Date;
  actions?: NotificationAction[];
  data?: Record<string, any>;
  expiresAt?: Date;
  userId?: string;
  organizationId?: string;
}

interface NotificationAction {
  id: string;
  label: string;
  type: "primary" | "secondary" | "danger";
  action: string;
  url?: string;
}

/**
 * Central de notificações em tempo real
 * Gerencia notificações locais, push notifications e WebSocket
 */
export function NotificationCenter() {
  const { user, isAuthenticated } = useAuth();
  const { organization } = useApp();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("disconnected");

  // Contador de não lidas
  const unreadCount = notifications.filter((n) => !n.read).length;

  /**
   * Conectar WebSocket para notificações em tempo real
   */
  const connectWebSocket = useCallback(() => {
    if (!isAuthenticated || !user) return;

    try {
      setConnectionStatus("connecting");

      const token = localStorage.getItem("accessToken");
      const wsUrl = `${websocketConfig.url}?token=${token}&userId=${user.id}&orgId=${organization?.id}`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket conectado para notificações");
        setConnectionStatus("connected");
        setWebSocket(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error("Erro ao processar mensagem WebSocket:", error);
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket desconectado:", event.code, event.reason);
        setConnectionStatus("disconnected");
        setWebSocket(null);

        // Reconectar após 3 segundos se não foi fechamento intencional
        if (event.code !== 1000 && isAuthenticated) {
          setTimeout(connectWebSocket, 3000);
        }
      };

      ws.onerror = (error) => {
        console.error("Erro no WebSocket:", error);
        setConnectionStatus("disconnected");
      };
    } catch (error) {
      console.error("Erro ao conectar WebSocket:", error);
      setConnectionStatus("disconnected");
    }
  }, [isAuthenticated, user, organization?.id]);

  /**
   * Processar mensagens do WebSocket
   */
  const handleWebSocketMessage = useCallback(
    (data: any) => {
      switch (data.type) {
        case "notification":
          addNotification(data.payload);
          break;
        case "notification_read":
          markNotificationAsRead(data.payload.id);
          break;
        case "notification_delete":
          removeNotification(data.payload.id);
          break;
        case "heartbeat":
          // Manter conexão viva
          if (webSocket?.readyState === WebSocket.OPEN) {
            webSocket.send(JSON.stringify({ type: "pong" }));
          }
          break;
        default:
          console.log("Mensagem WebSocket não reconhecida:", data);
      }
    },
    [webSocket]
  );

  /**
   * Adicionar nova notificação
   */
  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "timestamp">) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      setNotifications((prev) => [newNotification, ...prev.slice(0, 99)]); // Manter máximo 100

      // Mostrar toast para notificações importantes
      if (
        notification.priority === "high" ||
        notification.priority === "urgent"
      ) {
        const toastType =
          notification.type === "error"
            ? "error"
            : notification.type === "warning"
            ? "warning"
            : notification.type === "success"
            ? "success"
            : "info";

        toastCustom[toastType]({
          title: notification.title,
          description: notification.message,
          duration: notification.priority === "urgent" ? 10000 : 5000,
        });
      }

      // Notificação nativa do browser (se permitido)
      if (
        Notification.permission === "granted" &&
        (notification.priority === "high" || notification.priority === "urgent")
      ) {
        new Notification(notification.title, {
          body: notification.message,
          icon: "/favicon-32x32.png",
          tag: newNotification.id,
        });
      }
    },
    []
  );

  /**
   * Marcar notificação como lida
   */
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );

    // Notificar servidor
    try {
      await fetch("/api/notifications/read", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ notificationId }),
      });
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  }, []);

  /**
   * Remover notificação
   */
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  /**
   * Marcar todas como lidas
   */
  const markAllAsRead = useCallback(async () => {
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    try {
      await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ notificationIds: unreadIds }),
      });
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  }, [notifications]);

  /**
   * Limpar todas as notificações
   */
  const clearAll = useCallback(async () => {
    const notificationIds = notifications.map((n) => n.id);

    setNotifications([]);

    try {
      await fetch("/api/notifications/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ notificationIds }),
      });
    } catch (error) {
      console.error("Erro ao limpar notificações:", error);
    }
  }, [notifications]);

  /**
   * Executar ação da notificação
   */
  const executeAction = useCallback(
    async (notification: Notification, action: NotificationAction) => {
      try {
        if (action.url) {
          window.open(action.url, "_blank");
        } else {
          // Executar ação via API
          await fetch("/api/notifications/action", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
            body: JSON.stringify({
              notificationId: notification.id,
              actionId: action.id,
              action: action.action,
            }),
          });
        }

        // Marcar como lida após executar ação
        markNotificationAsRead(notification.id);
      } catch (error) {
        console.error("Erro ao executar ação:", error);
        toastCustom.error({
          title: "Erro",
          description: "Não foi possível executar a ação.",
        });
      }
    },
    [markNotificationAsRead]
  );

  /**
   * Carregar notificações do servidor
   */
  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);

      const response = await fetch("/api/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  /**
   * Solicitar permissão para notificações nativas
   */
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      console.log("Permissão para notificações:", permission);
    }
  }, []);

  // Conectar WebSocket e carregar notificações
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      connectWebSocket();
      requestNotificationPermission();
    }

    return () => {
      if (webSocket?.readyState === WebSocket.OPEN) {
        webSocket.close(1000);
      }
    };
  }, [
    isAuthenticated,
    loadNotifications,
    connectWebSocket,
    requestNotificationPermission,
  ]);

  // Limpar notificações expiradas
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setNotifications((prev) =>
        prev.filter((n) => !n.expiresAt || n.expiresAt > now)
      );
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Icon name="Bell" size={20} />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          <div className="flex items-center space-x-2">
            {/* Status de conexão */}
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                connectionStatus === "connected"
                  ? "bg-green-500"
                  : connectionStatus === "connecting"
                  ? "bg-yellow-500 animate-pulse"
                  : "bg-red-500"
              )}
            />

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs"
              >
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center p-6">
              <Icon name="Loader2" className="h-6 w-6 animate-spin" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Icon
                name="Bell"
                className="h-8 w-8 text-muted-foreground mb-2"
              />
              <p className="text-sm text-muted-foreground">
                Nenhuma notificação
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={cn(
                      "p-3 hover:bg-muted/50 cursor-pointer transition-colors",
                      !notification.read && "bg-blue-50 dark:bg-blue-950/20"
                    )}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                          notification.type === "error"
                            ? "bg-red-500"
                            : notification.type === "warning"
                            ? "bg-yellow-500"
                            : notification.type === "success"
                            ? "bg-green-500"
                            : notification.type === "system"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        )}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">
                            {notification.title}
                          </p>
                          <span className="text-xs text-muted-foreground ml-2">
                            {notification.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.message}
                        </p>

                        {notification.actions &&
                          notification.actions.length > 0 && (
                            <div className="flex space-x-2 mt-2">
                              {notification.actions.map((action) => (
                                <Button
                                  key={action.id}
                                  variant={
                                    action.type === "primary"
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  className="text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    executeAction(notification, action);
                                  }}
                                >
                                  {action.label}
                                </Button>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="w-full text-xs"
              >
                Limpar Todas
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
