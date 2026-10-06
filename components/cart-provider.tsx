"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import type { CartLine, GiftOptions, Money } from "@/lib/types";
import { money, multiply, sum } from "@/lib/money";

/* ===========================================================================
   State
   =========================================================================== */

const STORAGE_KEY = "adm.cart.v1";
/** Carts older than this are dropped — stale prices and stale stock. */
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 14;

interface CartState {
  lines: CartLine[];
  gift: GiftOptions;
  savedAt: number;
}

type CartAction =
  | { type: "hydrate"; state: CartState }
  | { type: "add"; line: CartLine }
  | { type: "setQuantity"; variationId: string; quantity: number }
  | { type: "remove"; variationId: string }
  | { type: "setGift"; gift: GiftOptions }
  | { type: "clear" };

const EMPTY: CartState = {
  lines: [],
  gift: { isGift: false },
  savedAt: 0,
};

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "add": {
      const existing = state.lines.find((line) => line.variationId === action.line.variationId);
      const lines = existing
        ? state.lines.map((line) =>
            line.variationId === action.line.variationId
              ? { ...line, quantity: line.quantity + action.line.quantity }
              : line,
          )
        : [...state.lines, action.line];
      return { ...state, lines, savedAt: Date.now() };
    }

    case "setQuantity": {
      if (action.quantity <= 0) {
        return {
          ...state,
          lines: state.lines.filter((line) => line.variationId !== action.variationId),
          savedAt: Date.now(),
        };
      }
      return {
        ...state,
        lines: state.lines.map((line) =>
          line.variationId === action.variationId ? { ...line, quantity: action.quantity } : line,
        ),
        savedAt: Date.now(),
      };
    }

    case "remove":
      return {
        ...state,
        lines: state.lines.filter((line) => line.variationId !== action.variationId),
        savedAt: Date.now(),
      };

    case "setGift":
      return { ...state, gift: action.gift, savedAt: Date.now() };

    case "clear":
      return { ...EMPTY, savedAt: Date.now() };

    default:
      return state;
  }
}

/* ===========================================================================
   Context
   =========================================================================== */

interface CartContextValue {
  lines: CartLine[];
  gift: GiftOptions;
  /** False until localStorage has been read, so the count never flashes. */
  ready: boolean;
  itemCount: number;
  subtotal: Money;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (line: CartLine) => void;
  setQuantity: (variationId: string, quantity: number) => void;
  remove: (variationId: string) => void;
  setGift: (gift: GiftOptions) => void;
  clear: () => void;
  /** Politely announced to assistive tech after every cart change. */
  announcement: string;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, EMPTY);
  const [ready, setReady] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const announceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- hydrate ------------------------------------------------------------
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartState;
        const isFresh = Date.now() - (parsed.savedAt ?? 0) < MAX_AGE_MS;
        if (isFresh && Array.isArray(parsed.lines)) {
          dispatch({ type: "hydrate", state: { ...EMPTY, ...parsed } });
        }
      }
    } catch {
      // A private window, blocked storage, or corrupt JSON. An empty cart is
      // the correct outcome in all three — never let this throw on load.
    }
    setReady(true);
  }, []);

  // --- persist ------------------------------------------------------------
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage full or unavailable. The cart still works for this session.
    }
  }, [state, ready]);

  // --- announcements ------------------------------------------------------
  const announce = useCallback((message: string) => {
    setAnnouncement(message);
    if (announceTimer.current) clearTimeout(announceTimer.current);
    // Clear so an identical repeat action is announced again rather than being
    // treated as unchanged text by the screen reader.
    announceTimer.current = setTimeout(() => setAnnouncement(""), 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (announceTimer.current) clearTimeout(announceTimer.current);
    };
  }, []);

  // --- derived ------------------------------------------------------------
  const itemCount = useMemo(
    () => state.lines.reduce((total, line) => total + line.quantity, 0),
    [state.lines],
  );

  const subtotal = useMemo(() => {
    if (state.lines.length === 0) return money(0);
    return sum(state.lines.map((line) => multiply(line.unitPrice, line.quantity)));
  }, [state.lines]);

  // --- actions ------------------------------------------------------------
  const add = useCallback(
    (line: CartLine) => {
      dispatch({ type: "add", line });
      announce(`${line.name} added to your bag.`);
      setIsOpen(true);
    },
    [announce],
  );

  const setQuantity = useCallback(
    (variationId: string, quantity: number) => {
      dispatch({ type: "setQuantity", variationId, quantity });
      announce(quantity <= 0 ? "Item removed from your bag." : `Quantity updated to ${quantity}.`);
    },
    [announce],
  );

  const remove = useCallback(
    (variationId: string) => {
      const line = state.lines.find((entry) => entry.variationId === variationId);
      dispatch({ type: "remove", variationId });
      announce(line ? `${line.name} removed from your bag.` : "Item removed from your bag.");
    },
    [announce, state.lines],
  );

  const setGift = useCallback((gift: GiftOptions) => dispatch({ type: "setGift", gift }), []);
  const clear = useCallback(() => dispatch({ type: "clear" }), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines: state.lines,
      gift: state.gift,
      ready,
      itemCount,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      add,
      setQuantity,
      remove,
      setGift,
      clear,
      announcement,
    }),
    [
      state.lines,
      state.gift,
      ready,
      itemCount,
      subtotal,
      isOpen,
      openCart,
      closeCart,
      add,
      setQuantity,
      remove,
      setGift,
      clear,
      announcement,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside <CartProvider>.");
  return context;
}
