import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findProduct } from '../data/editions';
import { SETUP_STEPS, SETUP_SUMMARY } from '../data/setupGuide';
import StickerArt from '../components/StickerArt';

const USES = [
  { title: 'Laptop and devices', text: 'Lids, cases, consoles, and headphones cases, when the surface holds a sticker.' },
  { title: 'Bags and luggage', text: 'Backpacks, handbags, and luggage where the code stays flat and visible.' },
  { title: 'Helmets', text: 'A smooth area that does not wrinkle the QR.' },
  { title: 'Cars and bikes', text: 'A panel or helmet that a finder can scan without moving the vehicle.' },
  { title: 'Personal accessories', text: 'Bottles and other belongings you want someone to identify.' },
  { title: 'Other belongings', text: 'Any suitable surface. The QR has to stay visible and scannable.' }
];

const USE_STEPS = [
  { n: '1', title: 'Easier to return', text: 'The item shows a QR instead of a number written on the outside. A finder scans it and uses the contact you saved.' },
  { n: '2', title: 'Online', text: 'With internet, the scan opens the contact page. They can call or message on WhatsApp.' },
  { n: '3', title: 'Offline', text: 'Without internet, the scan opens the phone dialer so they can still call. The sticker does not track location.' }
];

const PRODUCT_FAQS = [
  {
    q: 'What is Tagtique?',
    a: 'A QR identity sticker. Someone who finds the item scans the code and reaches the contact options saved for that sticker. It does not track GPS or live location.'
  },
  {
    q: 'Can I use it on my laptop or phone?',
    a: 'Yes, on a surface that holds a sticker and keeps the QR visible. A phone case or laptop lid works when the code is not bent or covered.'
  },
  {
    q: 'Can I put it on my helmet, bag, car, or bike?',
    a: 'Yes, if the surface is suitable and the QR stays flat enough to scan. The shop does not guarantee permanent adhesion on every material.'
  },
  {
    q: 'How do I activate my sticker?',
    a: 'Use Wi-Fi, scan the QR on the sticker, fill the form that opens, and tap Assign. The tag is then ready to use. Shop Sign Up does not assign a sticker.'
  },
  {
    q: 'Do I need to install an app?',
    a: 'No. A phone camera opens the sticker page in the browser.'
  },
  {
    q: 'What happens when someone scans the QR code?',
    a: 'With internet, they open the contact page and can call or message on WhatsApp. Without internet, the scan opens the phone dialer for the saved number.'
  },
  {
    q: 'Can I change my contact details?',
    a: 'The printed QR stays the same. After the first registration, number changes are done from the admin Reassign control or by contacting the shop. The next scan uses the saved number. There is no separate customer page that edits a live sticker.'
  },
  {
    q: 'Does Tagtique provide GPS tracking?',
    a: 'No. The sticker does not know where the item is. It only opens the contact page when someone scans it.'
  },
  {
    q: 'What should I do if the QR code is not scanning?',
    a: 'Wipe the sticker, add light, and hold the camera steady so the whole code is in frame. If the print is damaged, contact the shop on WhatsApp.'
  }
];

function packageForQuantity(quantity) {
  if (quantity <= 1) return 'single';
  if (quantity === 2) return 'pack2';
  return 'pack3';
}

