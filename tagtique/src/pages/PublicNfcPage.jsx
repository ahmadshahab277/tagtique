import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, MessageCircle } from 'lucide-react';
import VehicleHeader from '../components/vehicle/VehicleHeader';
import { nfcTagService } from '../services/nfcTagService';
import { displayPhone, normalizeTagCode } from '../utils/nfcPayload';
import { telUrl, whatsappUrl } from '../utils/contactLinks';

function openLink(url) {
  if (!url) return;
  window.location.href = url;
}

function CallBlock({ title, name, phone }) {
  const dial = telUrl(phone);
  const whatsapp = whatsappUrl(phone, 'Hello, I tapped your Tagtique tag.');
  return (
    <div className="rounded-3xl bg-white border border-[#EAE3D6] p-4 flex flex-col gap-3">
      <div>
        <p className="text-sm font-bold text-[#8C7A6B]">{title}</p>
        <p className="text-xl font-baloo font-extrabold text-[#1C120C]">{name || 'Contact'}</p>
      </div>
      <button
        type="button"
        disabled={!dial}
        onClick={() => openLink(dial)}
        className="w-full min-h-[72px] px-4 rounded-2xl bg-[#1C120C] text-[#FDF7EC] font-extrabold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Phone className="w-5 h-5 text-[#E6AF2E]" />
        Call {title === 'Guardian' ? 'guardian' : 'main owner'}
      </button>
      <button
        type="button"
        disabled={!whatsapp}
        onClick={() => openLink(whatsapp)}
        className="w-full min-h-[56px] px-4 rounded-2xl bg-emerald-700 text-white font-extrabold text-base flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <MessageCircle className="w-5 h-5" />
        WhatsApp
      </button>
    </div>
  );
}

export default function PublicNfcPage() {
  const { tagId } = useParams();
  const tagCode = normalizeTagCode(tagId);
  const [state, setState] = useState({ loading: true, offline: false, error: '', record: null });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!tagCode) {
        setState({ loading: false, offline: false, error: '', record: { found: false, status: 'missing' } });
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        setState({ loading: false, offline: true, error: '', record: null });
        return;
      }
      try {
        const record = await nfcTagService.getPublic(tagCode);
        if (!cancelled) setState({ loading: false, offline: false, error: '', record });
      } catch (error) {
        if (!cancelled) {
          setState({
            loading: false,
            offline: typeof navigator !== 'undefined' && navigator.onLine === false,
            error: error?.message || 'The latest contacts could not be loaded.',
            record: null
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tagCode]);

  const record = state.record;
  const inactive = record && record.found === false;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C120C] font-manrope">
      <VehicleHeader />
      <main className="w-full max-w-md mx-auto px-4 py-5 flex flex-col gap-4">
        <div>
          <h1 className="font-baloo font-extrabold text-3xl">Contact this vehicle</h1>
          <p className="text-sm text-[#8C7A6B] mt-1">
            {tagCode || 'Unknown tag'}
          </p>
        </div>

        {state.loading && (
          <p className="text-base text-[#8C7A6B]">Looking up the latest contacts…</p>
        )}

        {state.offline && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-950 leading-relaxed">
            This phone is offline, so the latest contacts cannot be loaded. The NFC chip itself holds a saved copy of the numbers. Open the tag in your phone’s NFC reader to see that copy. A phone that has never opened this website cannot load this page without internet.
          </div>
        )}

        {!state.loading && state.error && !state.offline && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-sm text-amber-950 leading-relaxed">
            The latest contacts could not be loaded. Numbers saved on the NFC chip are a fallback copy and can be out of date. Use your phone’s NFC reader to see what is stored on the chip.
          </div>
        )}

        {inactive && record.status === 'missing' && (
          <div className="p-4 rounded-2xl bg-white border border-[#EAE3D6] text-base">
            This tag is not registered.
          </div>
        )}

        {inactive && record.status === 'disabled' && (
          <div className="p-4 rounded-2xl bg-white border border-[#EAE3D6] text-base">
            This tag is turned off. The owner cannot be contacted from this page.
          </div>
        )}

        {inactive && record.status !== 'missing' && record.status !== 'disabled' && (
          <div className="p-4 rounded-2xl bg-white border border-[#EAE3D6] text-base">
            This tag is not active.
          </div>
        )}

        {record?.found && (
          <>
            {record.vehicleLabel && (
              <div className="rounded-3xl bg-white border border-[#EAE3D6] p-4">
                <p className="text-sm font-bold text-[#8C7A6B]">Vehicle</p>
                <p className="text-2xl font-baloo font-extrabold">{record.vehicleLabel}</p>
              </div>
            )}
            <CallBlock title="Main owner" name={record.ownerName} phone={displayPhone(record.ownerPhone)} />
            <CallBlock title="Guardian" name={record.guardianName} phone={displayPhone(record.guardianPhone)} />
            <p className="text-sm text-[#8C7A6B] leading-relaxed">
              These are the latest saved contacts. The NFC chip keeps its own copy, and that copy changes only when someone rewrites the physical tag.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
