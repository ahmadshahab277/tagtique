import React from 'react';
import { Link } from 'react-router-dom';

export default function VehicleHeader() {
  return (
    <header className="w-full bg-white border-b border-[#EAE3D6] sticky top-0 z-30">
      <div className="max-w-md md:max-w-lg mx-auto px-4 py-3 flex items-center">
        <Link to="/" className="flex items-center">
          <img
            src="/assets/tagtique-logo.png"
            alt="Tagtique"
            className="h-9 w-auto object-contain"
          />
        </Link>
      </div>
    </header>
  );
}
