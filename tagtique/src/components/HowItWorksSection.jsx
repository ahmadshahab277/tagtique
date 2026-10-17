import React from 'react';
import { Laptop, Phone, Wifi, WifiOff } from 'lucide-react';
import { SETUP_STEPS } from '../data/setupGuide';
import StickerArt from './StickerArt';

const MIMI = { name: 'Mimi', col: 0, row: 0 };

function PhoneShell({ children }) {
  return (
    <div className="w-[148px] shrink-0 rounded-[28px] border border-black/10 bg-white p-2 shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
      <div className="rounded-[22px] bg-[#f6f6f7] overflow-hidden h-[196px] flex flex-col">
        <div className="h-5 flex justify-center">
          <div className="mt-1.5 h-1.5 w-10 rounded-full bg-black/10" />
        </div>
        {children}
      </div>
    </div>
  );
}

export default function HowItWorksSection() {
  return (
    <section id="how" className="bg-[#f5f5f7] text-black py-14 sm:py-16 border-t border-black/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <h2 className="font-manrope font-extrabold text-4xl tracking-tight">How the sticker helps.</h2>
        <p className="mt-3 max-w-2xl text-black/65 leading-relaxed">
          Stick it on something you do not want to lose. A finder can reach you when the phone is online, and can still place a call when it is not.
        </p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
          <article className="glass-panel rounded-3xl p-5 flex flex-col items-center text-center">
            <div className="w-[108px] aspect-[230/341] rounded-2xl overflow-hidden bg-[#ececec]">
              <StickerArt product={MIMI} />
            </div>
            <div className="mt-4 w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
              <Laptop className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="font-bold mt-3">Easier to get an item home</h3>
            <p className="mt-2 text-sm text-black/70 leading-relaxed">
              A laptop, bag, helmet, or vehicle carries a QR instead of a number written on the outside.
            </p>
          </article>

          <article className="glass-panel rounded-3xl p-5 flex flex-col items-center text-center">
            <PhoneShell>
              <div className="px-3 pt-2 flex flex-col gap-2">
                <p className="text-[11px] font-bold text-left">Tagtique</p>
                <p className="text-[10px] text-black/50 text-left">Contact the owner</p>
                <div className="mt-2 rounded-full bg-black text-white text-[10px] font-bold py-2 text-center inline-flex items-center justify-center gap-1">
                  <Phone className="w-3 h-3" aria-hidden="true" />
                  Call
                </div>
                <div className="rounded-full bg-[#25D366] text-white text-[10px] font-bold py-2 text-center">
                  WhatsApp
                </div>
              </div>
            </PhoneShell>
            <div className="mt-4 w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
              <Wifi className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="font-bold mt-3">Online</h3>
            <p className="mt-2 text-sm text-black/70 leading-relaxed">
              The scan opens the sticker page. They can call or message you on WhatsApp.
            </p>
          </article>

          <article className="glass-panel rounded-3xl p-5 flex flex-col items-center text-center">
            <PhoneShell>
              <div className="flex-1 flex flex-col items-center justify-center gap-2 px-3">
                <div className="w-12 h-12 rounded-full bg-black text-white flex items-center justify-center">
                  <Phone className="w-5 h-5" aria-hidden="true" />
                </div>
                <p className="text-[11px] font-bold">Calling</p>
                <p className="text-[10px] text-black/45">Saved number</p>
              </div>
            </PhoneShell>
            <div className="mt-4 w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center">
              <WifiOff className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="font-bold mt-3">Offline</h3>
            <p className="mt-2 text-sm text-black/70 leading-relaxed">
              No internet opens the phone dialer. The sticker does not track the item.
            </p>
          </article>
        </div>

        <div className="mt-10">
          <h3 className="font-manrope font-extrabold text-2xl tracking-tight">After you buy it</h3>
          <ol className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <li className="bg-white rounded-3xl p-4 border border-black/5 flex flex-col items-center text-center">
              <PhoneShell>
                <div className="flex-1 flex flex-col items-center justify-center gap-2">
                  <Wifi className="w-8 h-8" aria-hidden="true" />
                  <div className="flex items-end gap-1 h-6" aria-hidden="true">
                    <span className="w-1.5 h-2 rounded-sm bg-black" />
                    <span className="w-1.5 h-3 rounded-sm bg-black" />
                    <span className="w-1.5 h-4 rounded-sm bg-black" />
                    <span className="w-1.5 h-6 rounded-sm bg-black/20" />
                  </div>
                  <p className="text-[11px] font-bold">Wi-Fi connected</p>
                </div>
              </PhoneShell>
              <p className="font-bold mt-4">{SETUP_STEPS[0].n}. {SETUP_STEPS[0].title}</p>
              <p className="mt-2 text-sm text-black/70 leading-relaxed">{SETUP_STEPS[0].text}</p>
            </li>

            <li className="bg-white rounded-3xl p-4 border border-black/5 flex flex-col items-center text-center">
              <PhoneShell>
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-[72px] aspect-[230/341] rounded-lg overflow-hidden ring-2 ring-black/80 ring-offset-2 ring-offset-[#f6f6f7]">
                    <StickerArt product={MIMI} />
                  </div>
                </div>
              </PhoneShell>
              <p className="font-bold mt-4">{SETUP_STEPS[1].n}. {SETUP_STEPS[1].title}</p>
              <p className="mt-2 text-sm text-black/70 leading-relaxed">{SETUP_STEPS[1].text}</p>
            </li>

            <li className="bg-white rounded-3xl p-4 border border-black/5 flex flex-col items-center text-center">
              <PhoneShell>
                <div className="px-3 pt-2 flex flex-col gap-1.5 text-left">
                  <p className="text-[11px] font-bold">Assign sticker</p>
                  <div className="h-6 rounded-lg bg-white border border-black/10 px-2 text-[9px] text-black/40 flex items-center">Your name</div>
                  <div className="h-6 rounded-lg bg-white border border-black/10 px-2 text-[9px] text-black/40 flex items-center">Phone</div>
                  <div className="mt-1 rounded-full bg-black text-white text-[10px] font-bold py-1.5 text-center">Assign</div>
                </div>
              </PhoneShell>
              <p className="font-bold mt-4">{SETUP_STEPS[2].n}. {SETUP_STEPS[2].title}</p>
              <p className="mt-2 text-sm text-black/70 leading-relaxed">{SETUP_STEPS[2].text}</p>
            </li>

            <li className="bg-white rounded-3xl p-4 border border-black/5 flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-[108px] aspect-[230/341] rounded-2xl overflow-hidden bg-[#ececec]">
                  <StickerArt product={MIMI} />
                </div>
                <span className="absolute -right-1 -bottom-1 w-8 h-8 rounded-full bg-black text-white text-sm font-bold flex items-center justify-center">✓</span>
              </div>
              <p className="font-bold mt-4">{SETUP_STEPS[3].n}. {SETUP_STEPS[3].title}</p>
              <p className="mt-2 text-sm text-black/70 leading-relaxed">{SETUP_STEPS[3].text}</p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}
