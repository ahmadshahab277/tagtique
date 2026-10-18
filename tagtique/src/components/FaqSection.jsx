import React, { useState } from 'react';

const FAQS = [
  {
    q: 'What is Tagtique?',
    a: 'A QR identity sticker for belongings. A finder scans the code and reaches the contact options you saved. It is not a GPS tracker.'
  },
  {
    q: 'Do I need an app?',
    a: 'No. The phone camera opens the sticker page in the browser. From there they can call or message on WhatsApp when a number is saved.'
  },
  {
    q: 'How do I activate a sticker?',
    a: 'Use Wi-Fi, scan the QR on the sticker, fill the form that opens, and tap Assign. The tag is then ready to use. Shop Sign Up does not assign a sticker.'
  },
  {
    q: 'Can I change the phone number later?',
    a: 'The printed QR stays the same. After registration, updates are made from the admin Reassign control or by contacting the shop. The next scan uses the saved number.'
  },
  {
    q: 'Does it track my item?',
    a: 'No. With internet, a scan opens the contact page. Without internet, it opens the phone dialer. The sticker does not report a location.'
  }
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="bg-[#08090D] text-white py-14 sm:py-20 border-t border-white/10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="font-manrope font-extrabold text-4xl tracking-tight mb-8 text-white">Questions.</h2>
        <div className="border-t border-white/10">
          {FAQS.map((item, index) => {
            const open = openIndex === index;
            return (
              <div key={item.q} className="border-b border-white/10">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  className="w-full text-left py-4 flex items-center justify-between gap-4 font-semibold text-white/90 hover:text-white transition-colors cursor-pointer group"
                  aria-expanded={open}
                >
                  <span className="group-hover:text-amber-400 transition-colors">{item.q}</span>
                  <span className="text-xl leading-none font-mono text-white/50 group-hover:text-amber-400">{open ? '–' : '+'}</span>
                </button>
                {open && <p className="pb-4 text-sm text-white/65 leading-relaxed">{item.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
