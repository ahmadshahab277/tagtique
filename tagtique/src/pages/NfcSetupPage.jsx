import React, { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findNfcDesign } from '../data/nfcCards';
import { NFC_FIELDS, createNfcProfile, fieldError, saveNfcProfile, visibleProfileFields } from '../data/nfcProfile';
import { getPublicSiteOrigin } from '../utils/scanUrl';
import NfcCardArt from '../components/NfcCardArt';

export default function NfcSetupPage() {
  const { designId } = useParams();
  const design = findNfcDesign(designId);
  const [profile, setProfile] = useState(() => createNfcProfile(designId));
  const [saved, setSaved] = useState(false);

  const publicUrl = `${getPublicSiteOrigin()}/profile/${profile.id}`;
  const shown = useMemo(() => visibleProfileFields(profile), [profile]);

  if (!design) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h1 className="font-manrope font-extrabold text-3xl">Choose a card first.</h1>
        <Link to="/#nfc" className="inline-flex mt-6 bg-black text-white rounded-full px-5 py-2.5 text-sm font-bold">NFC cards</Link>
      </div>
    );
  }

  const updateField = (id, patch) => {
    setSaved(false);
    setProfile((current) => ({
      ...current,
      fields: { ...current.fields, [id]: { ...current.fields[id], ...patch } }
    }));
  };

  const save = (event) => {
    event.preventDefault();
    const invalid = NFC_FIELDS.some((field) => profile.fields[field.id].enabled && fieldError(field, profile.fields[field.id].value));
    if (invalid || !profile.name.trim()) return;
    saveNfcProfile({ ...profile, designId: design.id });
    setSaved(true);
  };

  return (
    <div className="bg-[#f5f5f7] text-black pb-16">
      <form onSubmit={save} className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <p className="text-xs font-bold tracking-wider text-black/45">NFC PROFILE</p>
          <h1 className="font-manrope font-extrabold text-4xl tracking-tight mt-2">Set what the tap shows</h1>
          <p className="mt-3 text-sm text-black/65 leading-relaxed">
            Turn a field on to show it. Turn it off to hide it. The value stays saved. This browser keeps the profile. The shop still has to program the physical card with the link below. Saving here does not write the chip.
          </p>

          <label className="mt-6 block text-sm font-semibold">
            Display name
            <input
              required
              value={profile.name}
              onChange={(event) => { setSaved(false); setProfile((current) => ({ ...current, name: event.target.value })); }}
              className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2.5"
            />
          </label>
          <label className="mt-4 block text-sm font-semibold">
            Short introduction
            <textarea
              value={profile.bio}
              onChange={(event) => { setSaved(false); setProfile((current) => ({ ...current, bio: event.target.value })); }}
              className="mt-1 w-full rounded-2xl border border-black/10 px-3 py-2.5 min-h-20"
            />
          </label>

          <div className="mt-6 flex flex-col gap-3">
            {NFC_FIELDS.map((field) => {
              const entry = profile.fields[field.id];
              const error = entry.enabled ? fieldError(field, entry.value) : '';
              return (
                <div key={field.id} className="bg-white rounded-3xl border border-black/5 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold" id={`${field.id}-label`}>{field.label}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={entry.enabled}
                      aria-labelledby={`${field.id}-label`}
                      onClick={() => updateField(field.id, { enabled: !entry.enabled })}
                      className={`w-12 h-7 rounded-full p-1 ${entry.enabled ? 'bg-black' : 'bg-black/15'}`}
                    >
                      <span className={`block w-5 h-5 rounded-full bg-white transition-transform ${entry.enabled ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                  {entry.enabled && (
                    <>
                      <input
                        value={entry.value}
                        onChange={(event) => updateField(field.id, { value: event.target.value })}
                        placeholder={field.placeholder}
                        aria-invalid={Boolean(error)}
                        className="mt-3 w-full rounded-2xl border border-black/10 px-3 py-2.5"
                      />
                      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <button type="submit" className="mt-6 bg-black text-white rounded-full px-6 py-3 text-sm font-bold">Save profile</button>
          {saved && (
            <p className="mt-3 text-sm">
              Saved on this browser. Profile link: <Link className="underline" to={`/profile/${profile.id}`}>{publicUrl}</Link>
            </p>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 h-fit">
          <NfcCardArt design={design} side="back" qrValue={publicUrl} serial={profile.id.slice(0, 12).toUpperCase()} />
          <div className="mt-4 bg-white rounded-3xl border border-black/5 p-5">
            <p className="text-xs font-bold tracking-wider text-black/45">PUBLIC PREVIEW</p>
            <h2 className="font-bold text-2xl mt-2">{profile.name || 'Your name'}</h2>
            {profile.bio && <p className="mt-2 text-sm text-black/70">{profile.bio}</p>}
            <ul className="mt-4 flex flex-col gap-2">
              {shown.length === 0 && <li className="text-sm text-black/50">Nothing public yet. Turn a valid field on.</li>}
              {shown.map((field) => (
                <li key={field.id}>
                  <a href={field.href} className="text-sm font-semibold underline">{field.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </form>
    </div>
  );
}
