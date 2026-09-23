import React, { useState } from 'react';
import Tag3D from './Tag3D';
import confetti from 'canvas-confetti';
import { X, Check, PenTool, ShoppingBag, Eye } from 'lucide-react';

const FINISHES = [
  { id: 'cream', name: 'Cream acrylic', price: 1499, swatch: '#FBF3E4', desc: 'Warm ivory acrylic with amber eyelet' },
  { id: 'espresso', name: 'The Espresso', price: 1499, swatch: '#3A2318', desc: 'Matte dark brown with cream code panel' },
  { id: 'amber', name: 'The Amber', price: 1699, swatch: '#F5B21F', desc: 'Translucent honey that glows in sunlight' },
  { id: 'glow', name: 'The Nightlight', price: 1899, swatch: 'linear-gradient(150deg, #8BF7C8, #49E2D2, #B394F2)', desc: 'Mint-to-violet gradient with dark luminescence' }
];

export default function CustomizerModal({
  isOpen,
  onClose,
  initialFinish = 'cream',
  onAddToCart,
  onOpenScanDemo
}) {
  const [selectedFinish, setSelectedFinish] = useState(initialFinish || 'cream');
  const [isEngraved, setIsEngraved] = useState(false);
  const [engravedText, setEngravedText] = useState('Ayesha Khan');
  const [displayName, setDisplayName] = useState('Ayesha Khan');
  const [bio, setBio] = useState('Ceramics & Industrial Design · Lahore');
  const [fields, setFields] = useState({
    phone: true,
    email: true,
    instagram: true,
    whatsapp: true,
    address: false
  });

  if (!isOpen) return null;

  const currentFinishObj = FINISHES.find((f) => f.id === selectedFinish) || FINISHES[0];
  const tagBasePrice = currentFinishObj.price;
  const engravePrice = isEngraved ? 500 : 0;
  const totalPrice = tagBasePrice + engravePrice;

  const toggleField = (key) => {
    setFields((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAddToBag = () => {
    // Launch celebratory confetti!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F5B21F', '#FFC943', '#2E1B10', '#FFFDF8']
      });
    } catch (_) {}

    onAddToCart({
      id: Date.now(),
      finish: selectedFinish,
      finishName: currentFinishObj.name,
      basePrice: tagBasePrice,
      isEngraved,
      engravedText: isEngraved ? engravedText : '',
      totalPrice,
      displayName,
      bio,
      fields
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-5xl rounded-[32px] sm:rounded-[36px] bg-tag-bg border-[2px] border-tag-border shadow-2xl overflow-hidden my-auto max-h-[96vh] flex flex-col">
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-tag-border bg-tag-card/80 backdrop-blur-md">
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-wider text-tag-brown-light">
            <span>TAGTIQUE STUDIO</span>
            <span className="text-tag-border">/</span>
            <span className="text-tag-amber-deep uppercase font-bold">CUSTOM BUILD</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-tag-pill text-tag-brown transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Content Body */}
        <div className="overflow-y-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: 3D Interactive Viewport */}
          <div className="lg:col-span-6 flex flex-col gap-4 sticky lg:top-0">
            <div className="relative w-full aspect-square rounded-3xl bg-radial-gradient from-[#FFF8EC] via-[#F4E7CE] to-[#EAD8B5] border-[1.5px] border-tag-border shadow-warm-md overflow-hidden flex items-center justify-center">
              
              {/* 3D Tag */}
              <div className="absolute inset-0">
                <Tag3D
                  variant={selectedFinish}
                  engravedText={isEngraved ? engravedText : ''}
                  interactive={true}
                  autoSpin={true}
                  cameraDistance={3.6}
                />
              </div>

              {/* Tag Info Overlay */}
              <div className="absolute left-4 top-4 pointer-events-none flex flex-col">
                <span className="font-mono text-[10px] tracking-wider text-tag-brown-light font-bold">
                  LIVE 3D PREVIEW
                </span>
                <span className="font-baloo font-bold text-lg text-tag-brown">
                  {currentFinishObj.name}
                </span>
              </div>

              {/* Drag Prompt */}
              <div className="absolute left-4 bottom-4 flex items-center gap-2 font-mono text-[10px] tracking-wider text-tag-brown-light pointer-events-none">
                <span className="w-3.5 h-[1.5px] bg-tag-brown-subtle" />
                <span>DRAG TO ROTATE & VIEW BACK</span>
              </div>
            </div>

            {/* Hint & Live Scan Demo button */}
            <div className="flex items-center justify-between px-2">
              <span className="text-xs text-tag-brown-muted font-medium">
                Drag horizontally to flip to reverse side
              </span>
              <button
                type="button"
                onClick={onOpenScanDemo}
                className="text-xs font-bold text-tag-brown-light hover:text-tag-amber-deep flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview phone scan
              </button>
            </div>
          </div>

          {/* Right Column: Customization Controls */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* Title */}
            <div>
              <span className="font-mono text-[10.5px] tracking-wider text-tag-brown-light font-bold bg-tag-pill px-3 py-1 rounded-full border border-tag-border">
                SOLID OPTICAL ACRYLIC · 38 × 52 MM
              </span>
              <h2 className="font-baloo font-extrabold text-2xl sm:text-3xl text-tag-brown mt-2">
                Build your tag, configure your card.
              </h2>
            </div>

            {/* 1. Finish Selection */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-baseline">
                <span className="font-baloo font-bold text-lg text-tag-brown">1. Choose Finish</span>
                <span className="text-xs font-semibold text-tag-brown-muted">{currentFinishObj.desc}</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {FINISHES.map((f) => {
                  const isSelected = selectedFinish === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFinish(f.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl text-left transition-all border ${
                        isSelected
                          ? 'bg-tag-card border-tag-amber shadow-warm-sm ring-2 ring-tag-amber/30'
                          : 'bg-tag-card/60 border-tag-border hover:bg-tag-card'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-full border-2 border-tag-brown-deep flex-shrink-0 shadow-xs"
                        style={{ background: f.swatch }}
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs sm:text-sm text-tag-brown truncate">
                          {f.name}
                        </div>
                        <div className="text-xs font-bold text-tag-brown-light">
                          PKR {f.price.toLocaleString()}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Reverse Laser Engraving */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-baseline">
                <span className="font-baloo font-bold text-lg text-tag-brown">2. Laser Engraving (Reverse)</span>
                <span className="text-xs font-semibold text-tag-brown-muted">Permanent high-precision mark</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEngraved(false)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all ${
                    !isEngraved
                      ? 'bg-tag-brown text-[#FDF7EC] border-tag-brown'
                      : 'bg-tag-card border-tag-border text-tag-brown-muted hover:text-tag-brown'
                  }`}
                >
                  Standard Tagtique mark
                </button>
                <button
                  type="button"
                  onClick={() => setIsEngraved(true)}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-xs sm:text-sm border transition-all flex items-center justify-center gap-1.5 ${
                    isEngraved
                      ? 'bg-tag-amber text-tag-brown-deep border-tag-brown-deep font-extrabold shadow-sm'
                      : 'bg-tag-card border-tag-border text-tag-brown-muted hover:text-tag-brown'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Custom text · +PKR 500</span>
                </button>
              </div>

              {isEngraved && (
                <div className="flex flex-col gap-2 p-3 rounded-2xl bg-tag-card border border-tag-border animate-fadeIn">
                  <label className="text-xs font-mono font-bold text-tag-brown-light uppercase">
                    Your Name, Studio or Handle (Max 22 chars)
                  </label>
                  <input
                    type="text"
                    maxLength={22}
                    value={engravedText}
                    onChange={(e) => setEngravedText(e.target.value)}
                    placeholder="e.g. Ayesha Khan"
                    className="w-full px-3 py-2 rounded-xl border border-tag-border bg-tag-bg text-tag-brown font-semibold text-sm outline-none focus:border-tag-amber"
                  />
                  <div className="flex items-center justify-between text-xs text-tag-brown-subtle pt-1">
                    <span>Preview on 3D tag:</span>
                    <span className="font-mono text-tag-amber-deep font-bold">
                      "{engravedText || 'Your Text'}"
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Card Configuration */}
            <div className="flex flex-col gap-3">
              <span className="font-baloo font-bold text-lg text-tag-brown">3. Scanned Card Setup</span>
              
              <div className="bg-tag-card border border-tag-border rounded-2xl p-4 flex flex-col gap-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-tag-brown-light uppercase">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-tag-border bg-tag-bg text-tag-brown font-semibold text-sm outline-none focus:border-tag-amber mt-1"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-tag-brown-light uppercase">
                    One-Line Bio
                  </label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-tag-border bg-tag-bg text-tag-brown font-medium text-sm outline-none focus:border-tag-amber mt-1"
                  />
                </div>

                <div className="h-[1px] bg-tag-border/60 my-1" />

                {/* Field toggles */}
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-mono font-bold text-tag-brown-light uppercase">
                    Active Sharing Fields
                  </span>
                  {[
                    { id: 'phone', label: 'Phone Number (+92 300 114 2288)' },
                    { id: 'email', label: 'Email (ayesha@tagtique.co)' },
                    { id: 'instagram', label: 'Instagram Handle (@ayesha.makes)' },
                    { id: 'whatsapp', label: 'Direct WhatsApp Button' }
                  ].map((field) => (
                    <div
                      key={field.id}
                      onClick={() => toggleField(field.id)}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-tag-bg/80 cursor-pointer transition-colors"
                    >
                      <span className="text-xs font-semibold text-tag-brown">{field.label}</span>
                      <button
                        type="button"
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          fields[field.id] ? 'bg-tag-amber' : 'bg-tag-border'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full bg-white transition-transform ${
                            fields[field.id] ? 'translate-x-4' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. Order Summary & Action */}
            <div className="bg-tag-brown text-[#FDF7EC] rounded-2xl p-5 flex flex-col gap-4 shadow-lg border border-tag-brown-deep">
              <span className="font-mono text-[10px] font-bold tracking-wider text-tag-amber uppercase">
                YOUR BUILD SUMMARY
              </span>

              <div className="flex justify-between items-center text-sm">
                <span>{currentFinishObj.name}</span>
                <span className="font-bold">PKR {tagBasePrice.toLocaleString()}</span>
              </div>

              {isEngraved && (
                <div className="flex justify-between items-center text-sm">
                  <span>Custom laser engraving</span>
                  <span className="font-bold text-tag-amber">+PKR 500</span>
                </div>
              )}

              <div className="h-[1px] bg-[#FDF7EC]/20" />

              <div className="flex justify-between items-baseline">
                <span className="font-baloo font-bold text-xl">Total</span>
                <span className="font-baloo font-extrabold text-3xl text-tag-amber">
                  PKR {totalPrice.toLocaleString()}
                </span>
              </div>

              <button
                type="button"
                onClick={handleAddToBag}
                className="amber-gradient-btn w-full py-3.5 rounded-full text-base font-extrabold text-tag-brown flex items-center justify-center gap-2 shadow-md active:scale-98"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Add to bag</span>
              </button>

              <div className="text-[11px] text-[#A88B64] text-center font-medium">
                Free physical replacement in year 1. Profile card stays free forever.
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
