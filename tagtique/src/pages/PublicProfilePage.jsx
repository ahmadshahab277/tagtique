import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { downloadVCard } from '../utils/vcard';
import { orderBackendService } from '../services/orderBackendService';
import {
  Phone,
  Mail,
  Download,
  ExternalLink,
  MessageCircle,
  ArrowRight
} from 'lucide-react';

function InstagramIcon({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

export default function PublicProfilePage() {
  const { userProfile } = useCart();
  const [searchParams] = useSearchParams();
  const params = useParams();
  const [scannedTag, setScannedTag] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const token = searchParams.get('token') || searchParams.get('qr') || params.username || '';

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      orderBackendService.lookupTagByToken(token).then((data) => {
        setIsLoading(false);
        if (data && data.isValid) {
          setScannedTag(data);
          orderBackendService.logTagScan(token, data.tagId);
        }
      });
    }
  }, [token]);

  const activeProfile = scannedTag
    ? {
        name: scannedTag.ownerName || 'Vehicle Owner',
        title: `${scannedTag.vehicleType} • Plate ${scannedTag.vehicleNumber}`,
        organization: scannedTag.vehicleType || '',
        phone: scannedTag.phoneNumber,
        email: userProfile.email || '',
        instagram: userProfile.instagram || '',
        whatsapp: scannedTag.phoneNumber,
        bio: `Owner of ${scannedTag.vehicleType} (${scannedTag.vehicleNumber}). Reachable via direct call or masked WhatsApp relay.`
      }
    : userProfile;

  const handleSaveContact = () => {
    downloadVCard({
      name: activeProfile.name || 'Contact',
      title: activeProfile.title,
      organization: activeProfile.organization,
      phone: activeProfile.phone,
      email: activeProfile.email,
      instagram: activeProfile.instagram,
      note: 'Saved from Tagtique 3D QR Tag'
    });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center p-4 sm:p-8 bg-tag-bg bg-dot-pattern [background-size:22px_22px] font-manrope">
      
      {/* Profile card */}
      <div className="w-full max-w-sm rounded-[36px] bg-tag-card border-[2.5px] border-tag-brown-deep shadow-warm-lg overflow-hidden flex flex-col">
        
        {/* Card Header Chrome */}
        <div className="bg-tag-brown text-[#FDF7EC] px-5 py-3 flex items-center justify-between border-b border-tag-brown-deep">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-mono text-[10.5px] font-bold tracking-wider text-tag-amber uppercase">
              TAGTIQUE CONNECT
            </span>
          </div>
          <span className="font-mono text-[10px] text-[#A88B64]">Contact card</span>
        </div>

        {/* Card Body */}
        <div className="p-6 flex flex-col gap-5">
          
          {!activeProfile.name && !activeProfile.phone ? (
            <p className="text-sm text-tag-brown-muted">This link does not have a public contact card yet.</p>
          ) : (
            <>
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-tag-brown-deep bg-gradient-to-tr from-tag-amber to-amber-200 flex items-center justify-center font-baloo font-extrabold text-2xl text-tag-brown-deep shadow-md">
                    {(activeProfile.name || '?').split(' ').map((n) => n[0]).join('')}
                  </div>
                </div>

                <div className="flex flex-col min-w-0">
                  <h2 className="font-baloo font-extrabold text-2xl text-tag-brown leading-tight truncate">
                    {activeProfile.name || 'Contact'}
                  </h2>
                  <span className="text-xs font-semibold text-tag-brown-light truncate">
                    {activeProfile.title}
                  </span>
                  <span className="font-mono text-[9.5px] text-tag-brown-subtle tracking-wider mt-0.5">
                    Tagtique
                  </span>
                </div>
              </div>

              {activeProfile.bio ? (
                <p className="text-xs sm:text-sm text-tag-brown-muted leading-relaxed font-medium bg-tag-bg p-3.5 rounded-2xl border border-tag-border/70">
                  {activeProfile.bio}
                </p>
              ) : null}

              {/* Primary 1-Tap Save Button */}
              <button
                type="button"
                onClick={handleSaveContact}
                className="amber-gradient-btn w-full py-3.5 rounded-full text-sm font-extrabold text-tag-brown flex items-center justify-center gap-2 shadow-warm-sm"
              >
                <Download className="w-4 h-4" />
                <span>Save to Contacts (.vcf)</span>
              </button>

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <a
                  href={`tel:${activeProfile.phone}`}
                  className="p-2.5 rounded-2xl border border-tag-border bg-tag-bg hover:bg-tag-pill transition-colors flex flex-col items-center gap-1 text-tag-brown"
                >
                  <Phone className="w-4 h-4 text-tag-brown-light" />
                  <span className="text-[10px] font-bold">Call</span>
                </a>
                <a
                  href={activeProfile.email ? `mailto:${activeProfile.email}` : undefined}
                  className="p-2.5 rounded-2xl border border-tag-border bg-tag-bg hover:bg-tag-pill transition-colors flex flex-col items-center gap-1 text-tag-brown"
                >
                  <Mail className="w-4 h-4 text-tag-brown-light" />
                  <span className="text-[10px] font-bold">Email</span>
                </a>
                <a
                  href={`https://wa.me/${String(activeProfile.whatsapp || activeProfile.phone).replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-2xl border border-tag-border bg-tag-bg hover:bg-tag-pill transition-colors flex flex-col items-center gap-1 text-tag-brown"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span className="text-[10px] font-bold">WhatsApp</span>
                </a>
              </div>

              {userProfile.instagram ? (
              <a
                href={`https://instagram.com/${userProfile.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-tag-bg border border-tag-border/60 hover:border-tag-amber transition-colors text-tag-brown font-semibold text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <InstagramIcon className="w-4 h-4 text-tag-brown-light" />
                  <span>Instagram</span>
                </div>
                <span className="text-tag-brown-subtle flex items-center gap-1">
                  {userProfile.instagram}
                  <ExternalLink className="w-3 h-3" />
                </span>
              </a>
              ) : null}
            </>
          )}

          {/* Footer promo */}
          <div className="pt-2 border-t border-tag-border/60 text-center flex flex-col gap-2">
            <Link
              to="/order"
              className="text-xs font-bold text-tag-brown hover:text-tag-amber-deep flex items-center justify-center gap-1.5"
            >
              <span>Get your own custom 3D Tagtique</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
