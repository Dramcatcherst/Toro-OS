import { describe, expect, it } from "vitest";
import { createPortalReadRefresh, PORTAL_READ_REFRESH_MS } from "./portal-read-refresh";
function harness() {
  let now=0,ready=true,calls=0,cancelled=false;
  let tick:()=>void=()=>{};
  const refresh=createPortalReadRefresh({now:()=>now,ready:()=>ready,refresh:()=>{calls++;},
    schedule:(callback,delay)=>{expect(delay).toBe(PORTAL_READ_REFRESH_MS);tick=callback;return()=>{cancelled=true;};}});
  return {refresh,tick:()=>tick(),advance:(ms:number)=>{now+=ms;},setReady:(value:boolean)=>{ready=value;},
    calls:()=>calls,cancelled:()=>cancelled};
}
describe("bounded Portal read refresh",()=>{
  it("waits for its interval and deduplicates simultaneous wake events",()=>{
    const h=harness();h.tick();expect(h.calls()).toBe(0);
    h.advance(PORTAL_READ_REFRESH_MS);h.tick();h.refresh.request();h.refresh.request();
    expect(h.calls()).toBe(1);
  });
  it("skips hidden/offline/busy reads and refreshes once on eligible return",()=>{
    const h=harness();h.setReady(false);h.advance(PORTAL_READ_REFRESH_MS*4);h.tick();
    expect(h.calls()).toBe(0);h.setReady(true);expect(h.refresh.request()).toBe(true);
    expect(h.refresh.request()).toBe(false);expect(h.calls()).toBe(1);
  });
  it("allows a manual refresh before the periodic boundary without bursts",()=>{
    const h=harness();expect(h.refresh.request(true)).toBe(true);
    expect(h.refresh.request(true)).toBe(false);h.advance(PORTAL_READ_REFRESH_MS-1);
    expect(h.refresh.request()).toBe(false);h.advance(1);h.tick();expect(h.calls()).toBe(2);
  });
  it("cancels its interval and ignores late wake callbacks after unmount",()=>{
    const h=harness();h.refresh.stop();h.advance(PORTAL_READ_REFRESH_MS);h.tick();
    expect(h.cancelled()).toBe(true);expect(h.refresh.request(true)).toBe(false);expect(h.calls()).toBe(0);
  });
  it("does not produce a refresh storm after a backwards clock adjustment",()=>{
    const h=harness();h.advance(-PORTAL_READ_REFRESH_MS);h.tick();expect(h.calls()).toBe(0);
  });
});
