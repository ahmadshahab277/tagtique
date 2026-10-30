/**
 * Tagtique Smart Vehicle Communication Service (Client-Side)
 * Resolves vehicle and dynamic tag details locally without external backend dependencies.
 */

import { settingsService } from './settingsService';
import { tagRegistryService } from './tagRegistryService';

export function getActiveProxyPhone() {
  return settingsService.getSupportPhone();
}

export function getActiveProxyWhatsApp() {
  const digits = String(settingsService.getSupportPhone() || '').replace(/\D/g, '');
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  if (!digits.startsWith('92')) return `92${digits}`;
  return digits;
}

class TagCommunicationService {
  /**
   * Resolves vehicle and dynamic tag details by tag ID, QR token, or license plate
   */
  async getVehicleByTagId(tagIdentifier) {
    if (!tagIdentifier) {
      return { success: false, error: 'TAG_NOT_FOUND', message: 'Vehicle tag could not be found.' };
    }

    const clean = String(tagIdentifier).trim();

    // 1. Check offline tag registry
    const registryMatch = tagRegistryService.getTag(clean);
    if (registryMatch) {
      return {
        success: true,
        data: {
          tagId: registryMatch.token || clean,
          qrToken: registryMatch.token || clean,
          vehicleName: `${registryMatch.vehicleName || 'Vehicle'}`,
          registrationNumber: registryMatch.vehicleNumber || clean,
          vehicleType: registryMatch.vehicleType || 'Car',
          status: registryMatch.status || 'active',
          isVerified: true,
          ownerName: registryMatch.ownerName || 'Owner',
          phoneNumber: registryMatch.phoneNumber || '',
          guardianNumber: registryMatch.guardianNumber || '',
          phonePrivacy: 'public',
          namePrivacy: 'public',
          emergencyPrivacy: 'private',
          proxyPhone: getActiveProxyPhone(),
          proxyWhatsApp: getActiveProxyWhatsApp(),
          maskedPhone: this.maskPhoneNumber(registryMatch.phoneNumber || '03001234567'),
          maskedGuardian: registryMatch.guardianNumber ? this.maskPhoneNumber(registryMatch.guardianNumber) : null,
          hasGuardianConfigured: Boolean(registryMatch.guardianNumber),
          emergencyEscalationSeconds: 180,
          maskedCallAvailable: true,
          maskedSmsAvailable: true,
          city: 'Faisalabad'
        }
      };
    }

    // 2. Check local cached orders
    try {
      const saved =
        localStorage.getItem('tagtique_admin_v3_orders') ||
        localStorage.getItem('tagtique_orders_cache');
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
                ownerName: match.customerName ? match.customerName.split(' ')[0] : (match.displayName || 'Ali Khan'),
                phoneNumber: match.phoneNumber || match.phone_number || match.phone || '03001234567',
                guardianNumber: match.guardianNumber || match.guardian_number || match.emergencyPhone || '',
                phonePrivacy: 'public',
                namePrivacy: match.namePrivacy || 'public',
                emergencyPrivacy: match.emergencyPrivacy || 'private',
                proxyPhone: getActiveProxyPhone(),
                proxyWhatsApp: getActiveProxyWhatsApp(),
                maskedPhone: this.maskPhoneNumber(match.phoneNumber || match.phone || '03001234567'),
                maskedGuardian: match.guardianNumber ? this.maskPhoneNumber(match.guardianNumber) : null,
                hasGuardianConfigured: Boolean(match.guardianNumber || match.emergencyPhone),
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

    return {
      success: false,
      error: 'TAG_NOT_FOUND',
      message: 'Vehicle tag could not be found.'
    };
  }

  /**
   * Helper to mask telephone numbers for privacy
   * e.g. 03001234567 -> +92 *** ****567
   */
  maskPhoneNumber(phone) {
    if (!phone) return '+92 *** ****000';
    const digits = phone.replace(/\D/g, '');
    const last3 = digits.slice(-3);
    return `+92 *** ****${last3}`;
  }
}

export const tagCommunicationService = new TagCommunicationService();
