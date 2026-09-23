import React, { useState } from 'react';
import { X, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialTab = 'login', onAuthSuccess }) {
  const [tab, setTab] = useState(initialTab || 'login'); // 'login' | 'signup'
  const [tagFlipped, setTagFlipped] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState('Ayesha Khan');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState('');

  if (!isOpen) return null;

  const isLogin = tab === 'login';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmittedMessage(
        isLogin ? 'Welcome back, Ayesha!' : 'Account created! Your tag is ready to claim.'
      );
      setTimeout(() => {
        onAuthSuccess && onAuthSuccess({ name: name || 'Ayesha Khan', email });
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl rounded-[36px] overflow-hidden border-[2px] border-tag-border shadow-2xl bg-tag-bg my-auto max-h-[96vh] flex flex-col md:grid md:grid-cols-12">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-tag-card/80 border border-tag-border text-tag-brown hover:bg-tag-pill transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Dark Espresso Showcase matching Image 2 & 3 */}
        <div
          className="md:col-span-6 p-8 sm:p-10 lg:p-12 flex flex-col justify-between gap-8 text-[#FDF7EC] relative overflow-hidden"
          style={{
            background:
              'linear-gradient(155deg, #4A2A18 0%, #2E1B10 58%, #221208 100%)'
          }}
        >
          {/* Subtle dot pattern & ambient glow */}
          <div className="absolute inset-0 bg-dot-pattern-dark [background-size:22px_22px] opacity-40 pointer-events-none" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-tag-amber/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top: Logo & Title */}
          <div className="relative z-10 flex flex-col gap-6">
            <img
              src="/assets/tagtique-logo.png"
              alt="Tagtique"
              className="w-48 sm:w-56 h-auto drop-shadow-lg"
            />
            <div className="flex flex-col gap-3 max-w-sm">
              <h2 className="font-baloo font-extrabold text-3xl sm:text-4xl text-[#FDF7EC] leading-[1.06]">
                One tap. They have everything.
              </h2>
              <p className="text-xs sm:text-sm text-[#E9D9C1] leading-relaxed font-medium">
                Stylish QR tags for bags, keys, jackets and desks. Someone scans, and your name, number and socials land straight in their phone — no apps, no typing.
              </p>
            </div>
          </div>

          {/* Middle: Interactive Flippable Tag */}
          <div className="relative z-10 flex flex-col items-center sm:items-start gap-3">
            <div
              onClick={() => setTagFlipped(!tagFlipped)}
              className="w-[210px] h-[290px] cursor-pointer perspective-[1000px] select-none group"
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
                  className="absolute inset-0 backface-hidden rounded-[28px] border-[2.5px] border-[#1B0F06] bg-[#FFFDF8] p-4 flex flex-col items-center justify-between shadow-2xl"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  {/* Eyelet hole */}
                  <div className="w-6 h-6 rounded-full border-2 border-[#1B0F06] bg-[#F2E7D5] flex-shrink-0" />

                  {/* QR Code Graphic */}
                  <div className="w-36 h-36 rounded-xl bg-white border border-[#E7DAC4] p-2 flex items-center justify-center shadow-inner">
                    <div className="w-full h-full bg-[repeating-conic-gradient(#231409_0%_25%,#fffdf8_0%_50%)_0_0/14px_14px] rounded-lg" />
                  </div>

                  {/* Tag Label */}
                  <div className="flex flex-col items-center text-center">
                    <span className="font-mono text-[9px] tracking-[1.6px] text-tag-brown-light font-bold">
                      SCAN TO CONNECT
                    </span>
                    <span className="font-baloo font-bold text-base text-tag-brown leading-tight">
                      {name || 'Ayesha K.'}
                    </span>
                  </div>
                </div>

                {/* BACK FACE: Digital Scanned Profile */}
                <div
                  className="absolute inset-0 backface-hidden rounded-[28px] border-[2.5px] border-[#1B0F06] bg-[#FFFDF8] p-4 flex flex-col justify-between shadow-2xl text-tag-brown"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] font-bold tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      SCANNED LIVE
                    </span>
                    <span className="w-5 h-5 rounded-full border border-black bg-tag-amber" />
                  </div>

                  <div className="flex flex-col">
                    <span className="font-baloo font-bold text-lg text-tag-brown">
                      {name || 'Ayesha Khan'}
                    </span>
                    <span className="text-[11px] text-tag-brown-muted">
                      Ceramics & Design
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-[11px] border-t border-b border-tag-border/60 py-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-tag-brown-light">PHONE</span>
                      <span>+92 300 114 2288</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-bold text-tag-brown-light">INSTAGRAM</span>
                      <span>@ayesha.makes</span>
                    </div>
                  </div>

                  <div className="amber-gradient-btn text-center py-1.5 rounded-full text-xs font-bold text-tag-brown shadow-xs">
                    Save contact
                  </div>
                </div>
              </div>
            </div>

            {/* Click to flip prompt */}
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-wider text-[#C7B294]">
              <span className="w-4 h-[1px] bg-[#C7B294]" />
              <span>TAP THE TAG TO SEE A SCAN</span>
            </div>
          </div>

          {/* Bottom bullets */}
          <div className="relative z-10 flex flex-col gap-2 text-xs text-[#E9D9C1]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-xs bg-tag-amber flex-shrink-0" />
              <span>Any phone camera reads it — nothing to install.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-xs bg-tag-amber flex-shrink-0" />
              <span>Change your number, keep the same tag.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-xs bg-tag-amber flex-shrink-0" />
              <span>Decide what shows: work details, or everything.</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Cream Dot-Grid Auth Form matching Image 2 & 3 */}
        <div className="md:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-tag-bg bg-dot-pattern [background-size:20px_20px]">
          <div className="w-full max-w-md mx-auto bg-tag-card border-[1.5px] border-tag-border rounded-3xl p-6 sm:p-8 shadow-warm-lg flex flex-col gap-6">
            
            {/* Success Message Banner */}
            {submittedMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{submittedMessage}</span>
              </div>
            )}

            {/* Sliding Pill Tabs: Sign in vs Create account */}
            <div className="grid grid-cols-2 p-1 bg-tag-pill rounded-full border border-tag-border/60">
              <button
                type="button"
                onClick={() => setTab('login')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-full transition-all ${
                  isLogin
                    ? 'bg-tag-card text-tag-brown shadow-warm-sm'
                    : 'text-tag-brown-muted hover:text-tag-brown'
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setTab('signup')}
                className={`py-2 text-xs sm:text-sm font-bold rounded-full transition-all ${
                  !isLogin
                    ? 'bg-tag-card text-tag-brown shadow-warm-sm'
                    : 'text-tag-brown-muted hover:text-tag-brown'
                }`}
              >
                Create account
              </button>
            </div>

            {/* Heading */}
            <div className="flex flex-col gap-1">
              <h3 className="font-baloo font-extrabold text-2xl text-tag-brown">
                {isLogin ? 'Welcome back' : 'Claim your tag'}
              </h3>
              <p className="text-xs sm:text-sm text-tag-brown-muted font-medium">
                {isLogin
                  ? 'Sign in to edit your profile, track scans and order new tags.'
                  : 'Set up your profile once — then every tag you buy points to it.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              
              {/* Name on tag (Sign up only) */}
              {!isLogin && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-tag-brown">Name on your tag</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ayesha Khan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-card text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
                  />
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-tag-brown">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-card text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
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
                    className="w-full px-3.5 py-2.5 pr-16 rounded-xl border border-tag-border bg-tag-card text-sm text-tag-brown font-medium outline-none focus:border-tag-amber"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px] font-bold tracking-wider text-tag-brown-subtle hover:text-tag-brown px-2 py-1 bg-tag-pill rounded-md border border-tag-border"
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>

                {/* Password Strength Meter (Sign up only) */}
                {!isLogin && password.length > 0 && (
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

              {/* Checkboxes & Helpers */}
              {isLogin ? (
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-tag-brown">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="rounded accent-tag-amber"
                    />
                    <span>Keep me signed in</span>
                  </label>
                  <a href="#reset" className="font-bold text-tag-brown-light hover:text-tag-amber-deep">
                    Forgot password?
                  </a>
                </div>
              ) : (
                <label className="flex items-start gap-2 cursor-pointer text-xs font-medium text-tag-brown-muted pt-1">
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
              )}

              {/* Submit CTA button */}
              <button
                type="submit"
                disabled={loading}
                className="amber-gradient-btn w-full py-3 rounded-full text-sm font-extrabold text-tag-brown mt-2 shadow-sm flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create my account'}</span>
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

            {/* Social Sign-in Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setName('Google User');
                  setEmail('user@gmail.com');
                  setSubmittedMessage('Signed in via Google!');
                  setTimeout(() => {
                    onAuthSuccess && onAuthSuccess({ name: 'Google User', email: 'user@gmail.com' });
                    onClose();
                  }, 800);
                }}
                className="py-2.5 px-3 rounded-xl border border-tag-border bg-tag-bg hover:bg-tag-pill font-bold text-xs text-tag-brown transition-colors flex items-center justify-center gap-2"
              >
                <span>Google</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setName('Apple User');
                  setEmail('user@icloud.com');
                  setSubmittedMessage('Signed in via Apple!');
                  setTimeout(() => {
                    onAuthSuccess && onAuthSuccess({ name: 'Apple User', email: 'user@icloud.com' });
                    onClose();
                  }, 800);
                }}
                className="py-2.5 px-3 rounded-xl border border-tag-border bg-tag-bg hover:bg-tag-pill font-bold text-xs text-tag-brown transition-colors flex items-center justify-center gap-2"
              >
                <span>Apple</span>
              </button>
            </div>

            {/* Free Shipping Footer Note */}
            <div className="text-center font-medium text-[11px] text-tag-brown-subtle flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-tag-amber" />
              <span>Free shipping on your first tag — orders over PKR 2,000</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
