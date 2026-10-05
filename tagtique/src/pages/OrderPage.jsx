import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Tag3D from '../components/Tag3D';
import { useCart } from '../context/CartContext';
import { orderBackendService } from '../services/orderBackendService';
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Building,
  Banknote,
  Plus,
  Minus,
  Star,
  ArrowRight,
  Layers,
  Phone,
  User,
  MapPin,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PACKAGES = [
  {
    id: 'single',
    name: 'Single Sticker',
    tagsCount: 1,
    pkrPrice: 999,
    oldPkrPrice: null,
    usdPrice: 12,
    desc: '1 glossy QR Sticker · One-time fee'
  },
  {
    id: 'pack2',
    name: 'Pack of 2',
    tagsCount: 2,
    pkrPrice: 1499,
    oldPkrPrice: null,
    usdPrice: 18,
    desc: '2 glossy QR Stickers · One-time fee',
    isPopular: true
  },
  {
    id: 'pack3',
    name: 'Pack of 3',
    tagsCount: 3,
    pkrPrice: 1999,
    oldPkrPrice: null,
    usdPrice: 24,
    desc: '3 glossy QR Stickers · One-time fee'
  }
];

const MATERIALS = [
  {
    id: 'shiny',
    name: 'Glossy Vinyl Sticker',
    badge: 'Included on all packages',
    extraPkr: 0,
    desc: 'High-gloss waterproof vinyl sticker — scratch-resistant, weatherproof & UV-protected on every package.'
  }
];

const FINISHES = [
  { id: 'amber', name: 'The Amber Gold', swatch: '#D19B32', desc: 'Warm golden honey vinyl' },
  { id: 'cream', name: 'Cream Sticker', swatch: '#FBF3E4', desc: 'Warm ivory with chocolate frame' },
  { id: 'espresso', name: 'The Espresso', swatch: '#3A2318', desc: 'Matte deep dark brown' },
  { id: 'glow', name: 'The Nightlight', swatch: 'linear-gradient(150deg, #8BF7C8, #49E2D2, #B394F2)', desc: 'Mint-to-violet night glow' }
];

const POPULAR_CITIES = ['Faisalabad', 'Lahore', 'Islamabad', 'Rawalpindi', 'Karachi', 'Peshawar', 'Multan', 'Sialkot'];

const TAG_TYPES = ['Vehicle', 'Others'];

