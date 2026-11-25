"use client";

import Image from "next/image";
import Link from "next/link";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CircleCheck, Minus, Plus, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { getCatalogVariantImage } from "@/lib/bed-color-variants";
import type { FinishId } from "@/lib/bed-color-variants";
import {
  bedMeasurementPrice,
  bedMeasurements,
  formatUGX,
  products,
  type BedMeasurementId,
} from "@/lib/sample-data";

export type CartItem = {
  key: string;
  productId: string;
  imageSizeId: string;
  measurement: BedMeasurementId;
  finishId: FinishId;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  ready: boolean;
  isOpen: boolean;
  confirmation: string;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: Omit<CartItem, "key">) => void;
  setItemQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "homefinds-cart-v1";

function makeCartKey(
  item: Pick<CartItem, "productId" | "imageSizeId" | "measurement" | "finishId">,
) {
  return `${item.productId}:${item.imageSizeId}:${item.measurement}:${item.finishId}`;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as CartItem[];
          if (Array.isArray(parsed)) {
            setItems(parsed.flatMap((item) => {
              const product = products.find((entry) => entry.id === item.productId);
              const validMeasurement = bedMeasurements.some((measurement) => measurement.id === item.measurement);
              const validFinish = product?.finishes.some((finish) => finish.id === item.finishId);
              const legacyImageSize = item.imageSizeId ?? product?.previewSizes.find((size) => size.finishes.includes(item.finishId))?.id ?? product?.defaultImageSize;
              const validImageSize = product?.previewSizes.some((size) => size.id === legacyImageSize && size.finishes.includes(item.finishId));
              if (!product || !validMeasurement || !validFinish || !validImageSize || !Number.isInteger(item.quantity) || item.quantity < 1) return [];
              const normalized = { ...item, imageSizeId: legacyImageSize!, key: "" };
              return [{ ...normalized, key: makeCartKey(normalized), quantity: Math.min(20, item.quantity) }];
            }));
          }
        }
      } catch {
        // Keep the in-memory cart usable if browser storage is unavailable.
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((item: Omit<CartItem, "key">) => {
    const key = makeCartKey(item);
    const productName = products.find((product) => product.id === item.productId)?.shortName ?? "Bed";
    setItems((current) => {
      const existing = current.find((entry) => entry.key === key);
      return existing
        ? current.map((entry) =>
            entry.key === key
              ? { ...entry, quantity: Math.min(20, entry.quantity + item.quantity) }
              : entry,
          )
        : [...current, { ...item, key }];
    });
    setConfirmation(`${productName} added to your bag.`);
    setIsOpen(true);
  }, []);

  const openCart = useCallback(() => {
    setConfirmation("");
    setIsOpen(true);
  }, []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const setItemQuantity = useCallback((key: string, quantity: number) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.key !== key)
        : current.map((item) =>
            item.key === key
              ? { ...item, quantity: Math.min(20, quantity) }
              : item,
          ),
    );
  }, []);

  const removeItem = useCallback(
    (key: string) =>
      setItems((current) => current.filter((item) => item.key !== key)),
    [],
  );
  const clearCart = useCallback(() => setItems([]), []);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + bedMeasurementPrice(item.measurement) * item.quantity,
    0,
  );
  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      ready,
      isOpen,
      confirmation,
      openCart,
      closeCart,
      addItem,
      setItemQuantity,
      removeItem,
      clearCart,
    }),
    [
      items,
      count,
      subtotal,
      ready,
      isOpen,
      confirmation,
      openCart,
      closeCart,
      addItem,
      setItemQuantity,
      removeItem,
      clearCart,
    ],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

function CartDrawer() {
  const {
    items,
    count,
    subtotal,
    isOpen,
    confirmation,
    closeCart,
    setItemQuantity,
    removeItem,
  } = useCart();
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("cart-drawer-open");
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("cart-drawer-open");
    };
  }, [isOpen, closeCart]);

  return (
    <div
      className={`cart-drawer-backdrop ${isOpen ? "is-open" : ""}`}
      aria-hidden={!isOpen}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeCart();
      }}
    >
      <aside
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        aria-hidden={!isOpen}
      >
        <header className="cart-drawer-header">
          <div>
            <span className="cart-drawer-eyebrow">HOME FINDS</span>
            <h2 id="cart-drawer-title">
              Your Bag <small>({count})</small>
            </h2>
          </div>
          <button
            type="button"
            className="cart-drawer-close"
            onClick={closeCart}
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </header>
        {confirmation && (
          <p className="cart-added-confirmation" role="status">
            <CircleCheck size={17} /> {confirmation}
          </p>
        )}
        {items.length === 0 ? (
          <div className="cart-empty">
            <span>
              <ShoppingBag size={25} />
            </span>
            <h3>Your bag is empty</h3>
            <p>Choose a bed design and add it to your bag.</p>
            <button type="button" onClick={closeCart}>
              Keep shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-drawer-items">
              {items.map((item) => {
                const product = products.find(
                  (entry) => entry.id === item.productId,
                );
                const finish = product?.finishes.find(
                  (entry) => entry.id === item.finishId,
                );
                const measurement = bedMeasurements.find(
                  (entry) => entry.id === item.measurement,
                );
                if (!product || !finish || !measurement) return null;
                const unitPrice = bedMeasurementPrice(item.measurement);
                return (
                  <article className="cart-drawer-item" key={item.key}>
                    <div className="cart-drawer-image">
                      <Image
                        src={getCatalogVariantImage(
                          product.configuratorDesign,
                          item.imageSizeId,
                          finish.id,
                          "dressed",
                        )}
                        alt={`${product.alt}, ${finish.name}`}
                        fill
                        sizes="110px"
                      />
                    </div>
                    <div className="cart-drawer-item-copy">
                      <h3>{product.name}</h3>
                      <p>
                        {finish.name} <span>·</span> {measurement.label}
                      </p>
                      <p>Image concept: {product.previewSizes.find((size) => size.id === item.imageSizeId)?.label}</p>
                      <strong>{formatUGX(unitPrice)}</strong>
                      <div className="cart-line-controls">
                        <div
                          className="cart-quantity"
                          aria-label={`Quantity for ${product.shortName}, ${measurement.label}, ${finish.name}`}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setItemQuantity(item.key, item.quantity - 1)
                            }
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setItemQuantity(item.key, item.quantity + 1)
                            }
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                        <button
                          type="button"
                          className="cart-remove"
                          onClick={() => removeItem(item.key)}
                        >
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                    <strong className="cart-line-total">
                      {formatUGX(unitPrice * item.quantity)}
                    </strong>
                  </article>
                );
              })}
            </div>
            <footer className="cart-drawer-footer">
              <div className="cart-subtotal">
                <span>Subtotal</span>
                <strong>{formatUGX(subtotal)}</strong>
              </div>
              <div className="cart-delivery-note">
                <Truck size={18} />
                <span>
                  Estimated delivery <b>2–4 days</b>
                </span>
              </div>
              <p className="cart-fee-note">
                Delivery fee can be confirmed with Home Finds before payment.
              </p>
              <Link
                className="cart-checkout-button"
                href="/checkout"
                onClick={closeCart}
              >
                Continue to checkout <span aria-hidden="true">→</span>
              </Link>
              <button
                type="button"
                className="cart-continue-button"
                onClick={closeCart}
              >
                Continue shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
