/**
 * Tagtique Order & Tag Service (Client-Side)
 * Handles customer order placement and local tag persistence without external backends.
 */

import { buildScanUrl } from '../utils/scanUrl';
import { tagRegistryService } from './tagRegistryService';

const LOCAL_STORAGE_ORDERS_KEY = 'tagtique_orders_cache';

class OrderBackendService {
  constructor() {
    this.localOrders = this.loadLocalOrders();
  }

  loadLocalOrders() {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  }

  saveLocalOrders(rows) {
    try {
      this.localOrders = rows;
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(rows));
      localStorage.setItem('tagtique_admin_v3_orders', JSON.stringify(rows));
      if (Array.isArray(rows)) {
        tagRegistryService.syncFromOrders(rows);
      }
    } catch (_) {}
  }

  /**
   * Generates a Data URL QR Code image from a string token
   */
  async generateQRCodeDataUrl(text) {
    try {
      const { default: QRCode } = await import('qrcode');
      return await QRCode.toDataURL(text, {
        width: 320,
        margin: 2,
        color: {
          dark: '#13111C',
          light: '#FFFDF8'
        }
      });
    } catch (err) {
      console.warn('QR code generation error:', err);
      return '';
    }
  }

  /**
   * Creates an order with customer, vehicle(s), and tag(s) locally.
   */
  async createOrder({
    customer,
    vehicles = [],
    packageType = 'single',
    totalAmount = 1499,
    paymentStatus = 'pending',
    deliveryStatus = 'pending',
    tagMaterial = 'acrylic',
    shippingAddress
  }) {
    const generatedOrderNumber = 'TGT-' + Math.floor(100000 + Math.random() * 900000);
    const orderId = 'ord-' + Date.now();
    const createdDate = new Date().toISOString();
    const rawId = generatedOrderNumber.replace('TGT-', '');
    const createdRows = [];

    for (let i = 0; i < (vehicles.length || 1); i++) {
      const veh = vehicles[i] || {};
      const vehicleNumber = veh.vehicleNumber || veh.name || `TAG-${i + 1}`;
      const vehicleType = veh.vehicleType || veh.tagType || 'Car';
      const vPhone = veh.phone || customer?.phone || '0300 0000000';
      const vGuardian = veh.emergencyPhone || customer?.guardianNumber || '';
      const vName = veh.displayName || customer?.name || 'Valued Customer';

      const qrToken = `tgt-pub-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const qrDataUrl = await this.generateQRCodeDataUrl(
        buildScanUrl(qrToken, vPhone ? { phonePrivacy: 'public', phone: vPhone } : {})
      );
      const shortToken = qrToken.replace(/^tgt-/, '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
      const serialNo = `SN-${shortToken}`;

      createdRows.push({
        order_id: orderId,
        orderId: `#TGT-${rawId}`,
        rawId: rawId,
        order_number: generatedOrderNumber,
        serialNumber: serialNo,
        serial_number: serialNo,
        customer_id: 'cust-' + Date.now(),
        customer_name: vName,
        customerName: vName,
        email: customer?.email || '',
        phone_number: vPhone,
        phoneNumber: vPhone,
        guardian_number: vGuardian,
        guardianNumber: vGuardian,
        phonePrivacy: 'public',
        namePrivacy: 'public',
        emergencyPrivacy: 'private',
        address: shippingAddress?.address || customer?.address || '',
        city: shippingAddress?.city || customer?.city || 'Faisalabad',
        location: (shippingAddress?.city || customer?.city || 'Faisalabad') + ', PK',
        vehicle_id: 'veh-' + Date.now() + '-' + i,
        vehicle_number: vehicleNumber,
        vehicleNumber: vehicleNumber,
        vehicle_type: vehicleType,
        vehicleType: vehicleType,
        itemTarget: veh.itemTarget || (vehicleType.toLowerCase().includes('laptop') ? 'laptop' : vehicleType.toLowerCase().includes('vehicle') ? 'vehicle' : 'mobile'),
        tag_id: 'tag-' + Date.now() + '-' + i,
        tagId: 'tag-' + Date.now() + '-' + i,
        qrId: `QR-${rawId}-${i + 1}`,
        qr_code_value: qrToken,
        qr_image_url: qrDataUrl,
        tag_material: tagMaterial,
        package: packageType,
        packageSub: (tagMaterial === 'acrylic' ? 'Acrylic' : 'Vinyl') + ' Tag',
        package_type: packageType,
        status: 'Pending',
        changeStatus: 'Pending',
        total_amount: Number(totalAmount) || 0,
        amount: Number(totalAmount) || 0,
        payment_status: paymentStatus,
        delivery_status: deliveryStatus,
        created_at: createdDate,
        date: createdDate.slice(0, 10),
        scans: 0
      });
    }

    // Register all created tags immediately in offline registry
    createdRows.forEach((row) => {
      tagRegistryService.registerTag({
        qrToken: row.qr_code_value,
        registrationNumber: row.vehicle_number,
        vehicleName: row.vehicle_type,
        vehicleType: row.vehicle_type,
        itemTarget: row.itemTarget || 'mobile',
        ownerName: row.customer_name,
        phoneNumber: row.phone_number,
        guardianNumber: row.guardian_number,
        phonePrivacy: row.phonePrivacy,
        status: 'active'
      });
    });

    const current = this.loadLocalOrders();
    this.saveLocalOrders([...createdRows, ...current]);

    return {
      orderId,
      orderNumber: generatedOrderNumber,
      rows: createdRows
    };
  }

  /**
   * One-time public setup to claim an unassigned sticker.
   */
  async claimTagSetup({
    tagId,
    qrToken,
    customerName,
    phoneNumber,
    vehicleNumber,
    vehicleType = 'Car',
    guardianNumber = ''
  }) {
    const name = String(customerName || '').trim();
    const phone = String(phoneNumber || '').trim();
    const plate = String(vehicleNumber || '').trim().toUpperCase();
    if (!name || !phone || !plate) {
      return { success: false, error: 'Name, phone number, and vehicle number are required.' };
    }

    tagRegistryService.registerTag({
      qrToken: qrToken || tagId,
      registrationNumber: plate,
      vehicleName: vehicleType,
      vehicleType,
      ownerName: name,
      phoneNumber: phone,
      guardianNumber,
      phonePrivacy: 'public',
      status: 'active'
    });

    return { success: true };
  }

  /**
   * Public Scan Lookup by QR Token
   */
  async lookupTagByToken(token) {
    if (!token) return null;
    const all = this.loadLocalOrders();
    const found = all.find((o) => o.qr_code_value === token || o.vehicle_number === token);
    if (found) {
      return {
        isValid: true,
        status: found.status,
        tagId: found.tag_id,
        vehicleNumber: found.vehicle_number,
        vehicleType: found.vehicle_type,
        ownerName: found.customer_name,
        maskedName: (found.customer_name || 'Driver').split(' ')[0],
        phoneNumber: found.phone_number,
        guardianNumber: found.guardian_number,
        tagMaterial: found.tag_material
      };
    }
    return null;
  }

  /**
   * Universal Tag Lookup by query string
   */
  async lookupTagByAny(query) {
    if (!query) return null;
    const clean = String(query).trim().toLowerCase();
    const all = this.loadLocalOrders();
    return all.find((o) => {
      const qVal = (o.qr_code_value || '').toLowerCase();
      const vNum = (o.vehicleNumber || o.vehicle_number || '').toLowerCase();
      const oNum = (o.orderId || o.order_number || o.rawId || '').toLowerCase();
      return qVal.includes(clean) || vNum.includes(clean) || oNum.includes(clean);
    }) || null;
  }

  /**
   * Log scan event to local storage
   */
  async logTagScan(token) {
    if (!token) return;
    try {
      const scanKey = `scan_count_${token}`;
      const count = Number(localStorage.getItem(scanKey) || 0);
      localStorage.setItem(scanKey, String(count + 1));
    } catch (_) {}
  }

  /**
   * No-op realtime subscriber
   */
  subscribeToChanges() {
    return () => {};
  }
}

export const orderBackendService = new OrderBackendService();
