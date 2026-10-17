import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [note, setNote] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;
    setNote('Saved. We will send sticker updates to this email.');
    setEmail('');
  };

  return (
    <footer id="contact" className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <p className="font-manrope font-extrabold tracking-[-0.06em] text-[18vw] sm:text-[12vw] leading-none text-center text-white/90">
          tagtique
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-10 border-t border-white/15 pt-10">
          <form onSubmit={submit} className="md:col-span-4 flex flex-col gap-4">
            <p className="text-sm text-white/80 leading-relaxed max-w-sm">
              Get a note when a new sticker pack is ready, and offers for orders inside Pakistan.
            </p>
            <label className="text-xs text-white/60">
              Email address
              <div className="mt-2 flex items-end gap-3 border-b border-white/30 pb-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/40"
                  placeholder="you@email.com"
                />
                <button type="submit" className="text-xs font-bold tracking-wide">
                  SUBSCRIBE
                </button>
              </div>
            </label>
            {note && <p className="text-xs text-white/70">{note}</p>}
          </form>

          <div className="md:col-span-2 flex flex-col gap-3 text-sm">
            <span className="text-xs font-bold tracking-wider">HELP</span>
            <Link to="/#faq" className="text-white/75 hover:text-white">Questions</Link>
            <Link to="/order" className="text-white/75 hover:text-white">Order a sticker</Link>
            <Link to="/checkout" className="text-white/75 hover:text-white">Cart</Link>
            <a href="mailto:ataitsolution09@gmail.com" className="text-white/75 hover:text-white">Contact</a>
          </div>

          <div className="md:col-span-3 flex flex-col gap-3 text-sm">
            <span className="text-xs font-bold tracking-wider">SUPPORT</span>
            <p className="text-white/75">We reply on WhatsApp, 9am – 6pm PKT.</p>
            <a href="https://wa.me/923292082080" className="font-semibold hover:underline">0329-2082080</a>
            <p className="text-white/70 text-sm leading-relaxed">
              208 Chak Road, West Canal Road, Faisalabad, Pakistan
            </p>
          </div>

          <div className="md:col-span-3 flex flex-col gap-3 text-sm">
            <span className="text-xs font-bold tracking-wider">SHOP</span>
            <Link to="/order?edition=hero" className="text-white/75 hover:text-white">Hero Edition</Link>
            <Link to="/order?edition=cute" className="text-white/75 hover:text-white">Cute Edition</Link>
            <Link to="/order?edition=karaoke" className="text-white/75 hover:text-white">Karaoke Edition</Link>
            <Link to="/#shop" className="text-white/75 hover:text-white">Limited Edition</Link>
            <Link to="/#nfc" className="text-white/75 hover:text-white">NFC cards</Link>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/15 text-xs text-white/50 flex flex-col sm:flex-row justify-between gap-2">
          <span>© 2026 Tagtique</span>
          <span>Faisalabad, Pakistan</span>
        </div>
      </div>
    </footer>
  );
}
