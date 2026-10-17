/**
 * Tagtique Offline Tag Registry Service
 *
 * Ensures both old printed QR codes and newly registered tags resolve
 * instantly in offline mode.
 *
 * Logic:
 * Offline routing dials the vehicle owner's phone number.
 *
 * Automatically keeps localStorage and Service Worker Cache in sync.
 */

import { settingsService } from './settingsService';

const STORAGE_KEY = 'tagtique_offline_tag_registry';

class TagRegistryService {
  constructor() {
    this._registry = this._loadInitial();
  }

  _loadInitial() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (_) {}
    return {};
  }

  _persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this._registry));
    } catch (_) {}

    // Synchronize to Service Worker cache so sw.js has zero-latency access
    this._syncToServiceWorker();
  }

  _syncToServiceWorker() {
    if (typeof window === 'undefined') return;

    // 1. Post message to active Service Worker
    try {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_TAG_REGISTRY',
          registry: this._registry,
          supportPhone: settingsService.getSupportPhone()
        });
      }
    } catch (_) {}

    // 2. Put registry directly into Cache Storage so sw.js can read even without an active client
    try {
      if ('caches' in window) {
        caches.open('tagtique-offline-v6').then((cache) => {
          const body = JSON.stringify({
            registry: this._registry,
            supportPhone: settingsService.getSupportPhone(),
            updatedAt: Date.now()
          });
          cache.put(
            new Request('/offline-tag-registry.json'),
            new Response(body, {
              headers: { 'Content-Type': 'application/json' }
            })
          ).catch(() => {});
        }).catch(() => {});
      }
    } catch (_) {}
  }

  /**
   * Registers or updates a tag record in the offline registry.
   */
  registerTag(tag) {
    if (!tag) return;
    const token = String(tag.qrToken || tag.qr_code_value || tag.token || tag.tagId || tag.rawId || '').trim();
    const vehicleNumber = String(tag.registrationNumber || tag.vehicleNumber || tag.vehicle_number || tag.plate || '').trim();
    const cleanToken = token.toLowerCase();
    const cleanPlate = vehicleNumber.toLowerCase();

    const record = {
      token: token || vehicleNumber,
      vehicleNumber: vehicleNumber || token,
      vehicleName: tag.vehicleName || tag.vehicleType || 'Vehicle',
      vehicleType: tag.vehicleType || 'Car',
      ownerName: tag.ownerName || tag.customerName || 'Owner',
      phoneNumber: tag.phoneNumber || tag.phone_number || tag.phone || '',
      guardianNumber: tag.guardianNumber || tag.guardian_phone || '',
      phonePrivacy: 'public',
      supportPhone: settingsService.getSupportPhone(),
      status: tag.status || 'active',
      updatedAt: Date.now()
    };

    if (cleanToken) this._registry[cleanToken] = record;
    if (cleanPlate) this._registry[cleanPlate] = record;

    this._persist();
  }

  /**
   * Synchronizes registry from an array of order records (e.g. from Admin or Supabase).
   */
  syncFromOrders(orders) {
    if (!Array.isArray(orders)) return;
    orders.forEach((o) => {
      this.registerTag({
        qrToken: o.qr_code_value || o.qrToken || o.token || o.qrId,
        registrationNumber: o.vehicleNumber || o.plate,
        vehicleName: o.vehicleType || 'Vehicle',
        vehicleType: o.vehicleType || 'Car',
        ownerName: o.customerName || o.displayName || 'Owner',
        phoneNumber: o.phoneNumber || o.phone_number || o.phone,
        guardianNumber: o.guardianNumber || o.emergencyPhone,
        phonePrivacy: 'public',
        status: o.status === 'Deactivated' ? 'inactive' : 'active'
      });
    });
  }

  /**
   * Resolves a tag by token, tag ID, or vehicle plate from local cache.
   */
  getTag(identifier) {
    if (!identifier) return null;
    const clean = String(identifier).trim().toLowerCase();

    // Direct key match
    if (this._registry[clean]) {
      return this._registry[clean];
    }

    // Search values for partial token match (e.g. tgt-xxx in query string)
    const values = Object.values(this._registry);
    const found = values.find((r) => {
      if (!r) return false;
      const t = String(r.token || '').toLowerCase();
      const p = String(r.vehicleNumber || '').toLowerCase();
      return t === clean || p === clean || clean.includes(t) || t.includes(clean);
    });

    return found || null;
  }

  /**
   * Returns the phone number to dial when offline for a given tag/token.
   * Uses the owner's phone number. The helpline is only used when no owner number is saved.
   */
  resolveOfflineDialTarget(identifier) {
    const tag = this.getTag(identifier);
    const supportPhone = settingsService.getSupportPhone();

    if (tag?.phoneNumber) {
      return {
        phoneNumber: tag.phoneNumber,
        isPrivate: false,
        label: 'Vehicle Owner',
        tag
      };
    }

    return {
      phoneNumber: supportPhone,
      isPrivate: false,
      label: tag ? 'Vehicle Owner' : 'Tagtique Helpline',
      tag: tag || null
    };
  }
}

export const tagRegistryService = new TagRegistryService();
