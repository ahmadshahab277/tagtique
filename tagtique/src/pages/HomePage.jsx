import React, { useRef, useState } from 'react';
import HeroSection from '../components/HeroSection';
import PricingSection from '../components/PricingSection';
import ScrollMascotSticker from '../components/ScrollMascotSticker';
import HowItWorksSection from '../components/HowItWorksSection';
import NfcCardSection from '../components/NfcCardSection';
import FaqSection from '../components/FaqSection';
import { SHOWCASE_EDITIONS } from '../data/showcaseEditions';

export default function HomePage() {
  const heroAnchorRef = useRef(null);
  const mascotAnchorRef = useRef(null);
  const [isDocked, setIsDocked] = useState(false);
  const [activeEdition, setActiveEdition] = useState('mascot');

  // Currently selected character in each edition (syncs bidirectionally with Hero)
  const [selectedMascot, setSelectedMascot] = useState(SHOWCASE_EDITIONS.mascot.characters[0]);
  const [selectedAnime, setSelectedAnime] = useState(SHOWCASE_EDITIONS.anime.characters[0]);
  const [selectedCollection, setSelectedCollection] = useState(SHOWCASE_EDITIONS.collections.characters[0]);

  const handleSelectCharacter = (editionId, character) => {
    if (editionId === 'mascot') setSelectedMascot(character);
    if (editionId === 'anime') setSelectedAnime(character);
    if (editionId === 'collections') setSelectedCollection(character);
  };

  // Active character currently in the spotlight and eligible for scroll flight
  const activeCharacter = 
    activeEdition === 'mascot'
      ? selectedMascot
      : activeEdition === 'anime'
      ? selectedAnime
      : selectedCollection;

  return (
    <div className="flex flex-col bg-[#08090D] text-white relative">
      {/* 3D Interactive Hero Section with 2-Way Edition & Character Sync */}
      <HeroSection
        heroAnchorRef={heroAnchorRef}
        activeEdition={activeEdition}
        onEditionChange={setActiveEdition}
        selectedMascot={selectedMascot}
        selectedAnime={selectedAnime}
        selectedCollection={selectedCollection}
      />

      {/* Unified Master Showcase Container (Mascot, Anime, Collections with dynamic character glow) */}
      <PricingSection
        activeEdition={activeEdition}
        onEditionChange={setActiveEdition}
        activeCharacter={activeCharacter}
        onSelectCharacter={handleSelectCharacter}
        mascotAnchorRef={mascotAnchorRef}
        isDocked={isDocked}
      />

      {/* High-Performance Smooth Scroll Flying Sticker */}
      <ScrollMascotSticker
        heroAnchorRef={heroAnchorRef}
        mascotAnchorRef={mascotAnchorRef}
        isDocked={isDocked}
        onDockChange={setIsDocked}
        activeCharacter={activeCharacter}
      />

      {/* Educational Dual-Recovery Guide */}
      <HowItWorksSection />

      {/* NFC Metal Business Cards */}
      <NfcCardSection />

      {/* Interactive FAQ Accordion */}
      <FaqSection />
    </div>
  );
}
