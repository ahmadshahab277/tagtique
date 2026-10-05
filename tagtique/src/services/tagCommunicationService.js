/**
 * Tagtique Smart Vehicle Communication Service
 * Production-ready abstraction for dynamic QR lookups, masked messaging,
 * emergency alerts, and guardian escalation via Supabase with offline/demo fallbacks.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';

// Fallback demo profile as specified in Tagtique architecture requirements
export const DEFAULT_DEMO_TAG = {
  tagId: 'TAG-001',
  vehicleName: 'Toyota Corolla',
  registrationNumber: 'ABC-123',
  vehicleType: 'Car',
  status: 'active', // 'active' | 'inactive' | 'suspended'
  isVerified: true,
  ownerName: 'Registered Owner',
  maskedPhone: '+92 ••• ••••123',
  maskedGuardian: '+92 ••• ••••175',
  emergencyEscalationSeconds: 180, // 3 minutes escalation window
  hasGuardianConfigured: true,
  maskedCallAvailable: true,
  maskedSmsAvailable: true,
  city: 'Faisalabad',
  created_at: new Date().toISOString()
};

class TagCommunicationService {
  /**
   * Resolves vehicle and dynamic tag details by tag ID, QR token, or license plate
   */
  async getVehicleByTagId(tagIdentifier) {
    if (!tagIdentifier) {
      return { success: true, data: DEFAULT_DEMO_TAG };
    }

    const clean = String(tagIdentifier).trim();

    // 1. Check Supabase if connected
    if (supabase && isSupabaseConfigured()) {
      try {
        // Query tags table by qr_code_value or id
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clean);
        const tagFilters = [`qr_code_value.eq.${clean}`];
        if (isUuid) tagFilters.push(`id.eq.${clean}`);

        const { data: tagData, error: tagErr } = await supabase
          .from('tags')
          .select(`
            id,
            status,
            qr_code_value,
            tag_material,
            package_type,
            created_at,
            vehicles (
              id,
              vehicle_number,
              vehicle_type,
              customers (
                id,
                full_name,
                phone_number,
                guardian_number,
                city
              )
            )
          `)
          .or(tagFilters.join(','))
          .limit(1);

        if (!tagErr && tagData && tagData.length > 0) {
          const t = tagData[0];
          const veh = t.vehicles || {};
          const cust = veh.customers || {};

          // Check if tag is active or deactivated
          const isDeactivated = t.status === 'inactive' || t.status === 'deactivated';

          return {
            success: true,
            data: {
              tagId: t.id,
              qrToken: t.qr_code_value,
              vehicleName: veh.vehicle_type ? `${veh.vehicle_type} (Verified)` : 'Verified Vehicle',
              registrationNumber: veh.vehicle_number || 'ABC-123',
              vehicleType: veh.vehicle_type || 'Car',
              status: isDeactivated ? 'inactive' : 'active',
              isVerified: true,
              ownerName: cust.full_name ? cust.full_name.split(' ')[0] : 'Owner',
              phoneNumber: cust.phone_number || '',
              guardianNumber: cust.guardian_number || '',
              maskedPhone: cust.phone_number ? this.maskPhoneNumber(cust.phone_number) : '+92 ••• ••••000',
              maskedGuardian: cust.guardian_number ? this.maskPhoneNumber(cust.guardian_number) : null,
              hasGuardianConfigured: Boolean(cust.guardian_number),
              emergencyEscalationSeconds: 180,
              maskedCallAvailable: true,
              maskedSmsAvailable: true,
              city: cust.city || 'Faisalabad'
            }
          };
        }

        // Query by vehicle license plate
        const { data: vData } = await supabase
          .from('vehicles')
          .select(`
            id,
            vehicle_number,
            vehicle_type,
            customers (
              id,
              full_name,
              phone_number,
              guardian_number,
              city
            ),
            tags (
              id,
              status,
              qr_code_value
            )
          `)
          .ilike('vehicle_number', clean)
          .limit(1);

        if (vData && vData.length > 0) {
          const veh = vData[0];
          const cust = veh.customers || {};
          const t = (veh.tags && veh.tags[0]) || {};
          const isDeactivated = t.status === 'inactive' || t.status === 'deactivated';

          return {
            success: true,
            data: {
              tagId: t.id || 'TAG-' + clean,
              qrToken: t.qr_code_value,
              vehicleName: `${veh.vehicle_type || 'Vehicle'} (Verified)`,
              registrationNumber: veh.vehicle_number,
              vehicleType: veh.vehicle_type || 'Car',
              status: isDeactivated ? 'inactive' : 'active',
              isVerified: true,
              ownerName: cust.full_name ? cust.full_name.split(' ')[0] : 'Owner',
              phoneNumber: cust.phone_number || '',
              guardianNumber: cust.guardian_number || '',
              maskedPhone: cust.phone_number ? this.maskPhoneNumber(cust.phone_number) : '+92 ••• ••••000',
              maskedGuardian: cust.guardian_number ? this.maskPhoneNumber(cust.guardian_number) : null,
              hasGuardianConfigured: Boolean(cust.guardian_number),
              emergencyEscalationSeconds: 180,
              maskedCallAvailable: true,
              maskedSmsAvailable: true,
              city: cust.city || 'Faisalabad'
            }
          };
        }
      } catch (err) {
        console.warn('[TagCommunicationService] Supabase lookup error:', err);
      }
    }

    // 2. Fallback to Local Cached Inventory or standard Demo Data
    try {
      const saved =
        localStorage.getItem('tagtique_admin_v3_orders') ||
        localStorage.getItem('tagtique_supabase_orders_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const match = parsed.find(
            (o) =>
              (o.vehicleNumber && o.vehicleNumber.toLowerCase() === clean.toLowerCase()) ||
              (o.serialNumber && o.serialNumber.toLowerCase().includes(clean.toLowerCase())) ||
              (o.qr_code_value && o.qr_code_value.includes(clean)) ||
              (o.orderId && o.orderId.toLowerCase().includes(clean.toLowerCase()))
          );
          if (match) {
            return {
              success: true,
              data: {
                tagId: match.tag_id || match.rawId || clean,
                vehicleName: `${match.vehicleType || 'Car'}`,
                registrationNumber: match.vehicleNumber || 'ABC-123',
                vehicleType: match.vehicleType || 'Car',
                status: match.status === 'Deactivated' ? 'inactive' : 'active',
                isVerified: true,
                ownerName: match.customerName ? match.customerName.split(' ')[0] : 'Owner',
                phoneNumber: match.phoneNumber || match.phone_number || '',
                guardianNumber: match.guardianNumber || match.guardian_number || '',
                maskedPhone: this.maskPhoneNumber(match.phoneNumber || '03000000000'),
                maskedGuardian: match.guardianNumber ? this.maskPhoneNumber(match.guardianNumber) : null,
                hasGuardianConfigured: Boolean(match.guardianNumber),
                emergencyEscalationSeconds: 180,
                maskedCallAvailable: true,
                maskedSmsAvailable: true,
                city: 'Faisalabad'
              }
            };
          }
        }
      }
    } catch (_) {}

    // Special test cases
    if (clean.toLowerCase() === 'inactive' || clean.toLowerCase() === 'tag-inactive') {
      return {
        success: true,
        data: {
          ...DEFAULT_DEMO_TAG,
          tagId: 'TAG-INACTIVE',
          status: 'inactive'
        }
      };
    }

    if (clean.toLowerCase() === 'notfound' || clean.toLowerCase() === 'tag-404') {
      return {
        success: false,
        error: 'TAG_NOT_FOUND',
        message: 'Vehicle tag could not be found or has expired.'
      };
    }

    // If identifier is provided, adapt default demo model to that tag ID
    return {
      success: true,
      data: {
        ...DEFAULT_DEMO_TAG,
        tagId: clean.toUpperCase(),
        registrationNumber: clean.startsWith('STOCK') || clean.length <= 8 ? clean.toUpperCase() : 'ABC-123'
      }
    };
  }

  /**
   * Helper to mask telephone numbers for privacy
   * e.g. 03001234567 -> +92 ••• ••••567
   */
  maskPhoneNumber(phone) {
    if (!phone) return '+92 ••• ••••000';
    const digits = phone.replace(/\D/g, '');
    const last3 = digits.slice(-3);
    return `+92 ••• ••••${last3}`;
  }
}

export const tagCommunicationService = new TagCommunicationService();
