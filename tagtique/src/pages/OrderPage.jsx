import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Tag3D from '../components/Tag3D';
import { useCart } from '../context/CartContext';
import { orderBackendService } from '../services/orderBackendService';
import {
  Truck,
  ShieldCheck,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building,
  Banknote,
  Lock,
  Plus,
  Minus,
  Star,
  ArrowRight,
  Eye,
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
    name: 'Single Tag',
    tagsCount: 1,
    pkrPrice: 999,
    oldPkrPrice: null,
    usdPrice: 12,
    desc: '1 shiny QR Tag · One-time fee'
  },
  {
    id: 'pack2',
    name: 'Pack of 2',
    tagsCount: 2,
    pkrPrice: 1499,
    oldPkrPrice: null,
    usdPrice: 18,
    desc: '2 shiny QR Tags · One-time fee',
    isPopular: true
  },
  {
    id: 'pack3',
    name: 'Pack of 3',
    tagsCount: 3,
    pkrPrice: 1999,
    oldPkrPrice: null,
    usdPrice: 24,
    desc: '3 shiny QR Tags · One-time fee'
  }
];

const MATERIALS = [
  {
    id: 'shiny',
    name: 'Shiny Acrylic',
    badge: 'Included on all packages',
    extraPkr: 0,
    desc: 'High-gloss shiny acrylic finish — same premium material on every tag.'
  }
];

const FINISHES = [
  { id: 'cream', name: 'Cream Acrylic', swatch: '#FBF3E4', desc: 'Warm ivory with amber eyelet' },
  { id: 'espresso', name: 'The Espresso', swatch: '#3A2318', desc: 'Matte deep dark brown' },
  { id: 'amber', name: 'The Amber', swatch: '#F5B21F', desc: 'Translucent glowing honey' },
  { id: 'glow', name: 'The Nightlight', swatch: 'linear-gradient(150deg, #8BF7C8, #49E2D2, #B394F2)', desc: 'Mint-to-violet night glow' }
];

const POPULAR_CITIES = ['Faisalabad', 'Lahore', 'Islamabad', 'Rawalpindi', 'Karachi', 'Peshawar', 'Multan', 'Sialkot'];

