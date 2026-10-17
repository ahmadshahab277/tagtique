import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findNfcDesign, NFC_DESIGNS, NFC_CARD_PRICE_PKR } from '../data/nfcCards';
import { getPublicSiteOrigin } from '../utils/scanUrl';
import NfcCardArt from '../components/NfcCardArt';

const USES = [
  { title: 'Creators', text: 'Share Instagram, TikTok, YouTube, and the other profiles you turn on.' },
  { title: 'Professionals', text: 'Share LinkedIn, email, and a phone number.' },
  { title: 'Businesses', text: 'Share a website and the contact accounts you choose.' },
  { title: 'Networking', text: 'Hand someone your profile with a tap instead of spelling out each account.' }
];

export default function NfcCardPage() {
  const { designId } = useParams();
  const design = findNfcDesign(designId);
  const [side, setSide] = useState('front');
  const previewUrl = `${getPublicSiteOrigin()}/profile/unassigned`;

  if (!design) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="font-manrope font-extrabold text-3xl">This card is not in the shop.</h1>
        <Link to="/#nfc" className="inline-flex mt-6 bg-black text-white rounded-full px-5 py-2.5 text-sm font-bold">Back to NFC cards</Link>
      </div>
    );
  }

  return (
    <article className="bg-[#f5f5f7] text-black pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <nav aria-label="Breadcrumb" className="text-sm text-black/55">
          <Link to="/" className="hover:text-black">Home</Link>
          <span> → </span>
          <Link to="/#nfc" className="hover:text-black">NFC cards</Link>
          <span> → </span>
          <span className="text-black">{design.name}</span>
        </nav>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <NfcCardArt design={design} side={side} qrValue={previewUrl} serial="PREVIEW" />
            <div className="mt-3 flex gap-2">
              {['front', 'back'].map((next) => (
                <button
                  key={next}
                  type="button"
                  onClick={() => setSide(next)}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${side === next ? 'bg-black text-white' : 'bg-white border border-black/10'}`}
                >
                  {next === 'front' ? 'Front' : 'Back'}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-black/50">
              The back QR is a real code. Until a profile is linked, it opens a page that says the card is not assigned. The shop programs the physical chip by hand. This page does not write NFC.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-6 sm:p-8">
            <p className="text-xs font-bold tracking-wider text-black/45">LIMITED EDITION NFC CARD</p>
            <h1 className="font-manrope font-extrabold text-4xl tracking-tight mt-2">{design.name}</h1>
            <p className="mt-3 text-2xl font-bold">PKR {NFC_CARD_PRICE_PKR.toLocaleString('en-PK')}</p>
            <p className="mt-1 text-sm text-black/60">Available to order. Same single-card price as the current shop sticker.</p>
            <p className="mt-4 text-sm leading-relaxed">
              Your identity, one tap away. Share the social profiles and contact details you turn on with a tap of this Tagtique NFC card.
            </p>
            <p className="mt-3 text-sm font-semibold">Tap with NFC. Scan with QR. Connect either way.</p>
            <p className="mt-2 text-sm text-black/70 leading-relaxed">
              NFC is the main action. The small QR on the back opens the same profile link if the phone has no NFC or NFC is turned off. Updating the profile does not change that link, so the printed code and the chip can stay as they are.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to={`/order?nfc=${design.id}`} className="inline-flex bg-black text-white rounded-full px-6 py-3 text-sm font-bold">Buy now</Link>
              <Link to={`/nfc-card/${design.id}/setup`} className="inline-flex bg-white border border-black/15 rounded-full px-6 py-3 text-sm font-bold">Set up profile</Link>
            </div>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="font-manrope font-extrabold text-3xl">How it works</h2>
          <ol className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              ['1', 'Personalize your profile', 'Turn on the accounts you want to share and fill each one in.'],
              ['2', 'Tap your card', 'Hold the card near the NFC area on a compatible phone. NFC must be switched on. Phones differ.'],
              ['3', 'Share your identity', 'The phone opens your profile link. The visitor only sees the fields you left on.']
            ].map(([n, title, text]) => (
              <li key={n} className="bg-white rounded-3xl p-5 border border-black/5">
                <p className="text-sm font-bold text-black/40">{n}</p>
                <h3 className="font-bold mt-2">{title}</h3>
                <p className="mt-2 text-sm text-black/70 leading-relaxed">{text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm text-black/60 max-w-3xl">
            The chip stores a link, not every social account. A compatible phone is required. This website does not program the card. After you order, the shop writes that same profile link to the chip and prints it in the QR.
          </p>
        </section>

        <section className="mt-14 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {USES.map((item) => (
            <div key={item.title} className="bg-white rounded-3xl p-5 border border-black/5">
              <h3 className="font-bold">{item.title}</h3>
              <p className="mt-2 text-sm text-black/70">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="mt-14">
          <h2 className="font-manrope font-extrabold text-2xl">Other cards</h2>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
            {NFC_DESIGNS.filter((item) => item.id !== design.id).map((item) => (
              <Link key={item.id} to={`/nfc-card/${item.id}`} className="block">
                <NfcCardArt design={item} side="front" />
                <p className="mt-2 text-sm font-bold">{item.name}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </article>
  );
}
