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

  const fetchVehicleProfile = async (idToFetch) => {
    setLoading(true);
    setErrorType(null);

    try {
      const res = await tagCommunicationService.getVehicleByTagId(idToFetch);

      if (res.success && res.data) {
        setVehicle(res.data);
      } else {
        setErrorType(res.error === 'TAG_NOT_FOUND' ? 'NOT_FOUND' : 'NETWORK');
      }
    } catch (err) {
      console.error('Tag profile load error:', err);
      setErrorType('NETWORK');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleProfile(rawTagId);
  }, [rawTagId]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1C120C] font-manrope flex flex-col selection:bg-[#E6AF2E] selection:text-[#1C120C]">
      {/* 1. Header */}
      <VehicleHeader />

      {/* Main Container: Mobile-First Max Width */}
      <main className="flex-1 w-full max-w-md md:max-w-lg mx-auto px-4 py-5 pb-10 flex flex-col gap-5">
        
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