export default function OrderPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { userProfile, setUserProfile, completeOrder } = useCart();

  // Package & Material
  const initialPackage =
    ['single', 'pack2', 'pack3'].includes(searchParams.get('package'))
      ? searchParams.get('package')
      : searchParams.get('bundle') === 'trio'
        ? 'pack3'
        : 'pack2';
  const [selectedPackageId, setSelectedPackageId] = useState(initialPackage);
  const [selectedMaterialId] = useState('shiny');
  const [selectedFinish] = useState(searchParams.get('finish') || 'amber');
  const [customQuantity, setCustomQuantity] = useState(
    PACKAGES.find((p) => p.id === initialPackage)?.tagsCount || 2
  );

  // Laser Engraving
  const [isEngraved] = useState(searchParams.get('engraved') === 'true');
  const [engravedText] = useState('Ali Khan');

  // Contact Details per Tag
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [tagsData, setTagsData] = useState([
    {
      name: userProfile.name || 'Ali Khan',
      phone: userProfile.phone || '0300 1234567',
      emergencyPhone: '0301 9876543',
      tagType: 'Vehicle',
      vehicleNumber: 'LEA-24-1234',
      email: userProfile.email || 'ali@example.com',
      bio: userProfile.bio || 'Product Designer · Faisalabad',
      phonePrivacy: 'private', // 'private' | 'public'
      namePrivacy: 'public',   // 'public' | 'private'
      emergencyPrivacy: 'private',
      detailsPrivacy: 'public'
    },
    {
      name: 'Ayesha Khan',
      phone: '0329 2082080',
      emergencyPhone: '',
      tagType: 'Vehicle',
      vehicleNumber: 'ICT-2024-88',
      email: 'ayesha@tagtique.co',
      bio: 'Architect & Traveler',
      phonePrivacy: 'private',
      namePrivacy: 'public',
      emergencyPrivacy: 'private',
      detailsPrivacy: 'public'
    },
    {
      name: 'Hamza Khan',
      phone: '0312 3456789',
      emergencyPhone: '',
      tagType: 'Others',
      vehicleNumber: '',
      email: '',
      bio: '',
      phonePrivacy: 'private',
      namePrivacy: 'public',
      emergencyPrivacy: 'private',
      detailsPrivacy: 'public'
    },
    {
      name: 'Family Tag',
      phone: '0300 0000000',
      emergencyPhone: '',
      tagType: 'Vehicle',
      vehicleNumber: 'FD-12-999',
      email: '',
      bio: '',
      phonePrivacy: 'private',
      namePrivacy: 'public',
      emergencyPrivacy: 'private',
      detailsPrivacy: 'public'
    }
  ]);

  // Delivery Address
  const [address, setAddress] = useState('208 Chak Road, West Canal Road');
  const [city, setCity] = useState('Faisalabad');
  const [notes] = useState('');

  // Payment Method & Interactive States
  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod' | 'bank'
  const [copiedRaast, setCopiedRaast] = useState(false);
  const [copiedIban, setCopiedIban] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = (text, type) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    if (type === 'raast') {
      setCopiedRaast(true);
      setTimeout(() => setCopiedRaast(false), 2000);
    } else if (type === 'iban') {
      setCopiedIban(true);
      setTimeout(() => setCopiedIban(false), 2000);
    }
  };

  // Synchronize package selection with quantity
  const handleSelectPackage = (pkgId) => {
    setSelectedPackageId(pkgId);
    const pkg = PACKAGES.find((p) => p.id === pkgId);
    if (pkg) {
      setCustomQuantity(pkg.tagsCount);
    }
  };

  // Pricing calculations: 1=999, 2=1499, 3=1999, beyond 3 = 1999 + 500 per extra sticker
  const getBasePkrPrice = (qty) => {
    if (qty <= 1) return 999;
    if (qty === 2) return 1499;
    if (qty === 3) return 1999;
    return 1999 + (qty - 3) * 500;
  };

  const selectedPackage =
    PACKAGES.find((p) => p.id === selectedPackageId && p.tagsCount === customQuantity) || {
      id: 'custom',
      name: `${customQuantity} Stickers Custom Pack`,
      tagsCount: customQuantity,
      pkrPrice: getBasePkrPrice(customQuantity),
      desc: `${customQuantity} glossy QR Stickers · Bulk discount applied`
    };

  const selectedMaterial = MATERIALS.find((m) => m.id === selectedMaterialId) || MATERIALS[0];
  const currentFinishObj = FINISHES.find((f) => f.id === selectedFinish) || FINISHES[0];

  const basePkrPrice = getBasePkrPrice(customQuantity);
  const materialExtraPkr = 0;
  const engravingExtraPkr = isEngraved ? 400 * customQuantity : 0;
  const totalPkr = basePkrPrice + materialExtraPkr + engravingExtraPkr;

  const handleUpdateTag = (index, field, value) => {
    setTagsData((prev) => {
      const updated = [...prev];
      if (!updated[index]) {
        updated[index] = {
          name: '',
          phone: '',
          emergencyPhone: '',
          tagType: 'Vehicle',
          vehicleNumber: '',
          email: '',
          bio: '',
          phonePrivacy: 'private',
          namePrivacy: 'public',
          emergencyPrivacy: 'private',
          detailsPrivacy: 'public'
        };
      }
      updated[index][field] = value;
      return updated;
    });
  };

  // Unbounded quantity change — user can order as many stickers as they want!
  const handleQuantityChange = (delta) => {
    const newQty = Math.max(1, customQuantity + delta);
    setCustomQuantity(newQty);
    if (newQty === 1) setSelectedPackageId('single');
    else if (newQty === 2) setSelectedPackageId('pack2');
    else if (newQty === 3) setSelectedPackageId('pack3');
    else setSelectedPackageId('custom');
  };

  const handleSetExactQuantity = (val) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      setCustomQuantity(1);
      setSelectedPackageId('single');
      return;
    }
    const safeQty = Math.max(1, Math.min(500, parsed));
    setCustomQuantity(safeQty);
    if (safeQty === 1) setSelectedPackageId('single');
    else if (safeQty === 2) setSelectedPackageId('pack2');
    else if (safeQty === 3) setSelectedPackageId('pack3');
    else setSelectedPackageId('custom');
  };

  const handleCopyFirstTagToAll = () => {
    const firstTag = tagsData[0] || {};
    setTagsData((prev) => {
      const updated = [...prev];
      for (let i = 1; i < customQuantity; i++) {
        updated[i] = {
          name: firstTag.name ? `${firstTag.name} (${i + 1})` : '',
          phone: firstTag.phone || '',
          emergencyPhone: firstTag.emergencyPhone || '',
          tagType: firstTag.tagType || 'Vehicle',
          vehicleNumber: firstTag.vehicleNumber || '',
          email: firstTag.email || '',
          bio: firstTag.bio || '',
          phonePrivacy: firstTag.phonePrivacy || 'private',
          namePrivacy: firstTag.namePrivacy || 'public',
          emergencyPrivacy: firstTag.emergencyPrivacy || 'private',
          detailsPrivacy: firstTag.detailsPrivacy || 'public'
        };
      }
      return updated;
    });
  };

  const handlePlaceOrder = (e) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    const generatedOrderId = 'TQ-' + Math.floor(10000 + Math.random() * 90000);
    const primaryCustomer = tagsData[0] || { name: 'Ali Khan', phone: '03292082080', email: 'ataitsolution09@gmail.com' };

    const orderData = {
      orderId: generatedOrderId,
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      customer: {
        name: primaryCustomer.name || 'Ali Khan',
        email: primaryCustomer.email || 'ataitsolution09@gmail.com',
        phone: primaryCustomer.phone || '0329-2082080'
      },
      shippingAddress: {
        address: address || '208 Chak Road, West Canal Road',
        apartment: notes,
        city: city || 'Faisalabad',
        stateProvince: 'Punjab',
        postalCode: '38000',
        country: 'Pakistan'
      },
      shippingMethod: 'standard',
      shippingFee: 0,
      paymentMethod,
      items: Array.from({ length: customQuantity }).map((_, i) => ({
        id: i + 1,
        finishName: currentFinishObj.name,
        materialName: selectedMaterial.name,
        basePrice: Math.round(totalPkr / customQuantity),
        isEngraved,
        engravedText: isEngraved ? engravedText : '',
        totalPrice: Math.round(totalPkr / customQuantity),
        displayName: tagsData[i]?.name || primaryCustomer.name,
        phone: tagsData[i]?.phone || primaryCustomer.phone,
        emergencyPhone: tagsData[i]?.emergencyPhone || '',
        tagType: tagsData[i]?.tagType || 'Vehicle',
        vehicleNumber: tagsData[i]?.vehicleNumber || '',
        phonePrivacy: tagsData[i]?.phonePrivacy || 'private',
        namePrivacy: tagsData[i]?.namePrivacy || 'public',
        emergencyPrivacy: tagsData[i]?.emergencyPrivacy || 'private',
        detailsPrivacy: tagsData[i]?.detailsPrivacy || 'public',
        email: tagsData[i]?.email || '',
        bio: tagsData[i]?.bio || ''
      })),
      subtotal: totalPkr,
      finalTotal: totalPkr,
      currency: 'PKR'
    };

    // Asynchronously sync to Supabase backend service
    try {
      orderBackendService.createOrder({
        customer: {
          name: primaryCustomer.name || 'Ali Khan',
          email: primaryCustomer.email || 'ataitsolution09@gmail.com',
          phone: primaryCustomer.phone || '0329-2082080',
          guardianNumber: primaryCustomer.emergencyPhone || ''
        },
        vehicles: tagsData.slice(0, customQuantity).map((t, idx) => ({
          vehicleNumber: t.vehicleNumber || t.name || `TAG-${idx + 1}`,
          vehicleType: t.tagType || 'Vehicle'
        })),
        packageType: selectedPackage.title || 'Single Tag',
        totalAmount: totalPkr,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending_transfer',
        deliveryStatus: 'pending',
        tagMaterial: 'shiny',
        shippingAddress: {
          address: address || '208 Chak Road, West Canal Road',
          city: city || 'Faisalabad'
        }
      });
    } catch (err) {
      console.warn('Backend order sync:', err);
    }

    setTimeout(() => {
      completeOrder(orderData);
      setUserProfile((prev) => ({
        ...prev,
        name: primaryCustomer.name,
        phone: primaryCustomer.phone,
        email: primaryCustomer.email
      }));

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.5 },
          colors: ['#F5B21F', '#2E1B10', '#25D366', '#FFFDF8']
        });
      } catch (_) {}

      navigate('/order-confirmation');
    }, 850);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-manrope">
      {/* Page Header */}
      <div className="flex flex-col gap-3 mb-8">
        <h1 className="font-baloo font-extrabold text-3xl sm:text-4xl lg:text-5xl text-tag-brown leading-tight tracking-tight">
          Order Your Smart E-Tag
        </h1>
        <p className="text-sm sm:text-base text-tag-brown-muted font-medium max-w-2xl leading-relaxed">
          Protect your privacy and stay reachable. Configured in under 90 seconds with instant smart profile routing and WhatsApp connection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: Form Structure (Cards 1 to 4) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* CARD 1: Choose Package & Sticker Material */}
          <section className="bg-tag-card border-[1.5px] border-tag-border rounded-3xl p-6 sm:p-7 shadow-warm-sm flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-tag-pill border border-tag-border flex items-center justify-center text-tag-brown-light font-bold">
                <Layers className="w-5 h-5 text-tag-amber-deep" />
              </div>
              <div className="flex flex-col">
                <h2 className="font-baloo font-extrabold text-xl sm:text-2xl text-tag-brown">
                  Choose Package & Sticker Material
                </h2>
                <span className="text-xs text-tag-brown-muted font-medium">
                  Select vehicle/item count and physical sticker format. Get as many as you need!
                </span>
              </div>
            </div>

            {/* Package Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {PACKAGES.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id && customQuantity === pkg.tagsCount;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => handleSelectPackage(pkg.id)}
                    className={`relative p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'bg-tag-bg border-tag-brown shadow-warm-sm ring-2 ring-tag-amber/30'
                        : 'bg-tag-card/80 border-tag-border hover:border-tag-border hover:bg-tag-bg/50'
                    }`}
                  >
                    {pkg.isPopular && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-tag-brown text-tag-amber font-mono text-[9.5px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border border-tag-brown-deep tracking-wider flex items-center gap-1 shadow-xs">
                        <Star className="w-3 h-3 fill-tag-amber text-tag-amber" />
                        POPULAR
                      </span>
                    )}

                    <div className="flex items-start justify-between">
                      <span className="font-baloo font-bold text-base text-tag-brown">
                        {pkg.name}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected ? 'border-tag-brown bg-tag-amber' : 'border-tag-border bg-tag-card'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-tag-brown-deep" />}
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-mono text-xs font-bold text-tag-brown-light">PKR</span>
                        <span className="font-baloo font-extrabold text-2xl text-tag-brown">
                          {pkg.pkrPrice.toLocaleString()}
                        </span>
                        {pkg.oldPkrPrice ? (
                          <span className="text-[11px] line-through text-tag-brown-subtle">
                            {pkg.oldPkrPrice.toLocaleString()}
                          </span>
                        ) : null}
                      </div>
                      <span className="text-[11.5px] font-semibold text-tag-brown-muted mt-0.5">
                        {pkg.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* If custom quantity > 3, show custom package highlight */}
            {customQuantity > 3 && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-tag-amber flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-tag-amber text-tag-brown-deep font-mono font-black text-sm flex items-center justify-center shadow-xs">
                    {customQuantity}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-baloo font-bold text-sm text-tag-brown">
                      Custom Bulk Pack ({customQuantity} Stickers)
                    </span>
                    <span className="text-[11px] text-tag-brown-muted font-medium">
                      PKR 1,999 base + PKR 500 for each extra sticker ({customQuantity - 3} extra)
                    </span>
                  </div>
                </div>
                <span className="font-mono font-extrabold text-base text-tag-brown">
                  PKR {basePkrPrice.toLocaleString()}
                </span>
              </div>
            )}

            {/* Sticker Material — single glossy finish for all packages */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-tag-border/60">
              <span className="font-mono text-[11px] font-bold tracking-wider text-tag-brown-light uppercase">
                STICKER MATERIAL & SPECIFICATION
              </span>
              <div className="p-3.5 rounded-2xl border-2 border-tag-brown bg-tag-bg shadow-xs ring-1 ring-tag-amber/30 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-[13px] text-tag-brown">
                    Glossy Vinyl Sticker
                  </span>
                  <div className="w-4 h-4 rounded-full border border-tag-brown bg-tag-amber flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-tag-brown" />
                  </div>
                </div>
                <p className="text-[11px] text-tag-brown-muted leading-tight font-medium">
                  High-gloss waterproof vinyl sticker — scratch-resistant, weatherproof & UV-protected on every package.
                </p>
                <span className="font-mono text-[10px] font-bold text-tag-amber-deep">
                  Included on all packages
                </span>
              </div>
            </div>

            {/* Total Stickers Quantity Stepper & Quick Add */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-tag-border/60 text-xs sm:text-sm font-bold text-tag-brown">
              <div className="flex flex-col">
                <span>Total Stickers to Print ({customQuantity} {customQuantity > 1 ? 'items' : 'item'})</span>
                <span className="text-[11px] text-tag-brown-muted font-normal">
                  Add as many stickers as you want · PKR 500 per extra sticker
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Quick Add Pills */}
                <div className="flex items-center gap-1 mr-1">
                  {[1, 5, 10].map((add) => (
                    <button
                      key={add}
                      type="button"
                      onClick={() => handleQuantityChange(add)}
                      className="px-2 py-1 rounded-lg bg-tag-card hover:bg-tag-pill border border-tag-border text-[11px] font-mono font-bold text-tag-brown transition-all hover:scale-105 active:scale-95"
                      title={`Add ${add} stickers`}
                    >
                      +{add}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 bg-tag-bg border border-tag-border rounded-xl p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={customQuantity <= 1}
                    className="w-8 h-8 rounded-lg bg-tag-card hover:bg-tag-pill disabled:opacity-40 flex items-center justify-center text-tag-brown font-bold transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={customQuantity}
                    onChange={(e) => handleSetExactQuantity(e.target.value)}
                    className="font-mono text-sm font-extrabold w-12 text-center bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-tag-amber rounded text-tag-brown"
                  />
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="w-8 h-8 rounded-lg bg-tag-card hover:bg-tag-pill flex items-center justify-center text-tag-brown font-bold transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* CARD 2: Sticker & Contact Details */}
          <section className="bg-tag-card border-[1.5px] border-tag-border rounded-3xl p-6 sm:p-7 shadow-warm-sm flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-tag-pill border border-tag-border flex items-center justify-center text-tag-brown-light font-bold">
                  <User className="w-5 h-5 text-tag-amber-deep" />
                </div>
                <div className="flex flex-col">
                  <h2 className="font-baloo font-extrabold text-xl sm:text-2xl text-tag-brown">
                    Sticker & Contact Profile Details
                  </h2>
                  <span className="text-xs text-tag-brown-muted font-medium">
                    Owner details, contact number & emergency guardian info for each sticker.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {customQuantity > 1 && (
                  <button
                    type="button"
                    onClick={handleCopyFirstTagToAll}
                    className="px-3 py-1.5 rounded-full bg-tag-pill hover:bg-tag-border/60 border border-tag-border text-xs font-bold text-tag-brown transition-all flex items-center gap-1.5"
                    title="Copy details from Sticker 1 to all other stickers"
                  >
                    <Copy className="w-3 h-3 text-tag-amber-deep" />
                    <span>Copy #1 to all</span>
                  </button>
                )}
                <span className="font-mono text-xs font-extrabold text-tag-brown-light bg-tag-pill px-3 py-1 rounded-full border border-tag-border">
                  {customQuantity} {customQuantity > 1 ? 'Stickers' : 'Sticker'}
                </span>
              </div>
            </div>

            {/* Accordion list for configured tags */}
            <div className="flex flex-col gap-3">
              {Array.from({ length: customQuantity }).map((_, index) => {
                const isOpen = activeAccordion === index;
                const tagItem = tagsData[index] || {
                  name: '',
                  phone: '',
                  emergencyPhone: '',
                  tagType: 'Car',
                  email: '',
                  bio: ''
                };

                return (
                  <div
                    key={index}
                    className={`rounded-2xl border-2 transition-all overflow-hidden ${
                      isOpen
                        ? 'bg-tag-bg/80 border-tag-brown/80 shadow-xs'
                        : 'bg-tag-bg/40 border-tag-border/80 hover:border-tag-border'
                    }`}
                  >
                    {/* Accordion Header */}
                    <button
                      type="button"
                      onClick={() => setActiveAccordion(isOpen ? -1 : index)}
                      className="w-full p-4 flex items-center justify-between text-left font-bold text-sm sm:text-base text-tag-brown"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-tag-brown text-tag-amber font-mono text-xs font-bold flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span>Sticker {index + 1}</span>
                        <span className="text-xs font-normal text-tag-brown-muted">
                          · {tagItem.name ? tagItem.name : 'Click to configure details'}
                          {tagItem.tagType === 'Vehicle' && tagItem.vehicleNumber ? ` (${tagItem.vehicleNumber})` : ''}
                        </span>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Accordion Body */}
                    {isOpen && (
                      <div className="p-5 pt-0 flex flex-col gap-4 border-t border-tag-border/50 animate-fadeIn mt-2">
                        {/* Tag Category: Vehicle or Others */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-tag-brown">
                            Sticker Category / Usage
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {TAG_TYPES.map((type) => {
                              const isCatSelected = (tagItem.tagType || 'Vehicle') === type;
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => handleUpdateTag(index, 'tagType', type)}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                    isCatSelected
                                      ? 'bg-tag-brown text-[#FDF7EC] border-tag-brown shadow-xs'
                                      : 'bg-tag-card border-tag-border text-tag-brown-muted hover:text-tag-brown hover:bg-tag-pill'
                                  }`}
                                >
                                  {type}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Number Plate (shown ONLY when Vehicle is selected) */}
                        {tagItem.tagType === 'Vehicle' && (
                          <div className="flex flex-col gap-1.5 animate-fadeIn">
                            <label className="text-xs font-bold text-tag-brown flex items-center justify-between">
                              <span>Number Plate *</span>
                              <span className="text-[11px] text-tag-amber-deep font-semibold">Vehicle Registration</span>
                            </label>
                            <input
                              type="text"
                              value={tagItem.vehicleNumber || ''}
                              onChange={(e) => handleUpdateTag(index, 'vehicleNumber', e.target.value.toUpperCase())}
                              placeholder="e.g. LEA-24-1234 or ICT-890"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-card text-sm text-tag-brown font-mono font-bold tracking-wider outline-none focus:border-tag-amber uppercase placeholder:font-sans placeholder:font-normal placeholder:tracking-normal"
                            />
                            <span className="text-[10.5px] text-tag-brown-muted font-medium">
                              Linked to this vehicle's sticker profile for emergency contact & parking scans.
                            </span>
                          </div>
                        )}

                        {/* Owner / Tag Name */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <label className="text-xs font-bold text-tag-brown">
                              Owner / Display Name *
                            </label>
                            <div className="flex items-center gap-1 bg-tag-pill p-0.5 rounded-lg border border-tag-border text-[10.5px] font-bold">
                              <button
                                type="button"
                                onClick={() => handleUpdateTag(index, 'namePrivacy', 'public')}
                                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                                  (tagItem.namePrivacy || 'public') === 'public'
                                    ? 'bg-tag-brown text-[#FDF7EC] shadow-2xs'
                                    : 'text-tag-brown-muted hover:text-tag-brown'
                                }`}
                              >
                                🌐 Public Name
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateTag(index, 'namePrivacy', 'private')}
                                className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                                  tagItem.namePrivacy === 'private'
                                    ? 'bg-tag-brown text-[#FDF7EC] shadow-2xs'
                                    : 'text-tag-brown-muted hover:text-tag-brown'
                                }`}
                              >
                                🔒 Anonymous
                              </button>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={tagItem.name}
                            onChange={(e) => handleUpdateTag(index, 'name', e.target.value)}
                            placeholder="e.g. Ali Khan"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-card text-sm text-tag-brown font-semibold outline-none focus:border-tag-amber"
                          />
                          <span className="text-[10.5px] text-tag-brown-muted font-medium">
                            {tagItem.namePrivacy === 'private'
                              ? '🔒 Private: Scanned profile displays "Tagtique Verified Owner" to keep your name private.'
                              : '🌐 Public: Your name is displayed on the scan profile.'}
                          </span>
                        </div>

                        {/* Primary Phone Number & Emergency Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <label className="text-xs font-bold text-tag-brown">
                                Phone Number *
                              </label>
                              <div className="flex items-center gap-0.5 bg-tag-pill p-0.5 rounded-lg border border-tag-border text-[10px] font-bold">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateTag(index, 'phonePrivacy', 'private')}
                                  className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
                                    (tagItem.phonePrivacy || 'private') === 'private'
                                      ? 'bg-tag-brown text-[#FDF7EC] shadow-2xs'
                                      : 'text-tag-brown-muted hover:text-tag-brown'
                                  }`}
                                >
                                  🔒 Private (Proxy)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateTag(index, 'phonePrivacy', 'public')}
                                  className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
                                    tagItem.phonePrivacy === 'public'
                                      ? 'bg-tag-brown text-[#FDF7EC] shadow-2xs'
                                      : 'text-tag-brown-muted hover:text-tag-brown'
                                  }`}
                                >
                                  🌐 Public
                                </button>
                              </div>
                            </div>
                            <input
                              type="tel"
                              value={tagItem.phone}
                              onChange={(e) => handleUpdateTag(index, 'phone', e.target.value)}
                              placeholder="e.g. 0329 2082080"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-card text-sm text-tag-brown font-semibold outline-none focus:border-tag-amber"
                            />
                            <span className="text-[10.5px] font-medium leading-tight">
                              {(tagItem.phonePrivacy || 'private') === 'private' ? (
                                <span className="text-emerald-800 font-semibold flex items-center gap-1">
                                  🔒 Private: Scanners reach you through Tagtique Proxy without seeing your number.
                                </span>
                              ) : (
                                <span className="text-amber-800 font-semibold flex items-center gap-1">
                                  🌐 Public: Anyone who scans can see and dial your number directly.
                                </span>
                              )}
                            </span>
                          </div>

                          {/* Emergency / Guardian Number */}
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between gap-1 flex-wrap">
                              <label className="text-xs font-bold text-tag-brown">
                                Guardian Contact
                              </label>
                              <div className="flex items-center gap-0.5 bg-tag-pill p-0.5 rounded-lg border border-tag-border text-[10px] font-bold">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateTag(index, 'emergencyPrivacy', 'private')}
                                  className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
                                    (tagItem.emergencyPrivacy || 'private') === 'private'
                                      ? 'bg-tag-brown text-[#FDF7EC] shadow-2xs'
                                      : 'text-tag-brown-muted hover:text-tag-brown'
                                  }`}
                                >
                                  🔒 Masked
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateTag(index, 'emergencyPrivacy', 'public')}
                                  className={`px-1.5 py-0.5 rounded-md transition-all cursor-pointer ${
                                    tagItem.emergencyPrivacy === 'public'
                                      ? 'bg-tag-brown text-[#FDF7EC] shadow-2xs'
                                      : 'text-tag-brown-muted hover:text-tag-brown'
                                  }`}
                                >
                                  🌐 Public
                                </button>
                              </div>
                            </div>
                            <input
                              type="tel"
                              value={tagItem.emergencyPhone}
                              onChange={(e) => handleUpdateTag(index, 'emergencyPhone', e.target.value)}
                              placeholder="e.g. 0301 9876543"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-card text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
                            />
                            <span className="text-[10.5px] text-tag-brown-muted font-medium">
                              Optional emergency backup hotline for parking alerts.
                            </span>
                          </div>
                        </div>

                        {/* Bio or Email */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-tag-brown">Email Address (Optional)</label>
                            <input
                              type="email"
                              value={tagItem.email}
                              onChange={(e) => handleUpdateTag(index, 'email', e.target.value)}
                              placeholder="you@example.com"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-card text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-tag-brown">One-Line Bio or Note</label>
                            <input
                              type="text"
                              value={tagItem.bio}
                              onChange={(e) => handleUpdateTag(index, 'bio', e.target.value)}
                              placeholder="e.g. Industrial Designer · Lahore"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-card text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* CARD 3: Delivery Address & City */}
          <section className="bg-tag-card border-[1.5px] border-tag-border rounded-3xl p-6 sm:p-7 shadow-warm-sm flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-tag-pill border border-tag-border flex items-center justify-center text-tag-brown-light font-bold">
                <MapPin className="w-5 h-5 text-tag-amber-deep" />
              </div>
              <div className="flex flex-col">
                <h2 className="font-baloo font-extrabold text-xl sm:text-2xl text-tag-brown">
                  Delivery Address & City
                </h2>
                <span className="text-xs text-tag-brown-muted font-medium">
                  Free doorstep express delivery anywhere in Pakistan.
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              {/* Delivery Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-tag-brown">
                  Delivery Address (Street / House / Area) *
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. House 42, Street 7, Sector F-8/1"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown font-semibold outline-none focus:border-tag-amber"
                />
              </div>

              {/* City Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-tag-brown">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Enter your city name"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown font-semibold outline-none focus:border-tag-amber"
                />
              </div>

              {/* Quick City Selection Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-bold text-tag-brown-light mr-1">Popular:</span>
                {POPULAR_CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCity(c)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      city.toLowerCase() === c.toLowerCase()
                        ? 'bg-tag-brown text-tag-amber border-tag-brown font-bold'
                        : 'bg-tag-bg border-tag-border text-tag-brown-muted hover:text-tag-brown hover:bg-tag-pill'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* CARD 4: Payment Method */}
          <section className="bg-tag-card border-[1.5px] border-tag-border rounded-3xl p-6 sm:p-7 shadow-warm-sm flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-tag-pill border border-tag-border flex items-center justify-center text-tag-brown-light font-bold">
                <Banknote className="w-5 h-5 text-tag-amber-deep" />
              </div>
              <div className="flex flex-col">
                <h2 className="font-baloo font-extrabold text-xl sm:text-2xl text-tag-brown">
                  Payment Method
                </h2>
                <span className="text-xs text-tag-brown-muted font-medium">
                  Choose payment preference. Cash on Delivery is pre-selected for fastest checkout.
                </span>
              </div>
            </div>

            {/* Payment Choice Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: COD */}
              <div
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  paymentMethod === 'cod'
                    ? 'bg-tag-bg border-tag-brown ring-2 ring-tag-amber/30 shadow-xs'
                    : 'bg-tag-card border-tag-border hover:border-tag-border hover:bg-tag-bg/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-tag-brown" />
                    <span className="font-bold text-sm text-tag-brown">Cash on Delivery</span>
                  </div>
                  {paymentMethod === 'cod' ? (
                    <div className="w-5 h-5 rounded-full bg-tag-brown text-tag-amber flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-tag-border bg-tag-card flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-tag-brown-muted font-medium leading-relaxed">
                  Pay cash to the courier rider upon delivery anywhere in Pakistan.
                </p>
                <span className="self-start px-2.5 py-0.5 rounded-md bg-tag-pill text-tag-brown-deep font-mono text-[10px] font-bold border border-tag-border">
                  Most Popular in Pakistan
                </span>
              </div>

              {/* Option 2: Bank Transfer / Raast */}
              <div
                onClick={() => setPaymentMethod('bank')}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-3 ${
                  paymentMethod === 'bank'
                    ? 'bg-tag-bg border-tag-brown ring-2 ring-tag-amber/30 shadow-xs'
                    : 'bg-tag-card border-tag-border hover:border-tag-border hover:bg-tag-bg/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-5 h-5 text-tag-brown" />
                    <span className="font-bold text-sm text-tag-brown">Direct Bank Transfer / Raast</span>
                  </div>
                  {paymentMethod === 'bank' ? (
                    <div className="w-5 h-5 rounded-full bg-tag-brown text-tag-amber flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-tag-border bg-tag-card flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-tag-brown-muted font-medium leading-relaxed">
                  Instant transfer via Raast ID or Pakistani bank accounts (HBL, Meezan, Alfalah, etc.).
                </p>
                <span className="self-start px-2.5 py-0.5 rounded-md bg-tag-pill text-tag-brown-deep font-mono text-[10px] font-bold border border-tag-border">
                  Instant & Zero Fees
                </span>
              </div>
            </div>

            {/* Interactive Section for Direct Bank Transfer / Raast */}
            {paymentMethod === 'bank' && (
              <div className="border-t border-tag-border/60 pt-5 flex flex-col gap-4 animate-fadeIn">
                {/* Box with rounded border */}
                <div className="p-4 sm:p-5 rounded-2xl bg-tag-bg border border-tag-border shadow-xs flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-tag-amber-deep" />
                      <h3 className="font-baloo font-extrabold text-lg text-tag-brown">
                        Direct Raast / Bank Account Details
                      </h3>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-tag-pill text-tag-amber-deep border border-tag-border text-xs font-bold font-mono">
                      Zero Transfer Fees
                    </span>
                  </div>

                  {/* Account detail boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Box 1: Raast ID */}
                    <div className="p-3.5 rounded-xl bg-tag-card border border-tag-border flex items-center justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] text-tag-brown-muted font-medium">
                          Raast ID (Instant Transfer):
                        </span>
                        <span className="font-mono font-bold text-sm sm:text-base text-tag-brown truncate mt-0.5">
                          tagtique@mcb
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('tagtique@mcb', 'raast')}
                        title="Copy Raast ID"
                        className="p-2 rounded-lg bg-tag-bg hover:bg-tag-pill border border-tag-border text-tag-brown transition-colors flex-shrink-0"
                      >
                        {copiedRaast ? <Check className="w-4 h-4 text-tag-amber-deep" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Box 2: IBAN */}
                    <div className="p-3.5 rounded-xl bg-tag-card border border-tag-border flex items-center justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] text-tag-brown-muted font-medium">
                          IBAN (Meezan Bank Ltd):
                        </span>
                        <span className="font-mono font-bold text-xs sm:text-sm text-tag-brown truncate mt-0.5 tracking-tight">
                          PK36MEZN0001234567890123
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy('PK36MEZN0001234567890123', 'iban')}
                        title="Copy IBAN"
                        className="p-2 rounded-lg bg-tag-bg hover:bg-tag-pill border border-tag-border text-tag-brown transition-colors flex-shrink-0"
                      >
                        {copiedIban ? <Check className="w-4 h-4 text-tag-amber-deep" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Account Title Footnote */}
                  <p className="text-xs text-tag-brown-muted font-medium pt-0.5">
                    Account Title: <strong className="text-tag-brown">Tagtique Technologies (Pvt) Ltd</strong> • Please use your vehicle plate or Order ID as reference.
                  </p>
                </div>
              </div>
            )}

            {/* Interactive Section for Cash on Delivery */}
            {paymentMethod === 'cod' && (
              <div className="border-t border-tag-border/60 pt-4 animate-fadeIn">
                <div className="p-4 rounded-2xl bg-tag-bg border border-tag-border text-xs sm:text-sm text-tag-brown font-semibold flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-tag-amber-deep flex-shrink-0" />
                  <span>
                    <strong>Zero Prepayment Required:</strong> Pay PKR {totalPkr.toLocaleString()} in cash to the courier rider upon delivery anywhere in Pakistan.
                  </span>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Sticky 3D Preview & Order Summary */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky lg:top-24">
          {/* 3D Live Tag Box */}
          <div className="relative w-full aspect-square rounded-[32px] bg-radial-gradient from-[#FFF8EC] via-[#F4E7CE] to-[#EAD8B5] border-[1.5px] border-tag-border shadow-warm-lg overflow-hidden flex items-center justify-center group">
            {/* Three.js Tag Engine */}
            <div className="absolute inset-0">
              <Tag3D
                variant={selectedFinish}
                engravedText={tagsData[0]?.name || 'Ali Khan'}
                interactive={true}
                autoSpin={true}
                cameraDistance={3.6}
              />
            </div>

            {/* Live Indicator */}
            <div className="absolute left-4 top-4 pointer-events-none flex flex-col">
              <span className="font-mono text-[10px] tracking-wider text-tag-brown-light font-bold">
                LIVE 3D PREVIEW
              </span>
              <span className="font-baloo font-bold text-lg text-tag-brown">
                {currentFinishObj.name}
              </span>
            </div>

            {/* Drag hint */}
            <div className="absolute left-4 bottom-4 flex items-center gap-2 font-mono text-[10px] tracking-wider text-tag-brown-light pointer-events-none select-none">
              <span className="w-3 h-[1.5px] bg-tag-brown-subtle" />
              <span>DRAG TO ROTATE 3D STICKER</span>
            </div>
          </div>

          {/* Sticky Order Summary Card */}
          <div className="bg-tag-card border-[1.5px] border-tag-border rounded-3xl p-6 sm:p-7 shadow-warm-md flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="font-baloo font-extrabold text-2xl text-tag-brown">
                Order Summary
              </h3>
            </div>

            {/* Spec breakdown */}
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-tag-brown-muted font-medium">
              <div className="flex justify-between items-center">
                <span>Selected Plan:</span>
                <span className="font-bold text-tag-brown">{selectedPackage.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sticker Material:</span>
                <span className="font-bold text-tag-brown">{selectedMaterial.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Quantity:</span>
                <span className="font-bold text-tag-brown">{customQuantity} {customQuantity > 1 ? 'Stickers' : 'Sticker'}</span>
              </div>
              <div className="flex justify-between items-center text-tag-brown-light text-xs pt-1 border-t border-tag-border/60">
                <span>Configured Profiles:</span>
                <span className="font-mono font-bold text-tag-amber-deep">
                  {customQuantity} of {customQuantity} configured
                </span>
              </div>
            </div>

            <div className="h-[1px] bg-tag-border" />

            {/* Price rows */}
            <div className="flex flex-col gap-2 text-xs sm:text-sm text-tag-brown-muted font-medium">
              <div className="flex justify-between">
                <span>Base Package:</span>
                <span className="font-mono font-bold text-tag-brown">PKR {basePkrPrice.toLocaleString()}</span>
              </div>
              {materialExtraPkr > 0 && (
                <div className="flex justify-between">
                  <span>Premium Material:</span>
                  <span className="font-mono font-bold text-tag-brown">+PKR {materialExtraPkr.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Doorstep Delivery (Pakistan):</span>
                <span className="font-bold text-emerald-700">FREE</span>
              </div>
            </div>

            <div className="h-[1px] bg-tag-border" />

            {/* Total Due */}
            <div className="flex justify-between items-baseline pt-1">
              <div className="flex flex-col">
                <span className="font-baloo font-bold text-xl text-tag-brown">Total Due:</span>
                <span className="text-[11px] text-tag-brown-muted font-medium">One-time payment</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-sm font-bold text-tag-brown-light">PKR</span>
                <span className="font-baloo font-extrabold text-3xl sm:text-4xl text-tag-brown">
                  {totalPkr.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Direct Place Order CTA Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePlaceOrder}
              className="amber-gradient-btn w-full py-4 rounded-full text-base sm:text-lg font-extrabold text-tag-brown shadow-warm-md hover:shadow-warm-lg transition-all flex items-center justify-center gap-2 transform active:scale-98"
            >
              <span>{isSubmitting ? 'Placing Order...' : `Place Order · PKR ${totalPkr.toLocaleString()}`}</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-tag-brown-muted font-semibold text-center pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Relay protected & zero recurring fees</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
