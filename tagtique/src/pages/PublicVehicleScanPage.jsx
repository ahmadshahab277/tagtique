import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import VehicleHeader from '../components/vehicle/VehicleHeader';
import VehicleCard from '../components/vehicle/VehicleCard';
import ActionCards from '../components/vehicle/ActionCards';
import {
  LoadingScreen,
  InactiveTagScreen,
  NotFoundScreen,
  NetworkErrorScreen
} from '../components/vehicle/StatusScreens';
import { tagCommunicationService } from '../services/tagCommunicationService';
import { isWebNfcSupported } from '../utils/nfcWriter';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function PublicVehicleScanPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();

  // Resolve tag ID from /tag/:tagId, or query params /scan?token=..., /scan?tag=...
  const rawTagId =
    params.tagId ||
    params.username ||
    searchParams.get('token') ||
    searchParams.get('tag') ||
    searchParams.get('qr') ||
    'TAG-001';

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState(null); // 'NOT_FOUND' | 'NETWORK' | null

  const privacyParam = searchParams.get('privacy');

  const fetchVehicleProfile = async (idToFetch) => {
    // If phone has no internet connection, route immediately to support number
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setErrorType('NETWORK');
      setLoading(false);
      try {
        window.location.href = 'tel:03292082080';
      } catch (_) {}
      return;
    }

    setLoading(true);
    setErrorType(null);

    try {
      const res = await Promise.race([
        tagCommunicationService.getVehicleByTagId(idToFetch),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('NETWORK_TIMEOUT')), 2500)
        )
      ]);

      if (res.success && res.data) {
        const data = { ...res.data };
        if (privacyParam === 'public' || privacyParam === 'private') {
          data.phonePrivacy = privacyParam;
        }
        setVehicle(data);
      } else {
        setErrorType(res.error === 'TAG_NOT_FOUND' ? 'NOT_FOUND' : 'NETWORK');
      }
    } catch (err) {
      console.error('Tag profile load error:', err);
      setErrorType('NETWORK');
      try {
        window.location.href = 'tel:03292082080';
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleProfile(rawTagId);

    const handleOffline = () => {
      setErrorType('NETWORK');
      setLoading(false);
      try {
        window.location.href = 'tel:03292082080';
      } catch (_) {}
    };

    const handleOnline = () => {
      fetchVehicleProfile(rawTagId);
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [rawTagId, privacyParam]);

  // Passive Background NFC Listener (if device supports Web NFC)
  useEffect(() => {
    if (!isWebNfcSupported()) return;

    let controller = new AbortController();

    const startPassiveReader = async () => {
      try {
        const reader = new window.NDEFReader();
        await reader.scan({ signal: controller.signal });

        reader.onreading = (event) => {
          for (const record of event.message.records) {
            let text = '';
            if (record.recordType === 'text') {
              const dec = new TextDecoder(record.encoding || 'utf-8');
              text = dec.decode(record.data);
            } else if (record.recordType === 'url') {
              const dec = new TextDecoder();
              text = typeof record.data === 'string' ? record.data : dec.decode(record.data);
            }

            if (text) {
              const tokenMatch = text.match(/[?&](?:token|tag|qr)=([^&\s]+)/i);
              const nfcMatch = text.match(/\/nfc\/([^/?\s]+)/i);
              const detected = tokenMatch ? decodeURIComponent(tokenMatch[1]) : nfcMatch ? nfcMatch[1] : text.trim();
              if (detected) {
                fetchVehicleProfile(detected);
                break;
              }
            }
          }
        };
      } catch (err) {
        console.warn('Passive NFC not auto-started:', err);
      }
    };

    startPassiveReader();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C120C] font-manrope flex flex-col selection:bg-[#E6AF2E] selection:text-[#1C120C] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-gradient-to-b from-amber-500/5 via-amber-200/5 to-transparent pointer-events-none blur-3xl" />

      {/* 1. Header */}
      <VehicleHeader />

      {/* Main Container: Mobile-First Max Width */}
      <main className="flex-1 w-full max-w-md md:max-w-lg mx-auto px-4 py-5 pb-12 flex flex-col gap-5 relative z-10">
        {/* State A: Loading */}
        {loading && <LoadingScreen />}

        {/* State B: Network Error */}
        {!loading && errorType === 'NETWORK' && (
          <NetworkErrorScreen onRetry={() => fetchVehicleProfile(rawTagId)} />
        )}

        {/* State C: Not Found */}
        {!loading && errorType === 'NOT_FOUND' && (
          <NotFoundScreen
            tagId={rawTagId}
            onRetry={() => fetchVehicleProfile('TAG-001')}
          />
        )}

        {/* State D: Inactive Profile */}
        {!loading && !errorType && vehicle?.status === 'inactive' && (
          <InactiveTagScreen onRetry={() => fetchVehicleProfile('TAG-001')} />
        )}

        {/* State E: Active Vehicle Profile (Normal Operation) */}
        {!loading && !errorType && vehicle?.status !== 'inactive' && (
          <>
            <VehicleCard vehicle={vehicle} />
            <ActionCards vehicle={vehicle} />

            {/* Viral Growth & Ordering Card */}
            <div className="rounded-3xl bg-gradient-to-br from-[#1C120C] to-[#2B1B10] p-5 text-white shadow-warm-sm border border-amber-900/30 flex flex-col gap-3 relative overflow-hidden mt-2">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#E6AF2E]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#E6AF2E]">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Protect Your Own Ride</span>
              </div>

              <div className="flex flex-col">
                <h3 className="font-baloo font-extrabold text-xl leading-tight text-[#FDF7EC]">
                  Want a Smart QR Sticker for your vehicle?
                </h3>
                <p className="text-xs text-white/70 font-medium mt-1 leading-relaxed">
                  Never get blocked in parking again. Connect with drivers safely without sharing your personal number. Weatherproof & UV protected.
                </p>
              </div>

              <Link
                to="/order"
                className="mt-1 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E6AF2E] to-[#F59E0B] hover:from-[#F59E0B] hover:to-[#D97706] active:scale-[0.98] text-[#1C120C] font-extrabold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <span>Get Your Smart Sticker</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Bottom Trust & Privacy Badges */}
            <div className="flex flex-col items-center text-center gap-2 pt-2 pb-2 text-xs text-[#8C7A6B]">
              <div className="flex items-center justify-center gap-4 flex-wrap font-semibold text-[11px]">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  Secure QR Contact
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-700" />
                  Verified Safety Tag
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  24/7 Availability
                </span>
              </div>
              <p className="text-[10px] text-[#A8988B] mt-0.5">
                Powered by Tagtique Pakistan • Smart Vehicle Safety Network
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
