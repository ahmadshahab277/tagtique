import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import VehicleHeader from '../components/vehicle/VehicleHeader';
import VehicleCard from '../components/vehicle/VehicleCard';
import ActionCards from '../components/vehicle/ActionCards';
import ContactDriverModal from '../components/vehicle/ContactDriverModal';
import SendMessageModal from '../components/vehicle/SendMessageModal';
import EmergencyModal from '../components/vehicle/EmergencyModal';
import ReportIssueModal from '../components/vehicle/ReportIssueModal';
import {
  LoadingScreen,
  InactiveTagScreen,
  NotFoundScreen,
  NetworkErrorScreen
} from '../components/vehicle/StatusScreens';
import { tagCommunicationService } from '../services/tagCommunicationService';
import { ShieldCheck, Lock, Sparkles } from 'lucide-react';

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

  // Modal display states
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 flex flex-col gap-5">
        
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
            {/* 2. Vehicle Information Card */}
            <VehicleCard vehicle={vehicle} />

            {/* 3. Main Message & Action Buttons */}
            <ActionCards
              onContactDriver={() => setIsContactModalOpen(true)}
              onSendMessage={() => setIsMessageModalOpen(true)}
              onEmergencyAlert={() => setIsEmergencyModalOpen(true)}
              onReportIssue={() => setIsReportModalOpen(true)}
            />

            {/* Security & Trust Footer Assurance */}
            <div className="mt-4 p-4 rounded-2xl bg-white border border-[#EAE3D6] flex flex-col gap-2 text-center text-xs text-[#8C7A6B] shadow-2xs">
              <div className="flex items-center justify-center gap-1.5 font-bold text-[#1C120C]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Tagtique Verified Contact Proxy</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#8C7A6B]">
                Your communication is encrypted and routed securely through our smart vehicle proxy. Neither party's private telephone number or home address is exposed.
              </p>
              <div className="flex items-center justify-center gap-3 pt-1 text-[10.5px] font-mono text-[#A89889]">
                <span>256-Bit SSL</span>
                <span>•</span>
                <span>Anti-Spam Filter</span>
                <span>•</span>
                <span>Audit Logged</span>
              </div>
            </div>

            {/* Interactive Demo Test Toolbar (For customer demonstration) */}
            <div className="mt-2 p-3 rounded-2xl bg-[#F3EDE2]/60 border border-[#EAE3D6] flex flex-col gap-1.5 text-center">
              <span className="text-[10.5px] font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D49A1F]" />
                <span>Demo State Switcher:</span>
              </span>
              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => fetchVehicleProfile('TAG-001')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#EAE3D6] text-[11px] font-bold text-[#1C120C] hover:bg-[#FAF7F2] transition-colors"
                >
                  Toyota Corolla (Active)
                </button>
                <button
                  type="button"
                  onClick={() => fetchVehicleProfile('TAG-INACTIVE')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#EAE3D6] text-[11px] font-bold text-amber-800 hover:bg-amber-50 transition-colors"
                >
                  Test Inactive Tag
                </button>
                <button
                  type="button"
                  onClick={() => fetchVehicleProfile('TAG-404')}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#EAE3D6] text-[11px] font-bold text-red-800 hover:bg-red-50 transition-colors"
                >
                  Test 404 Tag
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      <ContactDriverModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        vehicle={vehicle}
        onSelectSendMessage={() => setIsMessageModalOpen(true)}
      />

      <SendMessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        vehicle={vehicle}
      />

      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        vehicle={vehicle}
      />

      <ReportIssueModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        vehicle={vehicle}
      />
    </div>
  );
}
