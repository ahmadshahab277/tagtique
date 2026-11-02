import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Truck,
  ArrowRight,
  PackageCheck,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  PhoneCall
} from 'lucide-react';

export default function OrderConfirmationPage() {
  const { lastOrder } = useCart();
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch (_) {}
  }, []);

  const handleCopyOrder = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!lastOrder) {
    return (
      <div className="min-h-[70vh] bg-[#08090D] text-white flex items-center justify-center px-4 font-manrope">
        <div className="max-w-md w-full bg-[#12131A] border border-white/10 rounded-3xl p-8 text-center flex flex-col items-center gap-4 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20">
            <PackageCheck className="w-8 h-8" />
          </div>
          <h1 className="font-extrabold text-2xl text-white">No active order found</h1>
          <p className="text-xs text-white/60">
            Pick a smart tag or NFC card from our catalog to place your first order.
          </p>
          <Link
            to="/catalog"
            className="w-full py-3.5 px-6 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm transition-all mt-2"
          >
            Explore Catalog
          </Link>
        </div>
      </div>
    );
  }

  const order = lastOrder;
  const items = order.items || [];

  return (
    <div className="min-h-screen bg-[#08090D] text-white font-manrope selection:bg-amber-400 selection:text-black py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        
        {/* ================= HERO CONFIRMATION RECEIPT CARD ================= */}
        <div className="bg-[#12131A] border border-white/15 rounded-3xl p-8 sm:p-12 shadow-2xl flex flex-col items-center text-center gap-6 relative overflow-hidden">
          
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Animated Glowing Emerald Emblem */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center border-2 border-emerald-400/40 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="flex flex-col gap-2 max-w-lg relative z-10">
            <div className="inline-flex items-center gap-2 self-center px-3.5 py-1 rounded-full bg-white/10 border border-white/15">
              <span className="font-mono text-xs font-bold text-amber-400 tracking-wider">
                ORDER CONFIRMED
              </span>
              <span className="text-white/30">•</span>
              <span className="font-mono text-xs font-bold text-white/90">
                {order.orderId}
              </span>
              <button
                type="button"
                onClick={() => handleCopyOrder(order.orderId)}
                className="text-white/60 hover:text-white transition-colors cursor-pointer ml-0.5"
                title="Copy Order ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <h1 className="font-extrabold text-3xl sm:text-4xl text-white tracking-tight mt-1">
              Thank You, {order.customer?.name?.split(' ')[0] || 'Valued Customer'}!
            </h1>
            <p className="text-xs sm:text-sm text-white/70 leading-relaxed">
              Your order has been placed successfully. Our workshop is encoding your dynamic smart tag and preparing express dispatch.
            </p>
          </div>

          {/* Quick Tracking Highlights Pill */}
          <div className="flex flex-wrap items-center justify-center gap-4 py-3 px-6 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-white/80 font-medium">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-amber-400" />
              <span>Estimated Delivery: <strong>1–2 Business Days</strong></span>
            </span>
            <span className="text-white/20">•</span>
            <span>
              Courier: <strong>Doorstep Express (TCS / Leopards / Call Courier)</strong>
            </span>
            <span className="text-white/20">•</span>
            <span>
              Payment: <strong>{order.paymentMethod === 'cod' ? 'Cash on Delivery (Pending)' : 'Direct Bank / Raast'}</strong>
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md pt-2">
            <Link
              to="/catalog"
              className="flex-1 py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={`https://wa.me/923292082080?text=Hi%20Tagtique!%20I%20just%20placed%20order%20%23${order.orderId}.%20Please%20confirm%20my%20dispatch.`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 px-5 rounded-2xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <span>WhatsApp Support</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

        </div>

        {/* ================= ORDER DETAILS & DISPATCH TIMELINE ================= */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Items Ordered */}
          <div className="md:col-span-7 bg-[#12131A] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-4">
            <h2 className="font-extrabold text-lg text-white">Order Summary</h2>

            <div className="divide-y divide-white/[0.08]">
              {items.map((item, idx) => (
                <div key={item.id || idx} className="py-3.5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
                      <QrCode className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white block">
                        {item.name || item.finishName}
                      </span>
                      <span className="text-[11px] font-mono text-white/50 block">
                        Quantity: {item.quantity || 1} • {item.badge || 'Glossy Weatherproof Tag'}
                      </span>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                    Verified
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2 text-xs">
              <div className="flex justify-between text-white/60">
                <span>Doorstep Delivery:</span>
                <span className="text-emerald-400 font-bold">FREE NATIONWIDE</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Setup & Routing:</span>
                <span className="text-emerald-400 font-bold">INCLUDED FREE</span>
              </div>
              {order.totalAmount && (
                <div className="flex justify-between text-sm font-extrabold text-white pt-2 border-t border-white/10">
                  <span>Total Payable:</span>
                  <span className="text-amber-400 font-mono">
                    PKR {Number(order.totalAmount).toLocaleString('en-PK')}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-white/10">
                <span>Dispatch Status:</span>
                <span className="text-emerald-400 font-mono">
                  CONFIRMED
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Delivery Destination & Timeline */}
          <div className="md:col-span-5 flex flex-col gap-6">
            
            {/* Delivery Destination Card */}
            <div className="bg-[#12131A] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-3">
              <h3 className="font-extrabold text-base text-white">Shipping To</h3>
              <div className="text-xs text-white/70 flex flex-col gap-1 leading-relaxed">
                <span className="font-bold text-white text-sm">{order.customer?.name}</span>
                <span className="font-mono">{order.customer?.phone}</span>
                <span>{order.shippingAddress?.address}</span>
                <span className="font-bold text-amber-400">{order.shippingAddress?.city}</span>
                {order.shippingAddress?.note && (
                  <span className="text-white/50 italic mt-1">Note: "{order.shippingAddress.note}"</span>
                )}
              </div>
            </div>

            {/* Visual Step-by-Step Delivery Pipeline */}
            <div className="bg-[#12131A] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-3.5">
              <h3 className="font-extrabold text-base text-white">Fulfillment Process</h3>
              
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[11px] shrink-0">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold block">1. Order Placed</span>
                    <span className="text-white/50 text-[11px]">Details logged and verified</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white">
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold text-[11px] shrink-0 animate-pulse">
                    2
                  </div>
                  <div>
                    <span className="font-bold text-amber-400 block">2. Precision Etching & Encoding</span>
                    <span className="text-white/50 text-[11px]">Laser printing & NFC chip configuration</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white/50">
                  <div className="w-6 h-6 rounded-full bg-white/10 text-white/50 flex items-center justify-center font-bold text-[11px] shrink-0">
                    3
                  </div>
                  <div>
                    <span className="font-bold block">3. Courier Handover</span>
                    <span className="text-[11px]">Dispatched via TCS / Leopards</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white/50">
                  <div className="w-6 h-6 rounded-full bg-white/10 text-white/50 flex items-center justify-center font-bold text-[11px] shrink-0">
                    4
                  </div>
                  <div>
                    <span className="font-bold block">4. Doorstep Arrival</span>
                    <span className="text-[11px]">Pay on delivery & attach to vehicle</span>
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/"
              className="w-full py-3 px-5 rounded-2xl border border-white/15 hover:border-white/30 text-center text-xs font-bold text-white transition-all hover:bg-white/[0.04]"
            >
              Return to Store Homepage
            </Link>

          </div>

        </div>

      </div>
    </div>
  );
}
