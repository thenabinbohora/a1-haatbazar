"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

export type OverlayDismissReason =
  | "action"
  | "another-layer"
  | "escape"
  | "navigation"
  | "outside-pointer"
  | "resize"
  | "scroll"
  | "session-change"
  | "trigger";

type OverlayKind = "dialog" | "drawer" | "temporary";

type OverlayLayer = {
  contentRef: RefObject<HTMLElement | null>;
  dismissOnEscape: boolean;
  dismissOnOutsidePointer: boolean;
  dismissOnResize: boolean;
  dismissOnScroll: boolean;
  id: string;
  kind: OverlayKind;
  onDismiss: (reason: OverlayDismissReason) => void;
  triggerRef: RefObject<HTMLElement | null>;
};

type OverlayRegistry = {
  dismiss: (id: string, reason: OverlayDismissReason) => boolean;
  register: (layer: OverlayLayer) => () => void;
};

const OverlayRegistryContext = createContext<OverlayRegistry | null>(null);

function isEventInsideLayer(event: Event, layer: OverlayLayer) {
  const boundaries = [layer.triggerRef.current, layer.contentRef.current].filter(
    (element): element is HTMLElement => Boolean(element),
  );
  const path = typeof event.composedPath === "function" ? event.composedPath() : [];

  if (boundaries.some((element) => path.includes(element))) {
    return true;
  }

  return event.target instanceof Node
    ? boundaries.some((element) => element.contains(event.target as Node))
    : false;
}

export function OverlayProvider({
  children,
  sessionKey,
}: {
  children: ReactNode;
  sessionKey: string;
}) {
  const pathname = usePathname();
  const layersRef = useRef(new Map<string, OverlayLayer>());
  const stackRef = useRef<string[]>([]);
  const previousPathnameRef = useRef(pathname);
  const previousSessionKeyRef = useRef(sessionKey);

  const removeLayer = useCallback((id: string) => {
    layersRef.current.delete(id);
    stackRef.current = stackRef.current.filter((layerId) => layerId !== id);
  }, []);

  const dismiss = useCallback(
    (id: string, reason: OverlayDismissReason) => {
      const layer = layersRef.current.get(id);

      if (!layer) {
        return false;
      }

      removeLayer(id);
      layer.onDismiss(reason);
      return true;
    },
    [removeLayer],
  );

  const dismissAll = useCallback(
    (reason: OverlayDismissReason) => {
      for (const id of [...stackRef.current].reverse()) {
        dismiss(id, reason);
      }
    },
    [dismiss],
  );

  const register = useCallback(
    (layer: OverlayLayer) => {
      removeLayer(layer.id);

      for (const id of [...stackRef.current].reverse()) {
        const currentLayer = layersRef.current.get(id);

        if (currentLayer?.kind === "temporary") {
          dismiss(id, "another-layer");
        }
      }

      layersRef.current.set(layer.id, layer);
      stackRef.current.push(layer.id);

      return () => removeLayer(layer.id);
    },
    [dismiss, removeLayer],
  );

  useEffect(() => {
    function topLayer() {
      const id = stackRef.current.at(-1);
      return id ? layersRef.current.get(id) : undefined;
    }

    function onPointerDown(event: PointerEvent) {
      const layer = topLayer();

      if (
        layer?.dismissOnOutsidePointer &&
        !isEventInsideLayer(event, layer)
      ) {
        dismiss(layer.id, "outside-pointer");
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      const layer = topLayer();

      if (event.key !== "Escape" || !layer?.dismissOnEscape) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      dismiss(layer.id, "escape");
    }

    function onScroll(event: Event) {
      const layer = topLayer();

      if (
        !layer?.dismissOnScroll ||
        (event.target instanceof Node && layer.contentRef.current?.contains(event.target))
      ) {
        return;
      }

      dismiss(layer.id, "scroll");
    }

    function onResize() {
      const layer = topLayer();

      if (layer?.dismissOnResize) {
        dismiss(layer.id, "resize");
      }
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
    };
  }, [dismiss]);

  useLayoutEffect(() => {
    if (previousPathnameRef.current === pathname) {
      return;
    }

    previousPathnameRef.current = pathname;
    dismissAll("navigation");
  }, [dismissAll, pathname]);

  useLayoutEffect(() => {
    if (previousSessionKeyRef.current === sessionKey) {
      return;
    }

    previousSessionKeyRef.current = sessionKey;
    dismissAll("session-change");
  }, [dismissAll, sessionKey]);

  const value = useMemo<OverlayRegistry>(
    () => ({ dismiss, register }),
    [dismiss, register],
  );

  return (
    <OverlayRegistryContext.Provider value={value}>
      {children}
    </OverlayRegistryContext.Provider>
  );
}

type UseDismissibleLayerOptions = {
  contentRef: RefObject<HTMLElement | null>;
  dismissOnEscape?: boolean;
  dismissOnOutsidePointer?: boolean;
  dismissOnResize?: boolean;
  dismissOnScroll?: boolean;
  initialFocusRef?: RefObject<HTMLElement | null>;
  kind?: OverlayKind;
  onDismiss: (reason: OverlayDismissReason) => void;
  open: boolean;
  restoreFocusOnDismiss?: boolean;
  triggerRef: RefObject<HTMLElement | null>;
};

export function useDismissibleLayer({
  contentRef,
  dismissOnEscape = true,
  dismissOnOutsidePointer = true,
  dismissOnResize = false,
  dismissOnScroll = false,
  initialFocusRef,
  kind = "temporary",
  onDismiss,
  open,
  restoreFocusOnDismiss = true,
  triggerRef,
}: UseDismissibleLayerOptions) {
  const id = useId();
  const registry = useContext(OverlayRegistryContext);
  const onDismissRef = useRef(onDismiss);

  if (!registry) {
    throw new Error("useDismissibleLayer must be used inside OverlayProvider.");
  }

  useLayoutEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const handleDismiss = useCallback(
    (reason: OverlayDismissReason) => {
      onDismissRef.current(reason);

      const shouldRestoreFocus =
        restoreFocusOnDismiss &&
        (reason === "escape" || reason === "resize" || reason === "scroll");

      if (shouldRestoreFocus) {
        window.requestAnimationFrame(() => {
          if (triggerRef.current?.isConnected) {
            triggerRef.current.focus();
          }
        });
      }
    },
    [restoreFocusOnDismiss, triggerRef],
  );

  useLayoutEffect(() => {
    if (!open) {
      return;
    }

    return registry.register({
      contentRef,
      dismissOnEscape,
      dismissOnOutsidePointer,
      dismissOnResize,
      dismissOnScroll,
      id,
      kind,
      onDismiss: handleDismiss,
      triggerRef,
    });
  }, [
    contentRef,
    dismissOnEscape,
    dismissOnOutsidePointer,
    dismissOnResize,
    dismissOnScroll,
    handleDismiss,
    id,
    kind,
    open,
    registry,
    triggerRef,
  ]);

  useLayoutEffect(() => {
    if (!open || !initialFocusRef) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      initialFocusRef.current?.focus();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [initialFocusRef, open]);

  return useCallback(
    (reason: OverlayDismissReason = "action") => {
      if (!registry.dismiss(id, reason)) {
        handleDismiss(reason);
      }
    },
    [handleDismiss, id, registry],
  );
}
