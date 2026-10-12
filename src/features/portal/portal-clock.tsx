"use client";

import { useSyncExternalStore } from "react";
import { Clock3 } from "lucide-react";
import { TORO_TIME_ZONE } from "@/lib/reporting-policy";
import styles from "./portal.module.css";

const clock = new Intl.DateTimeFormat("es-CR", { timeZone: TORO_TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const getMinute = () => Math.floor(Date.now() / 60_000);
const getServerMinute = () => null;
function subscribe(listener: () => void) {
  const timer = setInterval(listener, 60_000);
  return () => clearInterval(timer);
}

export function PortalClock() {
  const minute = useSyncExternalStore(subscribe, getMinute, getServerMinute);
  const now = minute === null ? null : new Date(minute * 60_000);
  return <span className={styles.clock} title="Hora de Costa Rica">
    <Clock3 size={15} aria-hidden="true" />
    {now ? <time dateTime={now.toISOString()}>{clock.format(now)} CR</time> : <span>Hora CR</span>}
  </span>;
}
