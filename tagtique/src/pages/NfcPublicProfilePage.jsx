import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { loadNfcProfile, visibleProfileFields } from '../data/nfcProfile';
import { findNfcDesign } from '../data/nfcCards';
import { downloadVCard } from '../utils/vcard';

export default function NfcPublicProfilePage() {
  const { profileId } = useParams();
  const profile = profileId === 'unassigned' ? null : loadNfcProfile(profileId);
  const design = findNfcDesign(profile?.designId);
  const shown = visibleProfileFields(profile);

  if (profileId === 'unassigned') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="font-manrope font-extrabold text-3xl">This card is not linked yet.</h1>
        <p className="mt-3 text-sm text-black/65">The QR on an unassigned preview opens this page. After setup, the shop points the chip and the printed QR at the owner’s profile link.</p>
        <Link to="/#nfc" className="inline-flex mt-6 bg-black text-white rounded-full px-5 py-2.5 text-sm font-bold">See the cards</Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="font-manrope font-extrabold text-3xl">Profile not on this device.</h1>
        <p className="mt-3 text-sm text-black/65">Profiles are saved in the browser that created them. Another phone will not see the links until the shop stores that profile for the card. Nothing private is shown here.</p>
      </div>
    );
  }

  const phone = shown.find((field) => field.id === 'phone');
  const email = shown.find((field) => field.id === 'email');

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <article className="bg-white rounded-[28px] border border-black/5 p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
        <p className="text-xs font-bold tracking-wider text-black/40">{design ? design.name : 'Tagtique'} · NFC</p>
        <h1 className="font-manrope font-extrabold text-3xl mt-2">{profile.name}</h1>
        {profile.bio && <p className="mt-2 text-sm text-black/70">{profile.bio}</p>}
        <div className="mt-5 flex flex-col gap-2">
          {shown.map((field) => (
            <a key={field.id} href={field.href} className="rounded-2xl border border-black/10 px-4 py-3 text-sm font-semibold">
              {field.label}
              <span className="block font-normal text-black/55 truncate">{field.value}</span>
            </a>
          ))}
        </div>
        <button
          type="button"
          className="mt-5 w-full rounded-full bg-black text-white py-3 text-sm font-bold"
          onClick={() => downloadVCard({
            name: profile.name,
            phone: phone?.value,
            email: email?.value,
            note: 'Saved from a Tagtique NFC card'
          })}
        >
          Save contact
        </button>
      </article>
    </div>
  );
}
