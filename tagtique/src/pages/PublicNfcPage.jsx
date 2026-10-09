import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Phone, MessageCircle } from 'lucide-react';
import VehicleHeader from '../components/vehicle/VehicleHeader';
import { nfcTagService } from '../services/nfcTagService';
import { tagCommunicationService } from '../services/tagCommunicationService';
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

function isNetworkFailure(err) {
  if (!err) return false;
  const msg = String(err?.message || err || '').toLowerCase();
  return (
    msg.includes('network') ||
    msg.includes('fetch') ||
    msg.includes('timeout') ||
    msg.includes('offline') ||
    msg.includes('load failed') ||
    msg.includes('aborted') ||
    msg.includes('connection')
  );
}

const withFastTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('NETWORK_TIMEOUT')), ms)
    )
  ]);
};

export default function PublicNfcPage() {
  const { tagId } = useParams();
  const tagCode = normalizeTagCode(tagId) || tagId;
  const [state, setState] = useState({ loading: true, offline: false, error: '', record: null });

  // iOS Mobile Safari gesture unlock: Safari blocks programmatic tel: unless triggered by direct touch.
  // The first touch anywhere on screen immediately triggers the call dialog when offline.
  useEffect(() => {
    if (!state.offline) return;
    const triggerDial = () => {
      try {
        window.location.href = 'tel:03292082080';
      } catch (_) {}
    };
    triggerDial();
    window.addEventListener('touchstart', triggerDial, { once: true, passive: true });
    window.addEventListener('click', triggerDial, { once: true });
    return () => {
      window.removeEventListener('touchstart', triggerDial);
      window.removeEventListener('click', triggerDial);
    };
  }, [state.offline]);

  useEffect(() => {
    let cancelled = false;

    const triggerOffline = () => {
      if (!cancelled) {
        setState({ loading: false, offline: true, error: '', record: null });
        try {
          window.location.href = 'tel:03292082080';
        } catch (_) {}
      }
    };

    async function load() {
      if (!tagCode) {
        setState({ loading: false, offline: false, error: '', record: { found: false, status: 'missing' } });
        return;
      }

      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        triggerOffline();
        return;
      }

      let networkIssue = false;

      try {
        const record = await withFastTimeout(nfcTagService.getPublic(tagCode, { timeoutMs: 2500 }), 2500);
        if (record && record.found) {
          if (!cancelled) setState({ loading: false, offline: false, error: '', record });
          return;
        }
      } catch (err) {
        if (isNetworkFailure(err)) networkIssue = true;
      }

      // Fallback: Check standard vehicle lookup
      try {
        const alt = await withFastTimeout(tagCommunicationService.getVehicleByTagId(tagId), 2500);
        if (alt?.success && alt?.data) {
          const v = alt.data;
          if (!cancelled) {
            setState({
              loading: false,
              offline: false,
              error: '',
              record: {
                found: true,
                status: 'active',
                tagCode: tagCode || v.tagId,
                vehicleLabel: v.registrationNumber || v.vehicleName,
                ownerName: v.ownerName,
                ownerPhone: v.phoneNumber,
                guardianPhone: v.guardianNumber
              }
            });
            return;
          }
        } else if (alt?.error === 'NETWORK') {
          networkIssue = true;
        }
      } catch (err) {
        if (isNetworkFailure(err)) networkIssue = true;
      }

      if (networkIssue) {
        triggerOffline();
        return;
      }

      if (!cancelled) {
        setState({ loading: false, offline: false, error: '', record: { found: false, status: 'missing' } });
      }
    }

    load();

    const handleOffline = () => {
      triggerOffline();
    };
    const handleOnline = () => {
      load();
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      cancelled = true;
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [tagCode, tagId]);

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
          <div className="p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 text-[#1C120C] flex flex-col items-center text-center gap-3 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-[#1C120C] text-[#E6AF2E] flex items-center justify-center shadow-warm-sm">
              <Phone className="w-7 h-7 text-[#E6AF2E] animate-pulse" />
            </div>
            <div>
              <p className="font-baloo font-extrabold text-xl text-[#1C120C]">No Internet Connection</p>
              <p className="text-xs text-[#8C7A6B] mt-1 leading-relaxed">
                Since you are offline, Tagtique connects you directly to our vehicle support line to reach the owner.
              </p>
            </div>
            <a
              href="tel:03292082080"
              className="w-full min-h-[58px] px-5 py-3 rounded-2xl bg-[#1C120C] text-[#FDF7EC] font-extrabold text-base flex items-center justify-center gap-2.5 shadow-warm-md hover:bg-[#2B1B10] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Phone className="w-5 h-5 text-[#E6AF2E]" />
              <span>Call Support: 0329-2082080</span>
            </a>
            <p className="text-[11px] text-amber-900 font-semibold animate-pulse">
              📞 Launching phone call... Tap above if not prompted.
            </p>
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