const TAG_TYPES = ['Car', 'Motorcycle', 'Commercial'];

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
  const [selectedFinish, setSelectedFinish] = useState(searchParams.get('finish') || 'cream');
  const [customQuantity, setCustomQuantity] = useState(
    PACKAGES.find((p) => p.id === initialPackage)?.tagsCount || 2
  );

  // Laser Engraving
  const [isEngraved, setIsEngraved] = useState(searchParams.get('engraved') === 'true');
  const [engravedText, setEngravedText] = useState('Ali Khan');

  // Contact Details per Tag
  const [activeAccordion, setActiveAccordion] = useState(0);
  const [tagsData, setTagsData] = useState([
    {
      name: userProfile.name || 'Ali Khan',
      phone: userProfile.phone || '0300 1234567',
      emergencyPhone: '0301 9876543',
      tagType: 'Car',
      email: userProfile.email || 'ali@example.com',
      bio: userProfile.bio || 'Product Designer · Faisalabad'
    },
    {
      name: 'Ayesha Khan',
      phone: '0329 2082080',
      emergencyPhone: '',
      tagType: 'Motorcycle',
      email: 'ayesha@tagtique.co',
      bio: 'Architect & Traveler'
    },
    {
      name: 'Hamza Khan',
      phone: '0312 3456789',
      emergencyPhone: '',
      tagType: 'Commercial',
      email: '',
      bio: ''
    },
    {
      name: 'Family Tag',
      phone: '0300 0000000',
      emergencyPhone: '',
      tagType: 'Car',
      email: '',
      bio: ''
    }
  ]);

  // Delivery Address
  const [address, setAddress] = useState('208 Chak Road, West Canal Road');
  const [city, setCity] = useState('Faisalabad');
  const [notes, setNotes] = useState('');

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
  useEffect(() => {
    const pkg = PACKAGES.find((p) => p.id === selectedPackageId);
    if (pkg) {
      setCustomQuantity(pkg.tagsCount);
    }
  }, [selectedPackageId]);

  const selectedPackage = PACKAGES.find((p) => p.id === selectedPackageId) || PACKAGES[1];
  const selectedMaterial = MATERIALS.find((m) => m.id === selectedMaterialId) || MATERIALS[0];
  const currentFinishObj = FINISHES.find((f) => f.id === selectedFinish) || FINISHES[0];

  // Pricing calculations
  const basePkrPrice = selectedPackage.pkrPrice;
  const materialExtraPkr = 0;
  const engravingExtraPkr = isEngraved ? 400 * customQuantity : 0;
  const totalPkr = basePkrPrice + materialExtraPkr + engravingExtraPkr;

  const handleUpdateTag = (index, field, value) => {
    setTagsData((prev) => {
      const updated = [...prev];
      if (!updated[index]) {
        updated[index] = { name: '', phone: '', emergencyPhone: '', tagType: 'Car', email: '', bio: '' };
      }
      updated[index][field] = value;
      return updated;
    });
  };

  const handleQuantityChange = (delta) => {
    const newQty = Math.max(1, Math.min(3, customQuantity + delta));
    setCustomQuantity(newQty);
    if (newQty === 1) setSelectedPackageId('single');
    else if (newQty === 2) setSelectedPackageId('pack2');
    else setSelectedPackageId('pack3');
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
        tagType: tagsData[i]?.tagType || 'Bag'
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
          vehicleNumber: t.name || `TAG-${idx + 1}`,
          vehicleType: t.tagType || 'Car'
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
          {/* CARD 1: Choose Package & Tag Material */}
          <section className="bg-tag-card border-[1.5px] border-tag-border rounded-3xl p-6 sm:p-7 shadow-warm-sm flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-tag-pill border border-tag-border flex items-center justify-center text-tag-brown-light font-bold">
                <Layers className="w-5 h-5 text-tag-amber-deep" />
              </div>
              <div className="flex flex-col">
                <h2 className="font-baloo font-extrabold text-xl sm:text-2xl text-tag-brown">
                  Choose Package & Tag Material
                </h2>
                <span className="text-xs text-tag-brown-muted font-medium">
                  Select vehicle/item count and physical badge format.
                </span>
              </div>
            </div>

            {/* Package Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {PACKAGES.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
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

            {/* Tag Material — single shiny finish for all packages */}
            <div className="flex flex-col gap-2.5 pt-2 border-t border-tag-border/60">
              <span className="font-mono text-[11px] font-bold tracking-wider text-tag-brown-light uppercase">
                TAG MATERIAL & SPECIFICATION
              </span>
              <div className="p-3.5 rounded-2xl border-2 border-tag-brown bg-tag-bg shadow-xs ring-1 ring-tag-amber/30 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs sm:text-[13px] text-tag-brown">
                    Shiny Acrylic
                  </span>
                  <div className="w-4 h-4 rounded-full border border-tag-brown bg-tag-amber flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-tag-brown" />
                  </div>
                </div>
                <p className="text-[11px] text-tag-brown-muted leading-tight font-medium">
                  High-gloss shiny acrylic finish — same premium material on every package.
                </p>
                <span className="font-mono text-[10px] font-bold text-tag-amber-deep">
                  Included on all packages
                </span>
              </div>
            </div>

            {/* Total Tags Quantity Stepper */}
            <div className="flex items-center justify-between pt-3 border-t border-tag-border/60 text-xs sm:text-sm font-bold text-tag-brown">
              <span>Total Tags to Print ({customQuantity} items)</span>
              <div className="flex items-center gap-3 bg-tag-bg border border-tag-border rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => handleQuantityChange(-1)}
                  className="w-8 h-8 rounded-lg bg-tag-card hover:bg-tag-pill flex items-center justify-center text-tag-brown font-bold transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-sm font-extrabold w-6 text-center">
                  {customQuantity}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityChange(1)}
                  className="w-8 h-8 rounded-lg bg-tag-card hover:bg-tag-pill flex items-center justify-center text-tag-brown font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </section>

          {/* CARD 2: Tag & Contact Details */}
          <section className="bg-tag-card border-[1.5px] border-tag-border rounded-3xl p-6 sm:p-7 shadow-warm-sm flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-tag-pill border border-tag-border flex items-center justify-center text-tag-brown-light font-bold">
                  <User className="w-5 h-5 text-tag-amber-deep" />
                </div>
                <div className="flex flex-col">
                  <h2 className="font-baloo font-extrabold text-xl sm:text-2xl text-tag-brown">
                    Tag & Contact Profile Details
                  </h2>
                  <span className="text-xs text-tag-brown-muted font-medium">
                    Owner details, contact number & emergency guardian info.
                  </span>
                </div>
              </div>
              <span className="font-mono text-xs font-extrabold text-tag-brown-light bg-tag-pill px-3 py-1 rounded-full border border-tag-border">
                {customQuantity} {customQuantity > 1 ? 'Tags' : 'Tag'}
              </span>
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
                        <span>Tag {index + 1}</span>
                        <span className="text-xs font-normal text-tag-brown-muted">
                          · {tagItem.name ? tagItem.name : 'Click to configure details'}
                        </span>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {/* Accordion Body */}
                    {isOpen && (
                      <div className="p-5 pt-0 flex flex-col gap-4 border-t border-tag-border/50 animate-fadeIn mt-2">
                        {/* Tag Category / Purpose */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-tag-brown">
                            Tag Category / Usage
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {TAG_TYPES.map((type) => {
                              const isCatSelected = tagItem.tagType === type;
                              return (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() => handleUpdateTag(index, 'tagType', type)}
                                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
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

                        {/* Owner / Tag Name */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-bold text-tag-brown flex items-center justify-between">
                            <span>Owner / Display Name *</span>
                            <span className="text-[11px] text-tag-brown-muted font-normal">Printed & Scanned Profile</span>
                          </label>
                          <input
                            type="text"
                            value={tagItem.name}
                            onChange={(e) => handleUpdateTag(index, 'name', e.target.value)}
                            placeholder="e.g. Ali Khan"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-card text-sm text-tag-brown font-semibold outline-none focus:border-tag-amber"
                          />
                        </div>

                        {/* Primary Phone Number */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-tag-brown">
                              Phone Number (WhatsApp Direct) *
                            </label>
                            <input
                              type="tel"
                              value={tagItem.phone}
                              onChange={(e) => handleUpdateTag(index, 'phone', e.target.value)}
                              placeholder="e.g. 0329 2082080"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-card text-sm text-tag-brown font-semibold outline-none focus:border-tag-amber"
                            />
                            <span className="text-[10.5px] text-tag-brown-muted font-medium">
                              Instant WhatsApp tap when someone scans your tag.
                            </span>
                          </div>

                          {/* Emergency / Guardian Number */}
                          <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-tag-brown flex items-center justify-between">
                              <span>Guardian / Backup Contact</span>
                              <span className="text-[10px] text-tag-amber-deep font-bold uppercase">Optional</span>
                            </label>
                            <input
                              type="tel"
                              value={tagItem.emergencyPhone}
                              onChange={(e) => handleUpdateTag(index, 'emergencyPhone', e.target.value)}
                              placeholder="e.g. 0301 9876543"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-card text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
                            />
                            <span className="text-[10.5px] text-tag-brown-muted font-medium">
                              Emergency backup hotline if bag or item gets lost.
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
              <span>DRAG TO ROTATE 3D TAG</span>
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
                <span>Tag Material:</span>
                <span className="font-bold text-tag-brown">{selectedMaterial.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Total Quantity:</span>
                <span className="font-bold text-tag-brown">{customQuantity} {customQuantity > 1 ? 'Tags' : 'Tag'}</span>
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
