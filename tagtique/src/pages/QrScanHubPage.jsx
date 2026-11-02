import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { tagRegistryService } from '../services/tagRegistryService';
import QrRegistrationView from '../components/qr/QrRegistrationView';
import QrContactView from '../components/qr/QrContactView';
import { Sparkles, ShieldCheck, RefreshCw, QrCode } from 'lucide-react';

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
  const [isRegistered, setIsRegistered] = useState(() => tagRegistryService.isTagRegistered(cleanTagId));
  const [viewMode, setViewMode] = useState(() => (isRegistered ? 'contact' : 'register'));
  const [isEditing, setIsEditing] = useState(false);

  // Sync state if cleanTagId changes
  useEffect(() => {
    const found = tagRegistryService.getTag(cleanTagId);
    setActiveTag(found);
    const reg = tagRegistryService.isTagRegistered(cleanTagId);
    setIsRegistered(reg);
    setViewMode(reg ? 'contact' : 'register');
    setIsEditing(false);
  }, [cleanTagId]);

  const handleRegisterSuccess = (savedTag) => {
    setActiveTag(savedTag);
    setIsRegistered(true);
    setIsEditing(false);
    setViewMode('contact');
  };

  const handleOpenEdit = () => {
    setIsEditing(true);
    setViewMode('register');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setViewMode('contact');
  };

  return (
    <div className="min-h-screen bg-[#08090D] text-white selection:bg-amber-400 selection:text-black py-8 sm:py-12 relative">
      
      {/* Background Ambience */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-400/5 rounded-full blur-[100px] pointer-events-none" />

      {/* RENDER VIEW */}
      {viewMode === 'register' ? (
        <QrRegistrationView
          tagId={cleanTagId}
          initialData={activeTag}
          onRegisterSuccess={handleRegisterSuccess}
          isEditing={isEditing}
          onCancelEdit={handleCancelEdit}
        />
      ) : (
        <QrContactView
          tag={
            activeTag || {
              token: cleanTagId,
              tagId: cleanTagId,
              itemName: 'Smart Mobile Phone',
              ownerName: 'Valued Customer',
              phoneNumber: '0300 1234567',
              city: 'Faisalabad, Pakistan',
              category: 'mobile',
              rewardOffered: true,
              customNote: 'Assalam-o-Alaikum! If you found this item, please message or call me so I can retrieve it safely.'
            }
          }
          onOpenEdit={handleOpenEdit}
        />
      )}

      {/* ================= TESTING & DEV PREVIEW TOGGLE PILL ================= */}
      <div className="max-w-md mx-auto px-4 mt-8 flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10 text-xs shadow-lg">
          <span className="font-mono text-[10px] text-white/40 px-2 uppercase tracking-wider">
            Switch View:
          </span>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setViewMode('register');
            }}
            className={`py-1 px-3 rounded-full font-bold text-xs transition-all cursor-pointer ${
              viewMode === 'register' && !isEditing
                ? 'bg-amber-400 text-black shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            1. First-Time Registration
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setViewMode('contact');
            }}
            className={`py-1 px-3 rounded-full font-bold text-xs transition-all cursor-pointer ${
              viewMode === 'contact'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            2. Public Contact Card
          </button>
        </div>
      </div>

    </div>
  );
}
