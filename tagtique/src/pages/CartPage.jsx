import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderBackendService } from '../services/orderBackendService';
import { findNfcDesign, NFC_DESIGNS, NFC_CARD_PRICE_PKR } from '../data/nfcCards';
import { EDITIONS, findEdition } from '../data/editions';
import {
  calculateStickerPrice,
  calculateItemTotal,
  isCompactTarget,
  PRICING_CONFIG
} from '../data/pricing';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  CreditCard,
  Banknote,
  CheckCircle2,
  ArrowRight,
  Lock,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  QrCode,
  PackageCheck
} from 'lucide-react';

const POPULAR_CITIES = [
  'Faisalabad',
  'Lahore',
  'Islamabad',
  'Karachi',
  'Rawalpindi',
  'Multan',
  'Peshawar',
  'Sialkot',
  'Gujranwala'
];

export default function CartPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart, completeOrder, userProfile } = useCart();

  // Local state for items in checkout (derived from cart or query param item)
  const [directItem, setDirectItem] = useState(() => {
    const nfcId = searchParams.get('nfc');
    if (nfcId) {
      const design = findNfcDesign(nfcId);
      if (design) {
        return {
          id: `nfc-${design.id}`,
          name: design.name,
          category: design.category,
          editionCode: design.code,
          type: 'nfc',
          price: NFC_CARD_PRICE_PKR || 1999,
          quantity: 1,
          accent: design.accent || '#F59E0B',
          image: design.frontImage || design.previewImg || null,
          badge: 'NFC Metal Card + Dynamic QR'
        };
      }
    }

    const editionId = searchParams.get('edition');
    const styleId = searchParams.get('style');
    const pkg = searchParams.get('package');
    const target = searchParams.get('target') || 'mobile';

    if (editionId || styleId || pkg) {
      const ed = findEdition(editionId) || EDITIONS[0];
      const style = ed.styles.find((s) => s.id === styleId) || ed.styles[0];
      const qty = pkg === 'pack3' ? 3 : pkg === 'pack2' ? 2 : 1;
      const price = calculateStickerPrice(target, qty);

      return {
        id: `sticker-${ed.id}-${style.id}-${target}`,
        name: style.name,
        category: ed.name,
        type: 'sticker',
        target,
        price,
        quantity: qty,
        accent: style.swatch || '#F59E0B',
        image: style.image || null,
        badge: `${qty === 1 ? 'Single Sticker' : qty + '-Pack'} • ${target === 'vehicle' ? 'Vehicle Fit' : target === 'laptop' ? 'MacBook Fit' : target === 'sticker' ? 'Die-Cut Vinyl' : 'iPhone Fit'}`
      };
    }

    return null;
  });

  // Effective items list to checkout
  const effectiveItems = useMemo(() => {
    const resolveItemData = (item) => {
      let image = item.image || item.src || null;
      const isNfc = item.type === 'nfc' || item.id?.startsWith('nfc-');
      if (!image && isNfc) {
        const nfcId = item.nfcId || item.id?.replace(/^nfc-/, '');
        const found = findNfcDesign(nfcId) || (NFC_DESIGNS || []).find((d) => d.name?.toLowerCase() === item.name?.toLowerCase());
        if (found?.frontImage) {
          image = found.frontImage;
        }
      }

      const itemTarget = item.target || (
        item.badge?.toLowerCase().includes('vehicle') || item.id?.includes('vehicle')
          ? 'vehicle'
          : item.badge?.toLowerCase().includes('laptop') || item.id?.includes('laptop')
          ? 'laptop'
          : item.badge?.toLowerCase().includes('sticker') || item.id?.includes('sticker-only')
          ? 'sticker'
          : 'mobile'
      );

      return {
        id: item.id,
        name: item.name || item.finishName || 'Custom Smart Tag',
        category: item.category || item.edition || (isNfc ? 'Executive Hardware' : 'Custom Identity'),
        type: isNfc ? 'nfc' : (item.type || 'sticker'),
        target: itemTarget,
        price: Number(item.price || item.totalPrice || item.basePrice || 600),
        quantity: Number(item.quantity || 1),
        accent: item.accent || '#F59E0B',
        image,
        badge: item.badge || (isNfc ? 'NFC Metal Card + Dynamic QR' : 'Glossy Weatherproof Tag')
      };
    };

    if (cartItems && cartItems.length > 0) {
      return cartItems.map((item, idx) => resolveItemData({ ...item, id: item.id || `cart-item-${idx}` }));
    }
    if (directItem) {
      return [resolveItemData(directItem)];
    }
    return [];
  }, [cartItems, directItem]);

  // Form Fields
  const [fullName, setFullName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Faisalabad');
  const [deliveryNote, setDeliveryNote] = useState('');

  // Payment method: 'cod' | 'raast'
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Copy states for Raast / IBAN
  const [copiedRaast, setCopiedRaast] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);

  // 3D Preview Carousel in Order Summary
  const [orderPreviewIndex, setOrderPreviewIndex] = useState(0);
  const [previewTilt, setPreviewTilt] = useState({ x: 0, y: 0 });

  const handlePreviewMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setPreviewTilt({ x: x * 16, y: -y * 16 });
  };

  const handlePreviewMouseLeave = () => {
    setPreviewTilt({ x: 0, y: 0 });
  };

  const safePreviewIndex = Math.min(orderPreviewIndex, Math.max(0, effectiveItems.length - 1));
  const currentPreviewItem = effectiveItems[safePreviewIndex];

  const subtotal = effectiveItems.reduce((acc, it) => acc + calculateItemTotal(it), 0);
  const shippingFee = 0; // FREE Doorstep Delivery
  const finalTotal = subtotal + shippingFee;

  const handleCopy = (text, type) => {
    navigator.clipboard?.writeText(text);
    if (type === 'raast') {
      setCopiedRaast(true);
      setTimeout(() => setCopiedRaast(false), 2000);
    } else {
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    }
  };

  const handleQuantityChange = (delta) => {
    if (directItem) {
      const newQty = Math.max(1, Math.min(10, directItem.quantity + delta));
      let newPrice;
      if (directItem.type === 'nfc') {
        newPrice = (NFC_CARD_PRICE_PKR || 1999) * newQty;
      } else {
        newPrice = calculateStickerPrice(directItem.target || 'mobile', newQty);
      }
      setDirectItem({
        ...directItem,
        quantity: newQty,
        price: newPrice
      });
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name for the package delivery label.');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMsg('Please enter a valid Pakistani phone number (e.g. 0321-1234567) so the courier rider can reach you.');
      return;
    }
    if (!address.trim()) {
      setErrorMsg('Please provide your complete delivery street/house address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const generatedOrderNumber = 'TGT-' + Math.floor(100000 + Math.random() * 900000);

      // Create payload matching orderBackendService.createOrder schema
      const orderPayload = {
        customer: {
          name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim() || `${phone.replace(/\D/g, '')}@tagtique.pk`,
          address: address.trim(),
          city: city.trim()
        },
        vehicles: effectiveItems.map((item, idx) => ({
          name: item.name,
          vehicleNumber: `TAG-${item.editionCode || idx + 1}`,
          vehicleType: item.type === 'nfc' ? 'NFC Smart Card' : 'Vehicle QR Tag',
          displayName: item.name,
          phone: phone.trim(),
          emergencyPhone: ''
        })),
        packageType: effectiveItems.length > 2 ? 'pack3' : effectiveItems.length === 2 ? 'pack2' : 'single',
        totalAmount: finalTotal,
        paymentStatus: paymentMethod === 'cod' ? 'pending_cod' : 'pending_transfer',
        deliveryStatus: 'processing',
        tagMaterial: effectiveItems.some((it) => it.type === 'nfc') ? 'nfc_metal' : 'glossy_vinyl',
        shippingAddress: {
          address: address.trim(),
          city: city.trim(),
          phone: phone.trim(),
          deliveryNote: deliveryNote.trim()
        }
      };

      // 1. Submit order locally
      const result = await orderBackendService.createOrder(orderPayload);
      const activeOrderId = result?.orderNumber || generatedOrderNumber;
      const targetToken = result?.targetToken || result?.rows?.[0]?.token || activeOrderId;

      // 2. Commit order into CartContext
      const completedOrderData = {
        orderId: activeOrderId,
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }),
        customer: {
          name: fullName.trim(),
          phone: phone.trim(),
          email: email.trim()
        },
        shippingAddress: {
          address: address.trim(),
          city: city.trim(),
          note: deliveryNote.trim()
        },
        paymentMethod,
        items: effectiveItems,
        subtotal,
        finalTotal,
        targetToken
      };

      completeOrder(completedOrderData);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (_) {}

      // Navigate to confirmed receipt
      navigate('/order-confirmation');
    } catch (err) {
      console.error('Order placement error:', err);
      setErrorMsg('Could not process order. Please try again or tap the WhatsApp button for direct assistance.');
      setIsSubmitting(false);
    }
  };

  if (effectiveItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#08090D] text-white font-manrope selection:bg-amber-400 selection:text-black pb-24">
        {/* Top Banner Notice */}
        <div className="w-full bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-b border-white/10 py-2 px-4 text-center">
          <p className="text-xs font-semibold text-amber-300 flex items-center justify-center gap-2">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>Free Doorstep Courier Delivery & Cash on Delivery Available Across Pakistan</span>
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {/* Navigation Breadcrumb Steps */}
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-white/50 mb-8 flex-wrap">
            <Link to="/" className="hover:text-amber-400 transition-colors">STORE</Link>
            <ChevronRight className="w-3 h-3 text-white/30" />
            <span className="text-amber-400 font-extrabold flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" />
              CART
            </span>
          </div>

          <div className="min-h-[55vh] flex items-center justify-center py-6">
            <div className="max-w-md w-full bg-[#12131A] border border-white/10 rounded-[32px] p-8 sm:p-10 text-center flex flex-col items-center gap-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden backdrop-blur-xl">
              {/* Ambient amber glow */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              {/* Empty Cart Icon */}
              <div className="w-20 h-20 rounded-3xl bg-amber-400/10 text-amber-400 flex items-center justify-center border border-amber-400/20 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
                <ShoppingBag className="w-9 h-9" />
              </div>

              <div className="flex flex-col gap-2">
                <h1 className="font-extrabold text-2xl sm:text-3xl text-white font-manrope">
                  Your cart is empty
                </h1>
                <p className="text-xs sm:text-sm text-white/60 leading-relaxed">
                  Looks like you haven't added any smart vehicle tags or NFC cards to your cart yet.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
                <Link
                  to="/catalog"
                  className="flex-1 py-3.5 px-5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/#nfc"
                  className="flex-1 py-3.5 px-5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>NFC Cards</span>
                </Link>
              </div>

              {/* Quick Perks Footer */}
              <div className="pt-6 border-t border-white/10 w-full grid grid-cols-2 gap-3 text-left">
                <div className="flex items-center gap-2 text-white/70 text-xs">
                  <Truck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Free Delivery</span>
                </div>
                <div className="flex items-center gap-2 text-white/70 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Cash on Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08090D] text-white font-manrope selection:bg-amber-400 selection:text-black pb-24">
      {/* Top Banner Notice */}
      <div className="w-full bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border-b border-white/10 py-2 px-4 text-center">
        <p className="text-xs font-semibold text-amber-300 flex items-center justify-center gap-2">
          <Truck className="w-3.5 h-3.5 text-amber-400" />
          <span>Free Doorstep Courier Delivery & Cash on Delivery Available Across Pakistan</span>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Breadcrumb Steps */}
        <div className="flex items-center gap-2 font-mono text-xs font-bold text-white/50 mb-8 flex-wrap">
          <Link to="/" className="hover:text-amber-400 transition-colors">STORE</Link>
          <ChevronRight className="w-3 h-3 text-white/30" />
          <span className="text-amber-400 font-extrabold flex items-center gap-1.5">
            <ShoppingBag className="w-3.5 h-3.5" />
            CART & CHECKOUT
          </span>
          <ChevronRight className="w-3 h-3 text-white/30" />
          <span className="text-white/30">CONFIRMATION</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ================= LEFT COLUMN: CART ITEMS & CHECKOUT FORM ================= */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* CARD 1: Selected Order Items */}
            <div className="bg-[#12131A] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-amber-400/15 text-amber-400 font-mono font-bold text-xs flex items-center justify-center border border-amber-400/30">
                    1
                  </span>
                  <h2 className="font-extrabold text-lg text-white">Your Smart Tag Order</h2>
                </div>
                <Link
                  to="/catalog"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                >
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {/* Items List */}
              <div className="divide-y divide-white/[0.08] mt-2">
                {effectiveItems.map((item, index) => (
                  <div key={item.id || index} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Product Thumbnail */}
                      <div 
                        className={`w-14 h-14 rounded-2xl border border-white/15 bg-[#181824] flex items-center justify-center ${item.type === 'nfc' ? 'p-1' : 'p-1.5'} shrink-0 overflow-hidden relative shadow-inner`}
                      >
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className={`w-full h-full ${item.type === 'nfc' ? 'object-cover rounded-xl shadow-xs' : 'object-contain'}`} 
                          />
                        ) : (
                          <QrCode className="w-7 h-7 text-amber-400/80" />
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                            {item.category}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white/70">
                            {item.badge}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base text-white truncate mt-0.5">
                          {item.name}
                        </h3>
                        <span className="text-xs text-white/50">
                          Pre-linked digital safety routing included
                        </span>
                      </div>
                    </div>

                    {/* Price & Quantity Controls */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="flex items-center border border-white/15 rounded-full bg-white/[0.04] p-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (cartItems.length > 0) {
                              updateQuantity(index, (item.quantity || 1) - 1);
                            } else {
                              handleQuantityChange(-1);
                            }
                          }}
                          disabled={(item.quantity || 1) <= 1}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 font-mono font-extrabold text-xs text-white">
                          {item.quantity || 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            if (cartItems.length > 0) {
                              updateQuantity(index, (item.quantity || 1) + 1);
                            } else {
                              handleQuantityChange(1);
                            }
                          }}
                          disabled={(item.quantity || 1) >= 10}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-30 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {cartItems.length > 0 && (
                        <button
                          type="button"
                          onClick={() => removeFromCart(index)}
                          className="p-2 rounded-xl text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}

                      <div className="text-right min-w-[95px]">
                        <span className="font-extrabold text-sm sm:text-base text-white font-mono block">
                          PKR {calculateItemTotal(item).toLocaleString('en-PK')}
                        </span>
                        <span className="text-[10px] text-white/50 font-mono block">
                          {item.quantity > 1
                            ? `${item.quantity}-Pack Bundle`
                            : item.type === 'nfc'
                            ? 'PKR 1,999 each'
                            : isCompactTarget(item.target)
                            ? 'PKR 600 each'
                            : 'PKR 1,000 each'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CARD 2: Contact Information */}
            <div className="bg-[#12131A] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl">
              <div className="flex items-center gap-2.5 pb-4 border-b border-white/10 mb-5">
                <span className="w-7 h-7 rounded-full bg-amber-400/15 text-amber-400 font-mono font-bold text-xs flex items-center justify-center border border-amber-400/30">
                  2
                </span>
                <div>
                  <h2 className="font-extrabold text-lg text-white">Contact & Recipient</h2>
                  <p className="text-xs text-white/50">For parcel dispatch updates & emergency profile link</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                    Full Name <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Muhammad Ali Khan"
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-white font-semibold text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                    Mobile / WhatsApp Number <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0321-1234567"
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-white font-semibold text-sm outline-none transition-colors font-mono"
                  />
                  <span className="text-[11px] text-white/40 block mt-1">Courier rider will call on this number</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ali@example.com"
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-white font-semibold text-sm outline-none transition-colors"
                  />
                  <span className="text-[11px] text-white/40 block mt-1">For digital tracking receipt</span>
                </div>
              </div>
            </div>

            {/* CARD 3: Delivery Address */}
            <div className="bg-[#12131A] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl">
              <div className="flex items-center gap-2.5 pb-4 border-b border-white/10 mb-5">
                <span className="w-7 h-7 rounded-full bg-amber-400/15 text-amber-400 font-mono font-bold text-xs flex items-center justify-center border border-amber-400/30">
                  3
                </span>
                <div>
                  <h2 className="font-extrabold text-lg text-white">Doorstep Delivery Address</h2>
                  <p className="text-xs text-white/50">Delivered directly to your home or office across Pakistan</p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {/* Popular City Pills */}
                <div>
                  <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                    Select City
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_CITIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setCity(c)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          city === c
                            ? 'bg-amber-400 text-black font-extrabold shadow-sm'
                            : 'bg-white/[0.05] border border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                    Complete Street Address <span className="text-amber-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Plot number, Street name, Sector/Phase, Landmark..."
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-white font-semibold text-sm outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-white/80 uppercase tracking-wider mb-2">
                    Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    value={deliveryNote}
                    onChange={(e) => setDeliveryNote(e.target.value)}
                    placeholder="e.g. Call before arrival / leave with receptionist"
                    className="w-full px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/15 focus:border-amber-400 text-white font-semibold text-sm outline-none transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* CARD 4: Payment Method Selection */}
            <div className="bg-[#12131A] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl">
              <div className="flex items-center gap-2.5 pb-4 border-b border-white/10 mb-5">
                <span className="w-7 h-7 rounded-full bg-amber-400/15 text-amber-400 font-mono font-bold text-xs flex items-center justify-center border border-amber-400/30">
                  4
                </span>
                <div>
                  <h2 className="font-extrabold text-lg text-white">Payment Method</h2>
                  <p className="text-xs text-white/50">Secure and transparent payment</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option 1: Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    paymentMethod === 'cod'
                      ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center font-bold">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-white block">Cash on Delivery</span>
                        <span className="text-[11px] font-bold text-emerald-400">Recommended</span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'cod' ? 'border-amber-400 bg-amber-400' : 'border-white/30'}`}>
                      {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Zero advance payment required. Inspect your package and pay cash to the courier rider upon delivery.
                  </p>
                </div>

                {/* Option 2: Raast / Direct Bank Transfer */}
                <div
                  onClick={() => setPaymentMethod('raast')}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    paymentMethod === 'raast'
                      ? 'border-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold">
                        <QrCode className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-extrabold text-sm text-white block">Raast / Bank Transfer</span>
                        <span className="text-[11px] font-mono text-white/50">Instant 0% Fee</span>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'raast' ? 'border-amber-400 bg-amber-400' : 'border-white/30'}`}>
                      {paymentMethod === 'raast' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed">
                    Pay instantly via Raast ID or Bank Transfer. Share screenshot on WhatsApp for instant priority dispatch.
                  </p>
                </div>
              </div>

              {/* Raast Payment Details Drawer */}
              {paymentMethod === 'raast' && (
                <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                    <div>
                      <span className="text-[11px] font-mono text-white/50 block">Raast ID (Instant Transfer):</span>
                      <span className="font-mono font-bold text-sm text-amber-400">tagtique@mcb</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('tagtique@mcb', 'raast')}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedRaast ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedRaast ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10">
                    <div className="min-w-0 pr-2">
                      <span className="text-[11px] font-mono text-white/50 block">Meezan Bank Ltd IBAN:</span>
                      <span className="font-mono font-bold text-xs sm:text-sm text-white truncate block">
                        PK36MEZN0001234567890123
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy('PK36MEZN0001234567890123', 'iban')}
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedIban ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedIban ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-white/50">
                    Account Title: <strong className="text-white">Tagtique Technologies Ltd</strong>
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* ================= RIGHT COLUMN: STICKY ORDER SUMMARY ================= */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-24">
            
            <div className="bg-[#12131A] border border-white/15 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
              
              {/* Subtle Ambient Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <h3 className="font-extrabold text-xl text-white">Order Summary</h3>
                <span className="text-xs font-mono font-bold text-white/50 bg-white/10 px-2.5 py-1 rounded-full">
                  {effectiveItems.length} {effectiveItems.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              {/* ================= 3D ORDER ITEM VISUAL & CAROUSEL ================= */}
              {effectiveItems.length > 0 && currentPreviewItem && (
                <div className="rounded-2xl bg-gradient-to-b from-[#181924] via-[#12131A] to-[#0A0B0E] border border-white/10 p-4 relative overflow-hidden flex flex-col gap-3 group shadow-inner">
                  {/* Dynamic Aura Glow matching item accent */}
                  <div 
                    className="absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-500"
                    style={{ backgroundColor: currentPreviewItem.accent || '#F59E0B' }}
                  />

                  {/* Top Header of Stage: Category Tag & Item Position */}
                  <div className="flex items-center justify-between text-xs relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/30">
                        {currentPreviewItem.type === 'nfc' ? 'NFC Metal Card' : '3D Smart Sticker'}
                      </span>
                      <span className="text-xs font-mono text-white/50 truncate max-w-[130px]">
                        {currentPreviewItem.category}
                      </span>
                    </div>

                    {effectiveItems.length > 1 && (
                      <span className="text-[11px] font-mono font-bold text-amber-300 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10">
                        {safePreviewIndex + 1} of {effectiveItems.length}
                      </span>
                    )}
                  </div>

                  {/* Interactive 3D Stage with Tilt */}
                  <div
                    className="relative w-full h-44 sm:h-52 rounded-xl flex items-center justify-center p-2 cursor-grab active:cursor-grabbing select-none overflow-hidden"
                    style={{ perspective: '900px' }}
                    onMouseMove={handlePreviewMouseMove}
                    onMouseLeave={handlePreviewMouseLeave}
                  >
                    {/* Background Tech Accent Rings */}
                    <div className="absolute w-44 h-44 rounded-full border border-white/[0.04] pointer-events-none" />
                    <div className="absolute w-32 h-32 rounded-full border border-dashed border-white/[0.06] pointer-events-none animate-[spin_60s_linear_infinite]" />

                    {/* Floating 3D Target */}
                    <div
                      className="relative z-10 w-full h-full flex items-center justify-center transition-transform duration-150 ease-out"
                      style={{
                        transform: `rotateX(${previewTilt.y}deg) rotateY(${previewTilt.x}deg) scale(1.03)`,
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      {currentPreviewItem.type === 'nfc' ? (
                        /* NFC Metal Card 3D Preview */
                        <div className="relative w-full max-w-[260px] aspect-[856/540] rounded-[15px] overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.8)] border border-white/20 group/card">
                          {currentPreviewItem.image ? (
                            <img
                              src={currentPreviewItem.image}
                              alt={currentPreviewItem.name}
                              className="w-full h-full object-cover rounded-[15px] transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#181924] flex flex-col items-center justify-center text-amber-400">
                              <CreditCard className="w-10 h-10 mb-1" />
                              <span className="text-xs font-mono font-bold">Tagtique NFC</span>
                            </div>
                          )}
                          {/* Specular Glare & Metallic Sheen */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none rounded-[15px]" />
                        </div>
                      ) : (
                        /* 3D Floating Sticker with Drop Shadow */
                        <div className="relative w-full h-full flex items-center justify-center">
                          {currentPreviewItem.image ? (
                            <img
                              src={currentPreviewItem.image}
                              alt={currentPreviewItem.name}
                              className="max-h-[160px] max-w-[85%] object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.7)] transition-transform duration-300 group-hover:scale-105"
                              draggable={false}
                            />
                          ) : (
                            <div className="w-24 h-24 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                              <QrCode className="w-12 h-12" />
                            </div>
                          )}
                          {/* Floating Ground Pedestal Shadow */}
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-36 h-4 bg-[radial-gradient(ellipse,rgba(0,0,0,0.8)_0%,transparent_70%)] blur-sm pointer-events-none" />
                        </div>
                      )}
                    </div>

                    {/* Quick Floating Prev/Next Arrow Buttons (on stage) if multiple items */}
                    {effectiveItems.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrderPreviewIndex((prev) => (prev === 0 ? effectiveItems.length - 1 : prev - 1));
                          }}
                          className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer"
                          title="Previous item"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOrderPreviewIndex((prev) => (prev + 1) % effectiveItems.length);
                          }}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 text-white flex items-center justify-center transition-all shadow-md active:scale-90 cursor-pointer"
                          title="Next item"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Item Info Banner & Explicit "Next Item" Control */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs relative z-10">
                    <div className="flex flex-col min-w-0 pr-2">
                      <h4 className="font-extrabold text-sm text-white truncate font-manrope">
                        {currentPreviewItem.name}
                      </h4>
                      <span className="text-[11px] text-white/50">
                        Qty: {currentPreviewItem.quantity || 1} • {currentPreviewItem.type === 'nfc' ? 'NFC Metal Card' : 'High-Gloss Vinyl'}
                      </span>
                    </div>

                    {/* Next / Navigation Button */}
                    {effectiveItems.length > 1 && (
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Dots */}
                        <div className="flex items-center gap-1">
                          {effectiveItems.map((_, dotIdx) => (
                            <button
                              key={dotIdx}
                              type="button"
                              onClick={() => setOrderPreviewIndex(dotIdx)}
                              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                dotIdx === safePreviewIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/25 hover:bg-white/50'
                              }`}
                              title={`View item ${dotIdx + 1}`}
                            />
                          ))}
                        </div>

                        {/* Next Button */}
                        <button
                          type="button"
                          onClick={() => setOrderPreviewIndex((prev) => (prev + 1) % effectiveItems.length)}
                          className="px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer active:scale-95"
                        >
                          <span>Next</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Package & Delivery Overview */}
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex justify-between items-center text-white/70">
                  <span>Selected Package</span>
                  <span className="font-mono font-bold text-white">{effectiveItems.length} {effectiveItems.length === 1 ? 'Product' : 'Products'}</span>
                </div>

                <div className="flex justify-between items-center text-white/70">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-white">PKR {subtotal.toLocaleString('en-PK')}</span>
                </div>

                <div className="flex justify-between items-center text-white/70">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-emerald-400" />
                    <span>Doorstep Express Courier</span>
                  </span>
                  <span className="font-extrabold text-emerald-400 font-mono">FREE NATIONWIDE</span>
                </div>

                <div className="flex justify-between items-center text-white/70">
                  <span>Digital Safety Routing</span>
                  <span className="font-extrabold text-emerald-400 font-mono">FREE (No Monthly Fee)</span>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              {/* Total Amount */}
              <div className="flex justify-between items-baseline pt-1">
                <div>
                  <span className="font-extrabold text-xl text-white block">Total Amount</span>
                  <span className="text-xs text-white/50">Cash on Delivery • Express Dispatch</span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-2xl sm:text-3xl text-amber-400 font-mono">
                    PKR {finalTotal.toLocaleString('en-PK')}
                  </span>
                </div>
              </div>

              {/* Error Message if any */}
              {errorMsg && (
                <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/30 text-xs font-bold text-red-300">
                  {errorMsg}
                </div>
              )}

              {/* Place Order CTA Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePlaceOrder}
                className="w-full py-4 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-black font-extrabold text-base flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(245,158,11,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Confirming Order...' : `Confirm & Place Order • PKR ${finalTotal.toLocaleString('en-PK')}`}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Trust & Guarantee Badges */}
              <div className="pt-2 flex flex-col gap-2.5 text-xs text-white/60">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>Zero monthly fees:</strong> One-time fee, lifetime scan routing.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span><strong>1-Year warranty:</strong> Physical replacement if damaged.</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span><strong>Privacy masked:</strong> Direct phone dialer and WhatsApp routing.</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
