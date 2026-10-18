import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SHOWCASE_EDITIONS } from '../data/showcaseEditions';
import { NFC_DESIGNS, NFC_CARD_PRICE_PKR } from '../data/nfcCards';
import NfcCardArt from '../components/NfcCardArt';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Flame,
  Layers,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Filter,
  ShieldCheck,
  Zap,
  Truck,
  X
} from 'lucide-react';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const [activeTab, setActiveTab] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');

  // Sync state if URL search param changes
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter) {
      setActiveTab(filter);
    }
  }, [searchParams]);

  // Handle Tab switch and update URL param cleanly
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'all') {
      searchParams.delete('filter');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ filter: tabId });
    }
  };

  // Compile all 50 products across all sections
  const allProducts = useMemo(() => {
    const mascotList = (SHOWCASE_EDITIONS.mascot.characters || []).map((item) => ({
      ...item,
      sectionId: 'mascot',
      sectionName: 'Mascot Edition',
      productType: 'sticker',
      href: `/product/${item.slug}`,
      badge: 'Cyber Chibi',
      icon: Sparkles
    }));

    const animeList = (SHOWCASE_EDITIONS.anime.characters || []).map((item) => ({
      ...item,
      sectionId: 'anime',
      sectionName: 'Anime Edition',
      productType: 'sticker',
      href: `/product/${item.slug}`,
      badge: 'Shonen Anime',
      icon: Flame
    }));

    const collectionsList = (SHOWCASE_EDITIONS.collections.characters || []).map((item) => ({
      ...item,
      sectionId: 'collections',
      sectionName: 'Collections Edition',
      productType: 'sticker',
      href: `/product/${item.slug}`,
      badge: 'Mature & Vintage',
      icon: Layers
    }));

    const nfcList = (NFC_DESIGNS || []).map((card) => ({
      id: card.id,
      name: card.name,
      slug: card.id,
      series: 'Executive Hardware',
      title: 'NFC Smart Card',
      line: card.line,
      price: NFC_CARD_PRICE_PKR,
      accentColor: card.accent,
      sectionId: 'nfc',
      sectionName: 'NFC Metal Cards',
      productType: 'nfc-card',
      href: `/nfc-card/${card.id}`,
      badge: 'NTAG216',
      icon: CreditCard,
      nfcData: card
    }));

    return [...mascotList, ...animeList, ...collectionsList, ...nfcList];
  }, []);

  // Filter and Sort
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Tab filter
      if (activeTab !== 'all' && product.sectionId !== activeTab) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = product.name?.toLowerCase().includes(query);
        const matchesSeries = product.series?.toLowerCase().includes(query);
        const matchesLine = product.line?.toLowerCase().includes(query);
        const matchesSection = product.sectionName?.toLowerCase().includes(query);
        return matchesName || matchesSeries || matchesLine || matchesSection;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      return 0; // 'featured'
    });
  }, [allProducts, activeTab, searchQuery, sortBy]);

  // Counts for tabs
  const counts = useMemo(() => ({
    all: allProducts.length,
    mascot: allProducts.filter((p) => p.sectionId === 'mascot').length,
    anime: allProducts.filter((p) => p.sectionId === 'anime').length,
    collections: allProducts.filter((p) => p.sectionId === 'collections').length,
    nfc: allProducts.filter((p) => p.sectionId === 'nfc').length
  }), [allProducts]);

  return (
    <div className="min-h-screen bg-[#08090D] text-white">
      
      {/* Page Hero Header */}
      <section className="bg-[#07070A] text-white pt-14 pb-16 sm:pb-20 relative overflow-hidden border-b border-white/[0.08]">
        {/* Ambient Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_70%)] blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[350px] bg-[radial-gradient(circle,rgba(249,115,22,0.1)_0%,transparent_70%)] blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.08] border border-white/10 text-white/80 text-xs font-bold uppercase tracking-wider mb-4 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Complete Tagtique Collection • 50 Designs</span>
              </div>
              <h1 className="font-manrope font-extrabold text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight uppercase leading-[0.95]">
                Full Catalog.
              </h1>
              <p className="mt-3 text-sm sm:text-base text-white/60 leading-relaxed max-w-xl">
                Explore every smart QR identity sticker and executive NFC metal card. Weatherproof vinyl, dual online/offline emergency routing, and forever-free profiles.
              </p>
            </div>

            {/* Quick Guarantees */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-semibold text-white/75 shrink-0">
              <span className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                Free Delivery Pakistan-wide
              </span>
              <span className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                No App Required
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Viewport */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* Search, Category Filter Tabs & Sorting Toolbar */}
        <div className="flex flex-col gap-5 mb-8">
          
          {/* Top Row: Search Input & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, anime, car, or collection..."
                className="w-full pl-10 pr-9 py-2.5 rounded-full bg-[#13141C] border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/40 shadow-inner focus:outline-none focus:border-amber-400 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-0.5 cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <SlidersHorizontal className="w-4 h-4 text-white/50" />
              <span className="text-xs text-white/60 font-semibold hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="py-2 px-3 rounded-full bg-[#13141C] border border-white/15 text-xs font-bold text-white shadow-xs focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="featured" className="bg-[#13141C] text-white">Featured Collection</option>
                <option value="price-low" className="bg-[#13141C] text-white">Price: Low to High</option>
                <option value="price-high" className="bg-[#13141C] text-white">Price: High to Low</option>
                <option value="name-asc" className="bg-[#13141C] text-white">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Bottom Row: Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { id: 'all', label: 'All Products', count: counts.all, icon: null },
              { id: 'mascot', label: 'Mascot Edition', count: counts.mascot, icon: Sparkles },
              { id: 'anime', label: 'Anime Edition', count: counts.anime, icon: Flame },
              { id: 'collections', label: 'Collections Edition', count: counts.collections, icon: Layers },
              { id: 'nfc', label: 'NFC Metal Cards', count: counts.nfc, icon: CreditCard }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer shrink-0 flex items-center gap-2 shadow-xs ${
                    isActive
                      ? 'bg-white text-black font-black shadow-md scale-102'
                      : 'bg-[#13141C] border border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-black/15 text-black' : 'bg-white/10 text-white/60'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Results Count & Active Filter Indicator */}
        <div className="flex items-center justify-between text-xs text-white/50 mb-6 px-1">
          <span>
            Showing <strong className="text-white font-extrabold">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'item' : 'items'}
            {searchQuery && <span> matching "{searchQuery}"</span>}
          </span>
          {activeTab !== 'all' && (
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              className="text-amber-400 font-bold underline underline-offset-2 hover:opacity-85 cursor-pointer"
            >
              Reset to all 50
            </button>
          )}
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl bg-[#12131A] border border-white/10 p-12 text-center max-w-lg mx-auto shadow-2xl my-8">
            <Filter className="w-10 h-10 text-white/30 mx-auto mb-3" />
            <h3 className="font-manrope font-extrabold text-xl text-white">No products found</h3>
            <p className="text-sm text-white/60 mt-1">
              No matching stickers or cards found for "{searchQuery}". Try searching for another character or clear filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                handleTabChange('all');
              }}
              className="mt-4 px-5 py-2.5 rounded-full bg-white text-black text-xs font-extrabold shadow-sm hover:scale-105 transition-all cursor-pointer"
            >
              View All 50 Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => {
              const isNfc = product.productType === 'nfc-card';

              return (
                <div
                  key={`${product.sectionId}-${product.id}`}
                  className="rounded-[24px] bg-[#12131A] border border-white/10 p-3 sm:p-4 flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.8)] hover:border-white/25 transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden"
                >
                  {/* Top Header: Section Pill + Price */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span 
                        className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full truncate max-w-[120px]"
                        style={{
                          backgroundColor: `${product.accentColor}18`,
                          color: product.accentColor
                        }}
                      >
                        {product.series || product.badge}
                      </span>
                      <span className="font-mono text-[11px] font-extrabold text-white/80">
                        PKR {product.price}
                      </span>
                    </div>

                    {/* Artwork Container */}
                    <Link
                      to={product.href}
                      className="w-full aspect-square rounded-2xl flex items-center justify-center p-3 relative overflow-hidden transition-transform duration-300 group-hover:scale-103 block"
                      style={{
                        background: `linear-gradient(180deg, ${product.accentColor}20 0%, ${product.accentColor}06 100%)`
                      }}
                    >
                      {isNfc ? (
                        <div className="w-full aspect-[856/540] rounded-xl overflow-hidden shadow-md">
                          <NfcCardArt design={product.nfcData} side="front" />
                        </div>
                      ) : (
                        <img
                          src={product.src}
                          alt={product.name}
                          className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)] select-none"
                          loading="lazy"
                        />
                      )}
                    </Link>
                  </div>

                  {/* Card Details & Actions */}
                  <div className="mt-3 flex flex-col">
                    <div className="flex items-center justify-between gap-1">
                      <Link
                        to={product.href}
                        className="font-manrope font-extrabold text-sm sm:text-base text-white group-hover:text-amber-400 transition-colors truncate"
                      >
                        {product.name}
                      </Link>
                      <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5 shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        In Stock
                      </span>
                    </div>

                    <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5 font-medium">
                      {product.line || product.title}
                    </p>

                    {/* Action Button */}
                    <Link
                      to={product.href}
                      className="mt-3 w-full py-2 px-3 rounded-xl bg-white hover:bg-zinc-100 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md group-hover:bg-amber-400 group-hover:text-black cursor-pointer active:scale-95"
                    >
                      <span>{isNfc ? 'Customize Card' : 'View Sticker'}</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Catalog Footer Assurance Banner */}
        <div className="mt-16 pt-10 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Truck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h4 className="font-manrope font-extrabold text-sm text-white">Express Free Delivery</h4>
              <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                Free delivery across Pakistan on all orders. Carefully packaged in protective waterproof mailers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="font-manrope font-extrabold text-sm text-white">Zero Monthly Subscriptions</h4>
              <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                Every sticker and NFC card is a one-time purchase with forever-free emergency & profile hosting.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Zap className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h4 className="font-manrope font-extrabold text-sm text-white">Instant Setup in 60s</h4>
              <p className="text-xs text-white/60 mt-0.5 leading-relaxed">
                Connect your phone number right from your browser. Update contact details anytime for free.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
