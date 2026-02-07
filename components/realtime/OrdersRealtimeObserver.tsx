"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";

type Scope = "admin" | "user";

type PostgresChangePayload = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: Record<string, unknown> | null;
  old: Record<string, unknown> | null;
};

function safeString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function safeOrderStatus(value: unknown): OrderStatus | null {
  const allowed: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];
  return allowed.includes(value as OrderStatus) ? (value as OrderStatus) : null;
}

function shortOrderId(orderId: string) {
  return orderId ? orderId.slice(0, 6).toUpperCase() : "??????";
}

function readBooleanSetting(key: string, defaultValue: boolean) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return defaultValue;
    return raw === "true";
  } catch {
    return defaultValue;
  }
}

function writeBooleanSetting(key: string, value: boolean) {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    // ignore
  }
}

async function tryPlayBeep() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.value = 880;
    gain.gain.value = 0.04;

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.12);

    window.setTimeout(() => {
      ctx.close().catch(() => {});
    }, 250);
  } catch {
    // ignore autoplay/permission errors
  }
}

export function OrdersRealtimeObserver({
  scope,
  userId,
  tableName = "Order",
}: {
  scope: Scope;
  userId?: string;
  tableName?: string;
}) {
  const router = useRouter();
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);

  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);

  const lastStatusByOrderIdRef = React.useRef(new Map<string, OrderStatus>());
  const mountedRef = React.useRef(false);

  React.useEffect(() => {
    setSoundEnabled(readBooleanSetting("orders_sound_enabled", false));
    setNotificationsEnabled(readBooleanSetting("orders_notifications_enabled", false));
  }, []);

  React.useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (scope === "user" && !userId) return;

    const channel = supabase.channel(`orders:${scope}:${userId ?? "all"}`);

    const filter = scope === "user" ? `userId=eq.${userId}` : undefined;

    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: tableName,
        ...(filter ? { filter } : {}),
      },
      async (payload: PostgresChangePayload) => {
        if (!mountedRef.current) return;

        const newRecord = payload.new ?? {};
        const orderId = safeString(newRecord["id"]);
        const newStatus = safeOrderStatus(newRecord["status"]);

        const oldStatus =
          orderId && lastStatusByOrderIdRef.current.get(orderId)
            ? lastStatusByOrderIdRef.current.get(orderId)!
            : null;

        if (orderId && newStatus) {
          lastStatusByOrderIdRef.current.set(orderId, newStatus);
        }

        const shouldNotify =
          payload.eventType === "INSERT" ||
          (payload.eventType === "UPDATE" &&
            Boolean(orderId && newStatus && oldStatus && newStatus !== oldStatus));

        if (shouldNotify) {
          const title =
            payload.eventType === "INSERT"
              ? "New order received"
              : "Order status updated";

          const body =
            payload.eventType === "INSERT"
              ? `Order #${shortOrderId(orderId)}`
              : `Order #${shortOrderId(orderId)}: ${oldStatus ?? "?"} → ${newStatus ?? "?"}`;

          toast(body);

          if (soundEnabled) await tryPlayBeep();

          if (notificationsEnabled && typeof Notification !== "undefined") {
            if (Notification.permission === "granted") {
              try {
                new Notification(title, { body });
              } catch {
                // ignore
              }
            }
          }
        }

        router.refresh();
      },
    );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [scope, supabase, tableName, userId, router, soundEnabled, notificationsEnabled]);

  const requestNotifications = async () => {
    if (typeof Notification === "undefined") {
      toast.error("Notifications are not supported in this browser.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      const enabled = permission === "granted";
      setNotificationsEnabled(enabled);
      writeBooleanSetting("orders_notifications_enabled", enabled);
      if (!enabled) toast("Notifications permission not granted.");
    } catch {
      toast.error("Unable to request notification permission.");
    }
  };

  const toggleSound = async () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    writeBooleanSetting("orders_sound_enabled", next);
    if (next) await tryPlayBeep();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-white p-4 text-sm text-slate-600 shadow-soft">
      <span className="font-semibold text-slate-900">Live updates</span>
      <span>Auto-updates without refresh.</span>
      <div className="ml-auto flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={toggleSound}>
          {soundEnabled ? "Sound: On" : "Sound: Off"}
        </Button>
        <Button variant="secondary" size="sm" onClick={requestNotifications}>
          {notificationsEnabled ? "Notifications: On" : "Enable notifications"}
        </Button>
      </div>
    </div>
  );
}

