import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
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
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C120C] font-manrope flex flex-col selection:bg-[#E6AF2E] selection:text-[#1C120C]">
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
          </>
        )}
      </main>
    </div>
  );
}