export default function ProductPage() {
  const { slug } = useParams();
  const product = findProduct(slug);
  const [quantity, setQuantity] = useState(1);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!zoom) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setZoom(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="font-manrope font-extrabold text-3xl">This sticker is not in the shop.</h1>
        <p className="mt-3 text-black/60">The link does not match a current design.</p>
        <Link to="/#shop" className="inline-flex mt-6 bg-black text-white rounded-full px-5 py-2.5 text-sm font-bold">
          Back to shop
        </Link>
      </div>
    );
  }

  const orderHref = `/order?edition=${product.editionId}&style=${product.id}&package=${packageForQuantity(quantity)}`;

  return (
    <article className="bg-[#f5f5f7] text-black pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <nav aria-label="Breadcrumb" className="text-sm text-black/55">
          <Link to="/" className="hover:text-black">Home</Link>
          <span aria-hidden="true"> → </span>
          <Link to="/#shop" className="hover:text-black">Stickers</Link>
          <span aria-hidden="true"> → </span>
          <Link to="/#shop" className="hover:text-black">{product.editionName}</Link>
          <span aria-hidden="true"> → </span>
          <span className="text-black">{product.name}</span>
        </nav>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div>
            <button
              type="button"
              onClick={() => setZoom(true)}
              className="mx-auto block w-full max-w-[340px] aspect-[230/341] bg-[#ececec] rounded-3xl overflow-hidden border border-black/5 shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
              aria-label={`Enlarge ${product.name}`}
            >
              <StickerArt product={product} />
            </button>
            <p className="mt-3 text-xs text-black/50">
              Lifestyle photos of this sticker on a laptop, bag, or helmet are not in the asset library yet. The image above is the design used for this product.
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-black/5 p-6 sm:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
            <p className="text-xs font-bold tracking-wider text-black/45">{product.editionName.toUpperCase()} EDITION</p>
            <h1 className="font-manrope font-extrabold text-4xl tracking-tight mt-2">{product.name}</h1>
            <p className="mt-3 text-2xl font-bold">PKR {product.pricePkr.toLocaleString('en-PK')}</p>
            <p className="mt-1 text-sm text-black/60">Available to order</p>
            <p className="mt-4 text-sm leading-relaxed text-black/75">{product.line}</p>
            <p className="mt-4 text-sm leading-relaxed">
              Style your belongings. Make identification easier. Help lost items find their way home. With internet, a scan opens your contact page. Without internet, it opens the phone dialer.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-black/75">{SETUP_SUMMARY}</p>
            <ul className="mt-4 text-sm text-black/70 space-y-1">
              <li>QR identity sticker for everyday belongings</li>
              <li>Scan opens the contact options saved for this sticker</li>
              <li>No app, and no location tracking</li>
            </ul>

            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm font-semibold">Quantity</span>
              <div className="inline-flex items-center border border-black/10 rounded-full">
                <button type="button" className="w-10 h-10" aria-label="Decrease quantity" onClick={() => setQuantity((n) => Math.max(1, n - 1))}>–</button>
                <span className="w-8 text-center text-sm font-bold">{quantity}</span>
                <button type="button" className="w-10 h-10" aria-label="Increase quantity" onClick={() => setQuantity((n) => Math.min(3, n + 1))}>+</button>
              </div>
            </div>
            <p className="mt-2 text-xs text-black/50">1 is PKR 999, 2 is PKR 1,499, 3 is PKR 1,999 on the order form.</p>

            <Link
              to={orderHref}
              className="mt-6 inline-flex items-center justify-center bg-black text-white rounded-full px-6 py-3 text-sm font-bold"
            >
              Buy now
            </Link>
          </div>
        </div>

        <section className="mt-14">
          <h2 className="font-manrope font-extrabold text-3xl tracking-tight">What can you use it on?</h2>
          <p className="mt-2 text-sm text-black/60 max-w-2xl">
            The sticker is for flexible everyday use when the surface can hold it and the QR stays visible.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {USES.map((item) => (
              <div key={item.title} className="glass-panel rounded-3xl p-4">
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-1 text-sm text-black/65">{item.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-manrope font-extrabold text-3xl tracking-tight">How Tagtique works</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3">
            {USE_STEPS.map((step) => (
              <div key={step.n} className="glass-panel rounded-3xl p-5">
                <p className="text-sm font-bold text-black/40">{step.n}</p>
                <h3 className="font-bold mt-2">{step.title}</h3>
                <p className="mt-2 text-sm text-black/70 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14 bg-white rounded-3xl p-6 sm:p-8 border border-black/5">
          <h2 className="font-manrope font-extrabold text-3xl tracking-tight">After you buy it</h2>
          <ol className="mt-4 space-y-3 text-sm text-black/75 leading-relaxed list-decimal pl-5">
            {SETUP_STEPS.map((step) => (
              <li key={step.n}>{step.text}</li>
            ))}
          </ol>
          <Link to={orderHref} className="mt-6 inline-flex bg-black text-white rounded-full px-5 py-2.5 text-sm font-bold">
            Get started
          </Link>
        </section>

        <section className="mt-14">
          <h2 className="font-manrope font-extrabold text-3xl tracking-tight">How scanning works</h2>
          <ol className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {[
              'Someone finds a belonging with a Tagtique sticker.',
              'They scan its QR code with their phone camera.',
              'The QR opens the public page configured for that sticker.',
              'They use the contact options on that page, such as a call or WhatsApp, when a number is saved.'
            ].map((text, index) => (
              <li key={text} className="glass-panel rounded-3xl p-4">
                <span className="font-bold">{index + 1}. </span>
                {text}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 max-w-3xl">
          <h2 className="font-manrope font-extrabold text-3xl tracking-tight">Questions</h2>
          <div className="mt-4 border-t border-black/10">
            {PRODUCT_FAQS.map((item) => (
              <details key={item.q} className="border-b border-black/10 py-3">
                <summary className="font-semibold cursor-pointer">{item.q}</summary>
                <p className="pt-2 text-sm text-black/70 leading-relaxed">{item.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      {zoom && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setZoom(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${product.name} preview`}
            className="bg-white rounded-3xl max-w-md w-full p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto w-full max-w-[min(100%,calc(70vh*230/341))] aspect-[230/341]">
              <StickerArt product={product} />
            </div>
            <button type="button" className="mt-4 w-full rounded-full bg-black text-white py-2.5 text-sm font-bold" onClick={() => setZoom(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </article>
  );
}
