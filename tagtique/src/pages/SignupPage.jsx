import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Check } from 'lucide-react';

export default function SignupPage() {
  const [tagFlipped, setTagFlipped] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('Ayesha Khan');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { setUserProfile } = useCart();
  const navigate = useNavigate();

  // Password strength calculation
  const getStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength = getStrength(password);

  const handleSignup = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setMessage('Tag profile reserved! Setting up your build studio...');
      setUserProfile((prev) => ({
        ...prev,
        name: name || prev.name,
        email: email || prev.email
      }));
      setTimeout(() => {
        navigate('/order');
      }, 900);
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] grid grid-cols-1 lg:grid-cols-12 font-manrope">
      
      {/* LEFT COLUMN: Dark Espresso Showcase matching Image 3 */}
      <div
        className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-between gap-10 text-[#FDF7EC] relative overflow-hidden"
        style={{
          background: 'linear-gradient(155deg, #4A2A18 0%, #2E1B10 58%, #221208 100%)'
        }}
      >
        {/* Subtle dot pattern & ambient glow */}
        <div className="absolute inset-0 bg-dot-pattern-dark [background-size:22px_22px] opacity-40 pointer-events-none" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-tag-amber/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top: Logo & Headline */}
        <div className="relative z-10 flex flex-col gap-6">
          <Link to="/">
            <img
              src="/assets/tagtique-logo.png"
              alt="Tagtique"
              className="w-48 sm:w-60 h-auto drop-shadow-lg"
            />
          </Link>
          <div className="flex flex-col gap-3 max-w-md">
            <h1 className="font-baloo font-extrabold text-4xl sm:text-5xl text-[#FDF7EC] leading-[1.04]">
              One tap. They have everything.
            </h1>
            <p className="text-sm sm:text-base text-[#E9D9C1] leading-relaxed font-medium">
              Stylish QR tags for bags, keys, jackets and desks. Someone scans, and your name, number and socials land straight in their phone — no apps, no typing.
            </p>
          </div>
        </div>

        {/* Middle: Interactive Flippable Tag */}
        <div className="relative z-10 flex flex-col items-center sm:items-start gap-3 my-4">
          <div
            onClick={() => setTagFlipped(!tagFlipped)}
            className="w-[220px] h-[304px] cursor-pointer perspective-[1000px] select-none group"
            title="Click to flip tag"
          >
            <div
              className={`relative w-full h-full duration-700 preserve-3d transition-transform ${
                tagFlipped ? 'rotate-y-180' : ''
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: tagFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}
            >
              {/* FRONT FACE: Physical QR Tag */}
              <div
                className="absolute inset-0 backface-hidden rounded-[30px] border-[2.5px] border-[#1B0F06] bg-[#FFFDF8] p-4 flex flex-col items-center justify-between shadow-2xl"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {/* Eyelet hole */}
                <div className="w-6 h-6 rounded-full border-2 border-[#1B0F06] bg-[#F2E7D5] flex-shrink-0" />

                {/* QR Code Graphic */}
                <div className="w-40 h-40 rounded-xl bg-white border border-[#E7DAC4] p-2 flex items-center justify-center shadow-inner">
                  <div className="w-full h-full bg-[repeating-conic-gradient(#231409_0%_25%,#fffdf8_0%_50%)_0_0/15px_15px] rounded-lg" />
                </div>

                {/* Tag Label */}
                <div className="flex flex-col items-center text-center">
                  <span className="font-mono text-[9px] tracking-[1.6px] text-tag-brown-light font-bold">
                    SCAN TO CONNECT
                  </span>
                  <span className="font-baloo font-bold text-lg text-tag-brown leading-tight">
                    {name || 'Ayesha K.'}
                  </span>
                </div>
              </div>

              {/* BACK FACE: Digital Scanned Profile */}
              <div
                className="absolute inset-0 backface-hidden rounded-[30px] border-[2.5px] border-[#1B0F06] bg-[#FFFDF8] p-5 flex flex-col justify-between shadow-2xl text-tag-brown"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-mono text-[9.5px] font-bold tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    SCANNED LIVE
                  </span>
                  <span className="w-5 h-5 rounded-full border border-black bg-tag-amber" />
                </div>

                <div className="flex flex-col">
                  <span className="font-baloo font-bold text-xl text-tag-brown">
                    {name || 'Ayesha Khan'}
                  </span>
                  <span className="text-xs text-tag-brown-muted">
                    Profile Linked & Verified
                  </span>
                </div>

                <div className="flex flex-col gap-1.5 text-xs border-t border-b border-tag-border/60 py-2.5">
                  <div className="flex justify-between">
                    <span className="font-bold text-tag-brown-light">PHONE</span>
                    <span>+92 300 114 2288</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-bold text-tag-brown-light">INSTAGRAM</span>
                    <span>@ayesha.makes</span>
                  </div>
                </div>

                <div className="amber-gradient-btn text-center py-2 rounded-full text-xs font-bold text-tag-brown shadow-xs">
                  Save contact
                </div>
              </div>
            </div>
          </div>

          {/* Click to flip hint */}
          <div className="flex items-center gap-2 font-mono text-[10.5px] tracking-wider text-[#C7B294]">
            <span className="w-4 h-[1px] bg-[#C7B294]" />
            <span>TAP THE TAG TO SEE A SCAN</span>
          </div>
        </div>

        {/* Bottom bullets */}
        <div className="relative z-10 flex flex-col gap-2.5 text-xs sm:text-sm text-[#E9D9C1]">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-xs bg-tag-amber flex-shrink-0" />
            <span>Any phone camera reads it — nothing to install.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-xs bg-tag-amber flex-shrink-0" />
            <span>Change your number, keep the same tag.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-xs bg-tag-amber flex-shrink-0" />
            <span>Decide what shows: work details, or everything.</span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Cream Dot-Grid Claim Tag Form matching Image 3 */}
      <div className="lg:col-span-6 p-6 sm:p-12 lg:p-16 flex flex-col justify-center items-center bg-tag-bg bg-dot-pattern [background-size:20px_20px]">
        <div className="w-full max-w-md bg-tag-card border-[1.5px] border-tag-border rounded-3xl p-6 sm:p-9 shadow-warm-lg flex flex-col gap-6">
          
          {/* Notification */}
          {message && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{message}</span>
            </div>
          )}

          {/* Segmented Pill Tabs */}
          <div className="grid grid-cols-2 p-1 bg-tag-pill rounded-full border border-tag-border/60">
            <Link
              to="/login"
              className="py-2 text-xs sm:text-sm font-bold rounded-full text-center text-tag-brown-muted hover:text-tag-brown transition-colors"
            >
              Sign in
            </Link>
            <button
              type="button"
              className="py-2 text-xs sm:text-sm font-bold rounded-full bg-tag-card text-tag-brown shadow-warm-sm"
            >
              Create account
            </button>
          </div>

          {/* Heading */}
          <div className="flex flex-col gap-1">
            <h2 className="font-baloo font-extrabold text-3xl text-tag-brown">
              Claim your tag
            </h2>
            <p className="text-xs sm:text-sm text-tag-brown-muted font-medium">
              Set up your profile once — then every tag you buy points to it.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            
            {/* Name on tag */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-tag-brown">Name on your tag</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ayesha Khan"
                className="w-full px-3.5 py-3 rounded-xl border border-tag-border bg-tag-card text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-tag-brown">Email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-3 rounded-xl border border-tag-border bg-tag-card text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-tag-brown">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full px-3.5 py-3 pr-16 rounded-xl border border-tag-border bg-tag-card text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] font-bold tracking-wider text-tag-brown-subtle hover:text-tag-brown px-2 py-1 bg-tag-pill rounded-md border border-tag-border"
                >
                  {showPassword ? 'HIDE' : 'SHOW'}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="flex flex-col gap-1 pt-1">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1.5 rounded-full transition-colors ${
                          strength >= step
                            ? strength <= 2
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                            : 'bg-tag-border'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-tag-brown-subtle font-mono">
                    {strength < 2 ? 'Weak password' : strength < 4 ? 'Good password' : 'Strong password'}
                  </span>
                </div>
              )}
            </div>

            {/* Agree Terms Checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs font-medium text-tag-brown-muted pt-1">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
                className="rounded accent-tag-amber mt-0.5"
              />
              <span>
                I agree to the{' '}
                <a href="#terms" className="font-bold text-tag-brown underline">
                  Terms
                </a>{' '}
                and{' '}
                <a href="#privacy" className="font-bold text-tag-brown underline">
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            {/* Create account button */}
            <button
              type="submit"
              disabled={loading}
              className="amber-gradient-btn w-full py-3.5 rounded-full text-sm font-extrabold text-tag-brown mt-2 shadow-sm"
            >
              <span>{loading ? 'Setting up...' : 'Create my account'}</span>
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-tag-border" />
            </div>
            <span className="relative bg-tag-card px-3 font-mono text-[10px] font-bold text-tag-brown-subtle uppercase">
              OR
            </span>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setUserProfile((prev) => ({ ...prev, email: 'google.user@gmail.com' }));
                setMessage('Registered via Google');
                setTimeout(() => navigate('/order'), 700);
              }}
              className="py-2.5 px-3 rounded-xl border border-tag-border bg-tag-bg hover:bg-tag-pill font-bold text-xs text-tag-brown transition-colors flex items-center justify-center gap-2"
            >
              <span>Google</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setUserProfile((prev) => ({ ...prev, email: 'apple.user@icloud.com' }));
                setMessage('Registered via Apple');
                setTimeout(() => navigate('/order'), 700);
              }}
              className="py-2.5 px-3 rounded-xl border border-tag-border bg-tag-bg hover:bg-tag-pill font-bold text-xs text-tag-brown transition-colors flex items-center justify-center gap-2"
            >
              <span>Apple</span>
            </button>
          </div>

          {/* Free Shipping Footer Note */}
          <div className="text-center font-medium text-[11px] text-tag-brown-subtle flex items-center justify-center gap-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Free doorstep express courier delivery across Pakistan</span>
          </div>

        </div>
      </div>

    </div>
  );
}
