import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { tagRegistryService } from '../services/tagRegistryService';
import QrRegistrationView from '../components/qr/QrRegistrationView';
import QrContactView from '../components/qr/QrContactView';
import { Sparkles, RefreshCw, Eye, UserPlus, Lock } from 'lucide-react';

export default function QrScanHubPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();

  // Extract identifier from /tag/:tagId or /scan?token=... or /scan?tag=...
  const rawId =
    params.tagId ||
    params.token ||
    searchParams.get('token') ||
    searchParams.get('tag') ||
    searchParams.get('id') ||
    searchParams.get('qr') ||
    'TGT-716242';

  const cleanTagId = String(rawId).trim().toUpperCase();

  const [activeTag, setActiveTag] = useState(() => tagRegistryService.getTag(cleanTagId));
  const [viewMode, setViewMode] = useState('info'); // 'info' (Information Page) or 'register' (Form)
  const [isEditing, setIsEditing] = useState(false);
  const [simulatedNoInfo, setSimulatedNoInfo] = useState(false);

  // Sync state if cleanTagId changes
  useEffect(() => {
    const found = tagRegistryService.getTag(cleanTagId);
    setActiveTag(found);
    setViewMode('info');
    setIsEditing(false);
    setSimulatedNoInfo(false);
  }, [cleanTagId]);

  // Determine whether actual info has been added
  const hasInfo = Boolean(
    !simulatedNoInfo &&
    activeTag &&
    (activeTag.isRegistered === true || (activeTag.ownerName && activeTag.phoneNumber && activeTag.ownerName !== 'Owner' && !activeTag.phoneNumber.includes('0000000')))
  );

  const handleRegisterSuccess = (savedTag) => {
    setActiveTag(savedTag);
    setIsEditing(false);
    setSimulatedNoInfo(false);
    setViewMode('info');
  };

  const handleOpenRegister = () => {
    setIsEditing(false);
    setViewMode('register');
  };

  const handleOpenEdit = () => {
    setIsEditing(true);
    setViewMode('register');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setViewMode('info');
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-white selection:bg-amber-400 selection:text-black py-8 sm:py-12 relative font-manrope">
      
      {/* Background Ambience */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/5 rounded-full blur-[100px] pointer-events-none" />

      {/* ================= DEV / TESTING PREVIEW SWITCHER ON TOP ================= */}
      <div className="max-w-xl mx-auto px-4 mb-4 flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10 text-xs shadow-lg">
          <span className="font-mono text-[10px] text-white/40 px-2 uppercase tracking-wider">
            Test State:
          </span>
          <button
            type="button"
            onClick={() => {
              setSimulatedNoInfo(false);
              setViewMode('info');
            }}
            className={`py-1 px-3 rounded-full font-bold text-xs transition-all cursor-pointer ${
              !simulatedNoInfo && viewMode === 'info' && hasInfo
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Show Info ({activeTag?.ownerName || 'Added Info'})
          </button>
          <button
            type="button"
            onClick={() => {
              setSimulatedNoInfo(true);
              setViewMode('info');
            }}
            className={`py-1 px-3 rounded-full font-bold text-xs transition-all cursor-pointer ${
              simulatedNoInfo && viewMode === 'info'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Show No Info (Empty)
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setViewMode('register');
            }}
            className={`py-1 px-3 rounded-full font-bold text-xs transition-all cursor-pointer ${
              viewMode === 'register'
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            Registration Form
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      {viewMode === 'register' ? (
        <QrRegistrationView
          tagId={cleanTagId}
          initialData={isEditing ? activeTag : null}
          onRegisterSuccess={handleRegisterSuccess}
          isEditing={isEditing}
          onCancelEdit={handleCancelEdit}
        />
      ) : (
        <QrContactView
          tag={hasInfo ? activeTag : { token: cleanTagId, tagId: cleanTagId }}
          hasInfo={hasInfo}
          onOpenRegister={handleOpenRegister}
          onOpenEdit={handleOpenEdit}
        />
      )}

    </div>
  );
}
