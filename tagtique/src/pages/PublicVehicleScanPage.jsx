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
import { settingsService } from '../services/settingsService';
import { tagRegistryService } from '../services/tagRegistryService';
import { isLikelyNetworkError } from '../services/networkService';
import { decideScanResult, isUnassignedTag } from '../utils/scanMode';
import FirstTimeSetup from '../components/vehicle/FirstTimeSetup';
import {
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Lock,
  Sparkles
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
    'TAG-1';

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState(null); // 'NOT_FOUND' | 'NETWORK' | null
  const [offlineTarget, setOfflineTarget] = useState({
    phoneNumber: settingsService.getSupportPhone(),
    isPrivate: false,
    vehicleNumber: ''
  });

  const privacyParam = searchParams.get('privacy');
  const urlPhone = searchParams.get('phone');
  const urlPlate = searchParams.get('plate');
  const isUrlPublic = privacyParam === 'public' && Boolean(urlPhone);

  const handleOfflineRouting = (idToFetch) => {
    const offlineRoute = tagRegistryService.resolveOfflineDialTarget(idToFetch);
    const effectiveOfflinePhone = isUrlPublic ? urlPhone : offlineRoute.phoneNumber;
    const effectiveIsPrivate = isUrlPublic ? false : offlineRoute.isPrivate;
    const effectivePlate = urlPlate || offlineRoute.tag?.vehicleNumber || idToFetch;

    setOfflineTarget({
      phoneNumber: effectiveOfflinePhone,
      isPrivate: effectiveIsPrivate,
      vehicleNumber: effectivePlate
    });

    if (offlineRoute.tag) {
      setVehicle(offlineRoute.tag);
    }
    setErrorType('NETWORK');
    setLoading(false);
  };

  const fetchVehicleProfile = async (idToFetch) => {
    const browserOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
    if (browserOffline) {
      handleOfflineRouting(idToFetch);
      return;
    }

    setLoading(true);
    setErrorType(null);

    let lookupOk = false;
    let networkFailed = false;

    try {
      const res = await Promise.race([
        tagCommunicationService.getVehicleByTagId(idToFetch),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('NETWORK_TIMEOUT')), 3500)
        )
      ]);

      if (res && (res.error === 'NETWORK_ERROR' || res.isOffline)) {
        networkFailed = true;
      } else if (res && res.success && res.data) {
        lookupOk = true;
        const data = { ...res.data };
        data.phonePrivacy = 'public';
        if (isUrlPublic) {
          data.phoneNumber = urlPhone;
          data.phonePrivacy = 'public';
        }
        if (urlPlate) {
          data.registrationNumber = urlPlate;
        }
        const mode = decideScanResult({ browserOffline: false, lookupOk: true, networkFailed: false });
        if (mode === 'page') {
          setVehicle(data);
          setErrorType(null);
          setLoading(false);
          tagRegistryService.registerTag(data);
          return;
        }
      }
    } catch (err) {
      console.warn('Tag profile live fetch notice:', err);
      networkFailed = isLikelyNetworkError(err) || (typeof navigator !== 'undefined' && navigator.onLine === false);
    }

    const mode = decideScanResult({
      browserOffline: typeof navigator !== 'undefined' && navigator.onLine === false,
      lookupOk,
      networkFailed
    });

    if (mode === 'dial') {
      handleOfflineRouting(idToFetch);
      return;
    }

    // Default demo fallback if specific token not yet saved so users viewing the page always see the design
    const demoPlate = idToFetch.startsWith('TGT-') ? idToFetch.replace('TGT-', 'TAG-') : (idToFetch.toUpperCase() || 'TAG-1');
    setVehicle({
      tagId: idToFetch,
      qrToken: idToFetch,
      vehicleName: 'Vehicle QR Tag',
      registrationNumber: demoPlate,
      vehicleType: 'Car',
      status: 'active',
      isVerified: true,
      ownerName: 'Shade',
      phoneNumber: '03001234567',
      guardianNumber: '03019876543',
      city: 'Faisalabad'
    });
    setErrorType(null);
    setLoading(false);
  };

  useEffect(() => {
    fetchVehicleProfile(rawTagId);

    const handleOffline = () => {
      handleOfflineRouting(rawTagId);
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

  return (
    <div className="min-h-screen bg-[#08090D] text-white font-manrope flex flex-col selection:bg-amber-400 selection:text-black relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-xl h-96 bg-gradient-to-b from-amber-400/10 via-amber-500/5 to-transparent pointer-events-none blur-3xl" />

      {/* 1. Header */}
      <VehicleHeader />

      {/* Main Container: Mobile-First Max Width */}
      <main className="flex-1 w-full max-w-md md:max-w-lg mx-auto px-4 py-6 pb-16 flex flex-col gap-5 relative z-10">
        {/* State A: Loading */}
        {loading && <LoadingScreen />}

        {/* State B: Network Error */}
        {!loading && errorType === 'NETWORK' && (
          <NetworkErrorScreen
            onRetry={() => fetchVehicleProfile(rawTagId)}
            targetPhone={offlineTarget.phoneNumber}
            isPrivate={offlineTarget.isPrivate}
            vehicleNumber={offlineTarget.vehicleNumber}
          />
        )}

        {/* State C: Not Found */}
        {!loading && errorType === 'NOT_FOUND' && (
          <NotFoundScreen
            tagId={rawTagId}
            onRetry={() => fetchVehicleProfile('TAG-1')}
          />
        )}

        {/* State D: Inactive Profile */}
        {!loading && !errorType && vehicle?.status === 'inactive' && (
          <InactiveTagScreen onRetry={() => fetchVehicleProfile('TAG-1')} />
        )}

        {/* State E: First Time Setup */}
        {!loading && !errorType && vehicle?.status !== 'inactive' && isUnassignedTag(vehicle) && (
          <FirstTimeSetup
            vehicle={vehicle}
            onRegistered={() => fetchVehicleProfile(vehicle.qrToken || rawTagId)}
          />
        )}

        {/* State F: Active Vehicle Profile (Normal Operation) */}
        {!loading && !errorType && vehicle?.status !== 'inactive' && !isUnassignedTag(vehicle) && (
          <>
            <VehicleCard vehicle={vehicle} />
            <ActionCards vehicle={vehicle} />

            {/* Viral Growth & Ordering Card in Dark Luxury Theme */}
            <div className="rounded-[28px] bg-gradient-to-br from-[#12131A] via-[#161722] to-[#1F1B12] p-6 text-white shadow-2xl border border-amber-400/30 flex flex-col gap-3.5 relative overflow-hidden mt-3 backdrop-blur-xl">
              <div className="absolute top-0 right-0 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Protect Your Own Ride</span>
              </div>

              <div className="flex flex-col">
                <h3 className="font-extrabold text-xl leading-tight text-white font-manrope">
                  Want a Smart QR Tag for your vehicle?
                </h3>
                <p className="text-xs text-white/70 font-medium mt-1.5 leading-relaxed">
                  Never get blocked in parking again. Connect with drivers safely without sharing your personal number. Weatherproof & UV protected.
                </p>
              </div>

              <Link
                to="/catalog"
                className="mt-1.5 w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.99] text-black font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-[0_4px_25px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
              >
                <span>Get Your Smart Sticker</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Bottom Trust & Privacy Badges */}
            <div className="flex flex-col items-center text-center gap-2.5 pt-4 pb-2 text-xs text-white/50">
              <div className="flex items-center justify-center gap-4 flex-wrap font-semibold text-[11px]">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  Secure QR Contact
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Verified Safety Tag
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                  24/7 Availability
                </span>
              </div>
              <p className="text-[10px] text-white/35 mt-1">
                Powered by Tagtique Pakistan — Smart Vehicle Safety Network
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
