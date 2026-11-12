import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
const state=vi.hoisted(()=>({invalidated:false,effect:undefined as undefined | (()=>void|(()=>void))}));
vi.mock("react",async()=>({
  ...await vi.importActual<typeof import("react")>("react"),
  useState:()=>[state.invalidated,(value:boolean)=>{state.invalidated=value;}],
  useEffect:(effect:()=>void|(()=>void))=>{state.effect=effect;},
}));
import { PrivateViewGuard, PRIVATE_VIEW_INVALIDATION_KEY } from "./private-view-guard";
let listeners:Map<string,(event:never)=>void>;
let replace:ReturnType<typeof vi.fn>;
let reload:ReturnType<typeof vi.fn>;
let remove:ReturnType<typeof vi.fn>;
beforeEach(()=>{
  state.invalidated=false;state.effect=undefined;listeners=new Map();replace=vi.fn();reload=vi.fn();remove=vi.fn();
  vi.stubGlobal("window",{location:{replace,reload},addEventListener:(name:string,listener:(event:never)=>void)=>listeners.set(name,listener),removeEventListener:remove});
});
afterEach(()=>vi.unstubAllGlobals());
function mount(){const component=PrivateViewGuard({children:<p>Private synthetic content</p>});const cleanup=state.effect?.();return {component,cleanup};}
it("retains the server-rendered subtree before invalidation",()=>{
  const {component}=mount();expect(renderToStaticMarkup(component)).toContain("Private synthetic content");
});
it("discards children before navigating on a content-free cross-tab invalidation",()=>{
  mount();replace.mockImplementation(()=>{expect(PrivateViewGuard({children:<p>Private synthetic content</p>})).toBeNull();});
  listeners.get("storage")?.({key:PRIVATE_VIEW_INVALIDATION_KEY,newValue:"synthetic-nonce"} as never);
  expect(replace).toHaveBeenCalledExactlyOnceWith("/login?next=/my-toro");
});
it("ignores unrelated storage traffic and nonpersisted page display",()=>{
  mount();listeners.get("storage")?.({key:"unrelated",newValue:"x"} as never);listeners.get("pageshow")?.({persisted:false} as never);
  expect(state.invalidated).toBe(false);expect(replace).not.toHaveBeenCalled();expect(reload).not.toHaveBeenCalled();
});
it("discards before the browser freezes a page and reloads a restored document",()=>{
  const {cleanup}=mount();listeners.get("pagehide")?.({persisted:true} as never);
  expect(PrivateViewGuard({children:<p>Private synthetic content</p>})).toBeNull();
  listeners.get("pageshow")?.({persisted:true} as never);expect(reload).toHaveBeenCalledOnce();
  if(typeof cleanup==="function")cleanup();expect(remove.mock.calls.map(call=>call[0])).toEqual(["storage","pagehide","pageshow"]);
});
