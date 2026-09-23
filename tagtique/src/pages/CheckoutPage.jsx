import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShieldCheck, Truck, CreditCard, ChevronRight, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function CheckoutPage() {
  const { cartItems, completeOrder, userProfile } = useCart();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState(userProfile.email || 'ayesha@tagtique.co');
  const [firstName, setFirstName] = useState('Ayesha');
  const [lastName, setLastName] = useState('Khan');
  const [address, setAddress] = useState('House 42, Street 7, Block G, Phase 5, DHA');
  const [apartment, setApartment] = useState('Apartment 3B');
  const [city, setCity] = useState('Lahore');
  const [stateProvince, setStateProvince] = useState('Punjab');
  const [postalCode, setPostalCode] = useState('54792');
  const [country, setCountry] = useState('Pakistan');
  const [phone, setPhone] = useState('+92 300 114 2288');

  // Shipping & Payment selection
  const [shippingMethod, setShippingMethod] = useState('standard'); // 'standard' | 'express'
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'applepay'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.length > 0 
    ? cartItems.reduce((acc, item) => acc + (item.totalPrice || 1499), 0)
    : 1499;
  const isFreeStandard = true;
  const shippingFee = shippingMethod === 'express' ? 500 : 0;
  const finalTotal = subtotal + shippingFee;

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const generatedOrderId = 'TQ-' + Math.floor(10000 + Math.random() * 90000);
    const orderData = {
      orderId: generatedOrderId,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      customer: {
        name: `${firstName} ${lastName}`,
        email,
        phone
      },
      shippingAddress: {
        address,
        apartment,
        city,
        stateProvince,
        postalCode,
        country
      },
      shippingMethod,
      shippingFee,
      paymentMethod,
      items: cartItems.length > 0 ? cartItems : [
        {
          id: 1,
          finishName: 'Cream acrylic',
          basePrice: 1499,
          isEngraved: true,
          engravedText: 'Ayesha Khan',
          totalPrice: 1499
        }
      ],
      subtotal,
      finalTotal: finalTotal || 1499
    };

    setTimeout(() => {
      completeOrder(orderData);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#F5B21F', '#2E1B10', '#FFFDF8']
        });
      } catch (_) {}
      navigate('/order-confirmation');
    }, 900);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-manrope">
      
      {/* Breadcrumb Steps */}
      <div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-[1.4px] text-tag-brown-light mb-8">
        <Link to="/order" className="hover:text-tag-amber-deep">BUILD TAG</Link>
        <span className="text-tag-border">/</span>
        <span className="text-tag-brown">SHIPPING ADDRESS & PAYMENT</span>
        <span className="text-tag-border">/</span>
        <span className="text-tag-brown-subtle">CONFIRMATION</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* Left Form Column: Address & Payment */}
        <form onSubmit={handleSubmitOrder} className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Section 1: Contact Information */}
          <div className="flex flex-col gap-4 bg-tag-card border border-tag-border rounded-3xl p-6 sm:p-7 shadow-warm-sm">
            <div className="flex justify-between items-baseline">
              <h2 className="font-baloo font-extrabold text-2xl text-tag-brown">
                1. Contact Details
              </h2>
              <span className="text-xs text-tag-brown-muted font-medium">For tracking notifications</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-tag-brown">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-tag-brown">Phone number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+92 300 114 2288"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery / Shipping Address */}
          <div className="flex flex-col gap-4 bg-tag-card border border-tag-border rounded-3xl p-6 sm:p-7 shadow-warm-sm">
            <h2 className="font-baloo font-extrabold text-2xl text-tag-brown">
              2. Delivery Address
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-tag-brown">First name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ayesha"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-tag-brown">Last name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Khan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-tag-brown">Street address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / Street / Building number"
                className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-tag-brown">Apartment, suite, unit (optional)</label>
              <input
                type="text"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                placeholder="Apartment 3B, Floor 2"
                className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-tag-brown">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Lahore"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-tag-brown">State / Province</label>
                <input
                  type="text"
                  required
                  value={stateProvince}
                  onChange={(e) => setStateProvince(e.target.value)}
                  placeholder="Punjab"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-tag-brown">Postal Code</label>
                <input
                  type="text"
                  required
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="54792"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-tag-brown">Country / Region</label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown font-semibold outline-none focus:border-tag-amber"
              >
                <option value="Pakistan">Pakistan</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United Arab Emirates">United Arab Emirates</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
              </select>
            </div>
          </div>

          {/* Section 3: Delivery Speed */}
          <div className="flex flex-col gap-4 bg-tag-card border border-tag-border rounded-3xl p-6 sm:p-7 shadow-warm-sm">
            <h2 className="font-baloo font-extrabold text-2xl text-tag-brown">
              3. Delivery Option
            </h2>

            <div className="flex flex-col gap-3">
              <label
                onClick={() => setShippingMethod('standard')}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  shippingMethod === 'standard'
                    ? 'border-tag-amber bg-tag-bg shadow-xs ring-1 ring-tag-amber'
                    : 'border-tag-border bg-tag-card hover:bg-tag-bg/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="accent-tag-amber"
                  />
                  <div>
                    <div className="font-bold text-sm text-tag-brown">
                      Standard Tracked Shipping
                    </div>
                    <div className="text-xs text-tag-brown-muted">
                      Dispatched in 3 days · Delivery in 3–5 business days
                    </div>
                  </div>
                </div>
                <span className="font-bold text-sm text-tag-brown">
                  {isFreeStandard ? 'FREE' : 'PKR 250'}
                </span>
              </label>

              <label
                onClick={() => setShippingMethod('express')}
                className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  shippingMethod === 'express'
                    ? 'border-tag-amber bg-tag-bg shadow-xs ring-1 ring-tag-amber'
                    : 'border-tag-border bg-tag-card hover:bg-tag-bg/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    className="accent-tag-amber"
                  />
                  <div>
                    <div className="font-bold text-sm text-tag-brown">
                      Express Courier Priority
                    </div>
                    <div className="text-xs text-tag-brown-muted">
                      Priority workshop casting · 1–2 business days delivery
                    </div>
                  </div>
                </div>
                <span className="font-bold text-sm text-tag-brown">+PKR 500</span>
              </label>
            </div>
          </div>

          {/* Section 4: Payment Method */}
          <div className="flex flex-col gap-4 bg-tag-card border border-tag-border rounded-3xl p-6 sm:p-7 shadow-warm-sm">
            <div className="flex justify-between items-baseline">
              <h2 className="font-baloo font-extrabold text-2xl text-tag-brown">
                4. Payment Method
              </h2>
              <span className="flex items-center gap-1 text-xs text-emerald-700 font-bold">
                <Lock className="w-3.5 h-3.5" />
                256-bit SSL Encrypted
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {[
                { id: 'cod', label: 'Cash on Delivery' },
                { id: 'applepay', label: 'Direct Bank Transfer / Raast' }
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaymentMethod(p.id)}
                  className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-bold border transition-all text-center ${
                    paymentMethod === p.id
                      ? 'bg-tag-brown text-[#FDF7EC] border-tag-brown shadow-xs'
                      : 'bg-tag-card border-tag-border text-tag-brown hover:bg-tag-pill'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {paymentMethod === 'cod' && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold leading-relaxed animate-fadeIn">
                Cash on delivery is active. You will pay the courier rider at your doorstep upon inspecting your packaged 3D tag.
              </div>
            )}

            {paymentMethod === 'applepay' && (
              <div className="p-4 rounded-2xl bg-tag-bg border border-tag-border text-xs font-bold text-tag-brown text-center animate-fadeIn rounded-2xl">
                Instant payment via Raast ID / Meezan / HBL / Sadapay / Nayapay.
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="amber-gradient-btn w-full py-4 rounded-full text-base sm:text-lg font-extrabold text-tag-brown shadow-warm-md active:scale-98"
          >
            <span>{isSubmitting ? 'Securing your order...' : `Complete Order · PKR ${finalTotal.toLocaleString()}`}</span>
          </button>
        </form>

        {/* Right Column: Order Summary Sidebar */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky lg:top-24">
          <div className="bg-tag-card border-[1.5px] border-tag-border rounded-3xl p-6 sm:p-7 shadow-warm-md flex flex-col gap-5">
            <h3 className="font-baloo font-extrabold text-2xl text-tag-brown">
              Order Summary ({cartItems.length || 1})
            </h3>

            {/* Item List */}
            <div className="flex flex-col gap-3.5">
              {(cartItems.length > 0 ? cartItems : [
                {
                  id: 1,
                  finishName: 'Cream Acrylic',
                  basePrice: 1499,
                  isEngraved: true,
                  engravedText: 'Ali Khan',
                  totalPrice: 1499,
                  displayName: 'Ali Khan'
                }
              ]).map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3.5 rounded-2xl bg-tag-bg border border-tag-border/70 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="font-baloo font-bold text-sm text-tag-brown">
                      {item.finishName}
                    </span>
                    {item.isEngraved && item.engravedText && (
                      <span className="text-tag-amber-deep font-semibold">
                        Laser Etched: "{item.engravedText}"
                      </span>
                    )}
                    <span className="text-tag-brown-muted">
                      Card linked to: <strong>{item.displayName || 'Ali Khan'}</strong>
                    </span>
                  </div>
                  <span className="font-mono font-bold text-sm text-tag-brown">
                    PKR {item.totalPrice?.toLocaleString() || '1,499'}
                  </span>
                </div>
              ))}
            </div>

            <div className="h-[1px] bg-tag-border/60" />

            {/* Calculations */}
            <div className="flex flex-col gap-2 text-sm text-tag-brown-muted font-medium">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono font-bold">PKR {subtotal.toLocaleString() || '1,499'}</span>
              </div>
              <div className="flex justify-between">
                <span>Doorstep Courier (Pakistan)</span>
                <span className="font-bold text-emerald-700">
                  {shippingMethod === 'express'
                    ? 'PKR 500 (Express)'
                    : 'FREE'}
                </span>
              </div>
            </div>

            <div className="h-[1px] bg-tag-border" />

            <div className="flex justify-between items-baseline">
              <span className="font-baloo font-bold text-xl text-tag-brown">Total</span>
              <span className="font-baloo font-extrabold text-3xl text-tag-brown">
                PKR {finalTotal.toLocaleString() || '1,499'}
              </span>
            </div>

            {/* Guarantees */}
            <div className="pt-2 flex flex-col gap-2 text-xs text-tag-brown-muted border-t border-tag-border/60">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-tag-brown-light" />
                <span>Dispatched express across Pakistan from our workshop</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>1-Year free physical replacement guarantee</span>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
