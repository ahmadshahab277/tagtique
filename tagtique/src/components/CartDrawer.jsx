import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, CheckCircle2, Truck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CartDrawer({
  isOpen,
  onClose,
  items = [],
  onRemoveItem,
  onClearCart,
  onOpenCustomizer
}) {
  const [checkingOut, setCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => acc + (item.totalPrice || 19), 0);
  const freeShippingThreshold = 25;
  const isFreeShipping = subtotal >= freeShippingThreshold || items.length === 0;
  const shippingFee = isFreeShipping ? 0 : 5;
  const finalTotal = subtotal + shippingFee;

  const handleCheckout = () => {
    setCheckingOut(true);
    setTimeout(() => {
      setCheckingOut(false);
      setOrderComplete(true);
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#F5B21F', '#FFC943', '#2E1B10', '#FFFDF8']
        });
      } catch (_) {}
    }, 1200);
  };

  const handleFinish = () => {
    setOrderComplete(false);
    onClearCart && onClearCart();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-tag-bg border-l-2 border-tag-border shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-5 sm:p-6 border-b border-tag-border bg-tag-card/80 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-tag-amber-deep" />
              <h2 className="font-baloo font-extrabold text-xl sm:text-2xl text-tag-brown">
                Your Bag ({items.length})
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-tag-pill text-tag-brown transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-6 py-3 bg-tag-pill border-b border-tag-border flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-tag-brown">
              <span className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-tag-amber" />
                {isFreeShipping ? 'You unlocked Free Shipping!' : `Add $${freeShippingThreshold - subtotal} more for Free Shipping`}
              </span>
              <span className="font-mono text-[11px]">{Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100))}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-tag-border overflow-hidden">
              <div
                className="h-full bg-tag-amber transition-all duration-300"
                style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
              />
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-4">
            {orderComplete ? (
              <div className="my-auto p-6 rounded-3xl bg-tag-card border border-tag-border text-center flex flex-col items-center gap-4 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-tag-amber text-tag-brown-deep flex items-center justify-center text-3xl font-extrabold border-2 border-tag-brown-deep shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-baloo font-extrabold text-2xl text-tag-brown">
                  Order Confirmed!
                </h3>
                <p className="text-xs sm:text-sm text-tag-brown-muted leading-relaxed font-medium">
                  We have started casting and laser-engraving your custom 3D QR tags. You will receive tracking updates in 3 business days.
                </p>
                <div className="p-3 bg-tag-pill rounded-xl text-xs font-mono text-tag-brown-light font-bold">
                  Order #TQ-2026-9812
                </div>
                <button
                  type="button"
                  onClick={handleFinish}
                  className="amber-gradient-btn w-full py-3 rounded-full text-sm font-extrabold text-tag-brown mt-2"
                >
                  Done
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="my-auto text-center flex flex-col items-center gap-4 p-6">
                <div className="w-20 h-20 rounded-full bg-tag-pill flex items-center justify-center text-tag-brown-light">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="font-baloo font-bold text-xl text-tag-brown">
                  Your bag is currently empty
                </h3>
                <p className="text-xs sm:text-sm text-tag-brown-muted max-w-xs leading-relaxed font-medium">
                  Design your custom 3D QR tag with acrylic finishes, laser engraving, and instant sync.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCustomizer();
                  }}
                  className="amber-gradient-btn px-6 py-3 rounded-full text-sm font-extrabold text-tag-brown"
                >
                  Build your tag now
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {items.map((item, index) => (
                  <div
                    key={item.id || index}
                    className="p-4 rounded-2xl bg-tag-card border border-tag-border flex items-start justify-between gap-3 shadow-warm-sm transition-all hover:border-tag-amber/80"
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-baloo font-bold text-base text-tag-brown">
                          {item.finishName || 'Custom Acrylic Tag'}
                        </span>
                        <span className="font-mono text-xs font-bold text-tag-brown-light">
                          ${item.totalPrice}
                        </span>
                      </div>

                      {item.isEngraved && item.engravedText && (
                        <span className="text-xs text-tag-amber-deep font-semibold">
                          Engraved: "{item.engravedText}"
                        </span>
                      )}

                      <span className="text-xs text-tag-brown-muted">
                        Configured for: <strong>{item.displayName || 'Ayesha Khan'}</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => onRemoveItem(index)}
                      className="p-2 rounded-lg text-tag-brown-subtle hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Drawer Footer (Price Breakdown & Checkout) */}
          {!orderComplete && items.length > 0 && (
            <div className="p-5 sm:p-6 border-t border-tag-border bg-tag-card flex flex-col gap-3 shadow-lg">
              <div className="flex justify-between text-sm text-tag-brown-muted font-medium">
                <span>Subtotal</span>
                <span>${subtotal}</span>
              </div>
              <div className="flex justify-between text-sm text-tag-brown-muted font-medium">
                <span>Shipping</span>
                <span>{isFreeShipping ? 'FREE' : `$${shippingFee}`}</span>
              </div>
              <div className="h-[1px] bg-tag-border my-1" />
              <div className="flex justify-between items-baseline">
                <span className="font-baloo font-bold text-lg text-tag-brown">Total</span>
                <span className="font-baloo font-extrabold text-3xl text-tag-brown">
                  ${finalTotal}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkingOut}
                className="amber-gradient-btn w-full py-3.5 rounded-full text-base font-extrabold text-tag-brown flex items-center justify-center gap-2 shadow-md"
              >
                <span>{checkingOut ? 'Securing order...' : 'Checkout now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
