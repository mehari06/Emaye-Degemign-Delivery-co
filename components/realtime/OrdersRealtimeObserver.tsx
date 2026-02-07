"use client";

import * as React from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@/lib/types";
import { Button } from "@/components/ui/Button";

type Scope = "admin" | "user";

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

type PolledOrderSummary = {
  id: string;
  userId?: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
};

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
  pollIntervalMs = 7000,
}: {
  scope: Scope;
  userId?: string;
  pollIntervalMs?: number;
}) {
  const router = useRouter();

  const [soundEnabled, setSoundEnabled] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);

  const lastStatusByOrderIdRef = React.useRef(new Map<string, OrderStatus>());
  const lastSeenOrderIdsRef = React.useRef(new Set<string>());
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

    const endpoint =
      scope === "admin" ? "/api/admin/orders/summary" : "/api/orders/summary";

    const pollOnce = async () => {
      try {
        const response = await fetch(endpoint, { cache: "no-store" });
        if (!response.ok) return;
        const orders = (await response.json()) as PolledOrderSummary[];

        if (!Array.isArray(orders)) return;

        let changed = false;
        let notified = false;

        for (const order of orders) {
          if (!order?.id) continue;
          const orderId = safeString(order.id);
          const newStatus = safeOrderStatus(order.status);
          if (!newStatus) continue;

          const hadOrder = lastSeenOrderIdsRef.current.has(orderId);
          const oldStatus = lastStatusByOrderIdRef.current.get(orderId) ?? null;

          lastSeenOrderIdsRef.current.add(orderId);
          lastStatusByOrderIdRef.current.set(orderId, newStatus);

          if (!hadOrder) {
            changed = true;
            notified = true;
            const body =
              scope === "admin"
                ? `New order #${shortOrderId(orderId)}`
                : `Order #${shortOrderId(orderId)} created`;
            toast(body);
            if (soundEnabled) await tryPlayBeep();
            if (
              notificationsEnabled &&
              typeof Notification !== "undefined" &&
              Notification.permission === "granted"
            ) {
              try {
                new Notification("New order", { body });
              } catch {
                // ignore
              }
            }
          } else if (oldStatus && oldStatus !== newStatus) {
            changed = true;
            notified = true;
            const body = `Order #${shortOrderId(orderId)}: ${oldStatus} → ${newStatus}`;
            toast(body);
            if (soundEnabled) await tryPlayBeep();
            if (
              notificationsEnabled &&
              typeof Notification !== "undefined" &&
              Notification.permission === "granted"
            ) {
              try {
                new Notification("Order updated", { body });
              } catch {
                // ignore
              }
            }
          }
        }

        if (changed) router.refresh();

        // Keep the UI feeling responsive even if orders disappear from the summary list.
        if (!notified && lastSeenOrderIdsRef.current.size === 0) {
          // no-op
        }
      } catch {
        // ignore polling errors
      }
    };

    let timer: number | undefined;
    let stopped = false;

    const start = async () => {
      await pollOnce();
      if (stopped) return;
      timer = window.setInterval(pollOnce, pollIntervalMs);
    };

    start();

    return () => {
      stopped = true;
      if (timer) window.clearInterval(timer);
    };
  }, [scope, userId, router, soundEnabled, notificationsEnabled, pollIntervalMs]);

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
