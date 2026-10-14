import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { CheckCircle2, Truck, Eye } from 'lucide-react';

export default function OrderConfirmationPage() {
  const { lastOrder } = useCart();

  if (!lastOrder) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center font-manrope flex flex-col items-center gap-4">
        <h1 className="font-baloo font-extrabold text-3xl text-tag-brown">No order yet</h1>
        <p className="text-sm text-tag-brown-muted">Place an order and the receipt will show up here.</p>
        <Link to="/order" className="amber-gradient-btn px-6 py-3 rounded-full text-sm font-extrabold text-tag-brown">
          Order stickers
        </Link>
      </div>
    );
  }

  const order = lastOrder;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 font-manrope">
      
      {/* Header Confirmation Card */}
      <div className="bg-tag-card border-[2px] border-tag-border rounded-3xl p-8 sm:p-12 shadow-warm-lg flex flex-col items-center text-center gap-6">
        
        {/* Checkmark icon */}
        <div className="w-20 h-20 rounded-full bg-tag-amber text-tag-brown-deep flex items-center justify-center border-2 border-tag-brown-deep shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="flex flex-col gap-2 max-w-lg">
          <span className="font-mono text-xs font-bold tracking-[1.6px] text-tag-brown-light uppercase">
            ORDER CONFIRMED · {order.orderId}
          </span>
          <h1 className="font-baloo font-extrabold text-3xl sm:text-5xl text-tag-brown leading-tight">
            Thank you, {order.customer.name.split(' ')[0]}!
          </h1>
          <p className="text-sm sm:text-base text-tag-brown-muted leading-relaxed font-medium">
            We have received your order and started preparing your custom 3D QR tag. A receipt has been sent to <strong>{order.customer.email}</strong>.
          </p>
        </div>

        {/* Tracking pill */}
        <div className="flex flex-wrap items-center justify-center gap-4 py-3 px-6 rounded-2xl bg-tag-bg border border-tag-border text-xs sm:text-sm font-semibold text-tag-brown">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-tag-brown-light" />
            Estimated Dispatch: <strong>In 1–2 business days</strong>
          </span>
          <span className="text-tag-border">·</span>
          <span>
            Delivery: <strong>Doorstep Express Delivery (TCS / Leopard / Call Courier)</strong>
          </span>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2 w-full max-w-md">
          <Link
            to={`/scan?token=${encodeURIComponent(
              order.targetToken ||
              order.items?.[0]?.qrToken ||
              order.items?.[0]?.vehicleNumber ||
              order.orderId
            )}`}
            className="amber-gradient-btn w-full sm:w-auto flex-1 py-3.5 px-6 rounded-full text-sm font-extrabold text-tag-brown flex items-center justify-center gap-2 shadow-sm"
          >
            <Eye className="w-4 h-4" />
            <span>Test your live scanned card</span>
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto py-3.5 px-6 rounded-full border-2 border-tag-border hover:border-tag-amber bg-tag-bg text-sm font-bold text-tag-brown transition-colors text-center"
          >
            Back to homepage
          </Link>
        </div>

      </div>

      {/* Order Details & Summary Card */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Ordered Items */}
        <div className="md:col-span-7 bg-tag-card border border-tag-border rounded-3xl p-6 sm:p-7 shadow-warm-sm flex flex-col gap-4">
          <h2 className="font-baloo font-extrabold text-2xl text-tag-brown">
            Order Items
          </h2>

          <div className="flex flex-col gap-3">
            {order.items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-4 rounded-2xl bg-tag-bg border border-tag-border flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-baloo font-bold text-base text-tag-brown">
                    {item.finishName} {item.displayName ? `· ${item.displayName}` : ''}
                  </span>
                  {item.vehicleNumber && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-tag-pill border border-tag-border text-tag-amber-deep font-mono font-bold text-[11px]">
                        Plate: {item.vehicleNumber}
                      </span>
                      <Link
                        to={`/scan?token=${encodeURIComponent(item.qrToken || item.vehicleNumber)}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-tag-amber-deep hover:underline"
                        title="Preview live card for this sticker"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Card</span>
                      </Link>
                    </div>
                  )}
                  {item.isEngraved && item.engravedText && (
                    <span className="text-tag-amber-deep font-semibold">
                      Custom laser etching: "{item.engravedText}"
                    </span>
                  )}
                  <span className="text-tag-brown-muted">
                    High-gloss waterproof vinyl sticker · Weatherproof & UV safe
                  </span>
                </div>
                <span className="font-mono font-bold text-sm text-tag-brown">
                  PKR {item.totalPrice?.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="h-[1px] bg-tag-border/60 my-1" />

          <div className="flex flex-col gap-2 text-xs sm:text-sm text-tag-brown-muted font-medium">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono font-bold">PKR {order.subtotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Doorstep Delivery (Pakistan)</span>
              <span className="font-bold text-emerald-700">{order.shippingFee === 0 ? 'FREE' : `PKR ${order.shippingFee}`}</span>
            </div>
            <div className="flex justify-between font-bold text-tag-brown text-base pt-1 border-t border-tag-border/60">
              <span>Total Due / Paid</span>
              <span className="font-baloo text-xl font-extrabold text-tag-brown">
                PKR {order.finalTotal?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Shipping Address & Next Steps */}
        <div className="md:col-span-5 flex flex-col gap-6">
          {/* Address box */}
          <div className="bg-tag-card border border-tag-border rounded-3xl p-6 sm:p-7 shadow-warm-sm flex flex-col gap-3">
            <h3 className="font-baloo font-extrabold text-xl text-tag-brown">
              Shipping Destination
            </h3>
            <div className="text-xs sm:text-sm text-tag-brown leading-relaxed font-medium">
              <div className="font-bold">{order.customer.name}</div>
              <div>{order.shippingAddress.address}</div>
              {order.shippingAddress.apartment && <div>{order.shippingAddress.apartment}</div>}
              <div>
                {order.shippingAddress.city}, {order.shippingAddress.stateProvince} {order.shippingAddress.postalCode}
              </div>
              <div className="font-semibold text-tag-brown-light">{order.shippingAddress.country}</div>
              <div className="pt-2 text-tag-brown-muted">{order.customer.phone}</div>
            </div>
          </div>

          {/* Next steps box */}
          <div className="bg-tag-card border border-tag-border rounded-3xl p-6 sm:p-7 shadow-warm-sm flex flex-col gap-3 text-xs sm:text-sm">
            <h3 className="font-baloo font-extrabold text-xl text-tag-brown">
              What happens next?
            </h3>
            <div className="flex flex-col gap-3 text-tag-brown-muted leading-relaxed font-medium">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-tag-pill font-bold text-xs text-tag-brown flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </span>
                <span>Our artisans in Faisalabad & Lahore precision cast and seal your tag's QR core.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-tag-pill font-bold text-xs text-tag-brown flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </span>
                <span>Optical scan calibration ensures instant reads on iOS & Android cameras.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-tag-pill font-bold text-xs text-tag-brown flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </span>
                <span>Dispatched securely in protective eco-felt sleeves with tracking.</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
