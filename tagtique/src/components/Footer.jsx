import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-tag-brown text-[#E9D9C1] pt-14 pb-8 border-t border-tag-brown-deep">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Brand Info */}
          <div className="md:col-span-7 flex flex-col gap-4">
            <Link to="/">
              <img
                src="/assets/tagtique-logo.png"
                alt="Tagtique"
                className="w-36 sm:w-44 h-auto drop-shadow-md"
              />
            </Link>
            <p className="text-sm text-[#C7B294] leading-relaxed max-w-md">
              Custom tactile 3D QR tags made to be seen and kept forever. Designed in Faisalabad, shipped worldwide.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-tag-amber pt-2">
              <span className="w-2 h-2 rounded-full bg-tag-amber" />
              <span>SOLID ACRYLIC & STAINLESS STEEL</span>
            </div>
          </div>

          {/* Links Column: Support */}
          <div className="md:col-span-5 flex flex-col gap-3 md:items-end">
            <div className="flex flex-col gap-3 max-w-xs w-full">
              <span className="font-mono text-[11px] font-bold tracking-wider text-tag-amber uppercase">
                SUPPORT & CONTACT
              </span>
              <a
                href="https://wa.me/923292082080"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#C7B294] hover:text-white font-medium transition-colors"
              >
                WhatsApp: 0329-2082080
              </a>
              <a
                href="mailto:ataitsolution09@gmail.com"
                className="text-sm text-tag-amber hover:text-white font-medium transition-colors break-all"
              >
                ataitsolution09@gmail.com
              </a>
              <div className="text-xs text-[#C7B294] leading-relaxed pt-2 border-t border-[#FDF7EC]/10">
                <span className="font-semibold text-white/90 block mb-0.5">Address:</span>
                208 Chak Road, West Canal Road, Faisalabad, Pakistan
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#FDF7EC]/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#A88B64]">
          <div className="flex items-center gap-3">
            <span>© 2026 Tagtique. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#terms" className="hover:text-white transition-colors">
              Terms of Service
            </a>
            <span className="font-mono">Faisalabad, PK</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
