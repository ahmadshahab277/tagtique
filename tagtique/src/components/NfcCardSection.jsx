import React from 'react';
import { Link } from 'react-router-dom';
import { NFC_DESIGNS, NFC_CARD_PRICE_PKR } from '../data/nfcCards';
import { getPublicSiteOrigin } from '../utils/scanUrl';
import NfcCardArt from './NfcCardArt';

export default function NfcCardSection() {
  const previewUrl = `${getPublicSiteOrigin()}/profile/unassigned`;

  return (
    <section id="nfc" className="bg-white text-black py-12 sm:py-16 border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-manrope font-extrabold text-4xl sm:text-5xl tracking-tight">NFC CARDS.</h2>
        <p className="mt-2 max-w-xl text-sm text-black/55">
          Limited edition cards. Tap to share a profile. A small QR on the back is only the fallback.
        </p>
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NFC_DESIGNS.map((design) => (
            <Link
              key={design.id}
              to={`/nfc-card/${design.id}`}
              className="rounded-3xl border border-black/5 bg-[#f7f7f8] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.04)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
            >
              <NfcCardArt design={design} side="front" />
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <p className="font-extrabold tracking-wide">{design.name.toUpperCase()}</p>
                  <p className="text-sm text-black/55 mt-1">{design.line}</p>
                  <p className="text-xs font-semibold mt-2 underline underline-offset-2">View card</p>
                </div>
                <p className="font-bold whitespace-nowrap">PKR {NFC_CARD_PRICE_PKR.toLocaleString('en-PK')}</p>
              </div>
            </Link>
          ))}
        </div>
        <p className="sr-only">Preview QR destination {previewUrl}</p>
      </div>
    </section>
  );
}
