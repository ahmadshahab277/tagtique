import QRCode from 'qrcode';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { buildScanUrl } from '../utils/scanUrl';

const LOCAL_STORAGE_ORDERS_KEY = 'tagtique_supabase_orders_cache';
const LOCAL_STORAGE_TAGS_MAP_KEY = 'tagtique_supabase_tags_map';

// No hardcoded fallback rows - only live Supabase data is loaded
const INITIAL_ADMIN_ROWS = [];

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
    } catch (_) {}
  }

  /**
   * Generates a Data URL QR Code image from a string token
   */
  async generateQRCodeDataUrl(text) {
    try {
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
   * Creates an order with customer, vehicle(s), and tag(s) in Supabase.
   * Gracefully syncs to local cache as fallback.
   */
  async createOrder({
    customer,
    vehicles,
    packageType = 'single',
    totalAmount = 1499,
    paymentStatus = 'pending',
    deliveryStatus = 'pending',
    tagMaterial = 'acrylic',
    shippingAddress
  }) {
    let customerId = null;
    let orderId = null;
    const generatedOrderNumber = 'TGT-' + Math.floor(100000 + Math.random() * 900000);
    const createdDate = new Date().toISOString();
    const createdAdminRows = [];

    // 1. Supabase Insertion
    if (supabase && isSupabaseConfigured()) {
      try {
        // A. Insert Customer
        const { data: customerRecord, error: custErr } = await supabase
          .from('customers')
          .insert({
            full_name: customer.name || 'Valued Customer',
            phone_number: customer.phone || '0300 0000000',
            guardian_number: customer.guardianNumber || customer.emergencyPhone || null,
            address: shippingAddress?.address || customer.address || '',
            city: shippingAddress?.city || customer.city || 'Faisalabad'
          })
          .select()
          .single();

        if (custErr) throw custErr;
        customerId = customerRecord.id;

        // B. Insert Order
        const { data: orderRecord, error: ordErr } = await supabase
          .from('orders')
          .insert({
            customer_id: customerId,
            package_type: packageType,
            total_amount: Number(totalAmount) || 0,
            payment_status: paymentStatus,
            delivery_status: deliveryStatus
          })
          .select()
          .single();

        if (ordErr) console.warn('Supabase orders insert warning:', ordErr);
        orderId = orderRecord?.id || ('ord-' + Date.now());

        // C. Insert each Vehicle and its Tag
        for (let i = 0; i < vehicles.length; i++) {
          const veh = vehicles[i];
          const vehicleNumber = veh.vehicleNumber || veh.name || `TAG-${i + 1}`;
          const vehicleType = veh.vehicleType || veh.tagType || 'Car';

          const { data: vehRecord, error: vehErr } = await supabase
            .from('vehicles')
            .insert({
              customer_id: customerId,
              vehicle_number: vehicleNumber,
              vehicle_type: vehicleType
            })
            .select()
            .single();

          if (vehErr) throw vehErr;
          const vehicleId = vehRecord.id;

          // Unique QR slug / crypto token
          const qrToken = `tgt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          const qrDataUrl = await this.generateQRCodeDataUrl(buildScanUrl(qrToken));

          const { data: tagRecord, error: tagErr } = await supabase
            .from('tags')
            .insert({
              vehicle_id: vehicleId,
              qr_code_value: qrToken,
              qr_image_url: qrDataUrl,
              tag_material: tagMaterial === 'acrylic' ? 'acrylic' : 'vinyl',
              package_type: packageType,
              status: 'pending'
            })
            .select()
            .single();

          if (tagErr) console.warn('Supabase tags insert warning:', tagErr);

          createdAdminRows.push({
            order_id: orderId,
            order_number: generatedOrderNumber,
            customer_id: customerId,
            customer_name: customer.name,
            email: customer.email || '',
            phone_number: customer.phone,
            guardian_number: customer.guardianNumber || customer.emergencyPhone || '',
            address: shippingAddress?.address || customer.address || '',
            city: shippingAddress?.city || customer.city || 'Faisalabad',
            vehicle_id: vehicleId,
            vehicle_number: vehicleNumber,
            vehicle_type: vehicleType,
            tag_id: tagRecord?.id || ('tag-' + Date.now() + '-' + i),
            qr_code_value: qrToken,
            qr_image_url: qrDataUrl,
            tag_material: tagMaterial,
            package_type: packageType,
            status: 'pending',
            total_amount: Number(totalAmount),
            payment_status: paymentStatus,
            delivery_status: deliveryStatus,
            created_at: createdDate
          });
        }
      } catch (err) {
        console.warn('Supabase write error, falling back to local storage:', err);
      }
    }

    // 2. Local fallback sync if not created via Supabase
    if (createdAdminRows.length === 0) {
      customerId = 'cust-' + Date.now();
      orderId = 'ord-' + Date.now();

      for (let i = 0; i < vehicles.length; i++) {
        const veh = vehicles[i];
        const vehicleNumber = veh.vehicleNumber || veh.name || `TAG-${i + 1}`;
        const vehicleType = veh.vehicleType || veh.tagType || 'Car';
        const qrToken = `tgt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const qrDataUrl = await this.generateQRCodeDataUrl(buildScanUrl(qrToken));
        const shortToken = qrToken.replace(/^tgt-/, '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
        const serialNo = `SN-${shortToken}`;

        createdAdminRows.push({
          order_id: orderId,
          order_number: generatedOrderNumber,
          serialNumber: serialNo,
          serial_number: serialNo,
          customer_id: customerId,
          customer_name: customer.name || 'Valued Customer',
          email: customer.email || '',
          phone_number: customer.phone || '0300 0000000',
          guardian_number: customer.guardianNumber || customer.emergencyPhone || '',
          address: shippingAddress?.address || customer.address || '',
          city: shippingAddress?.city || customer.city || 'Faisalabad',
          vehicle_id: 'veh-' + Date.now() + '-' + i,
          vehicle_number: vehicleNumber,
          vehicle_type: vehicleType,
          tag_id: 'tag-' + Date.now() + '-' + i,
          qr_code_value: qrToken,
          qr_image_url: qrDataUrl,
          tag_material: tagMaterial,
          package_type: packageType,
          status: 'pending',
          total_amount: Number(totalAmount),
          payment_status: paymentStatus,
          delivery_status: deliveryStatus,
          created_at: createdDate
        });
      }
    }

    // Merge into local cache
    const updated = [...createdAdminRows, ...this.localOrders];
    this.saveLocalOrders(updated);

    return {
      orderId,
      orderNumber: generatedOrderNumber,
      rows: createdAdminRows
    };
  }

  /**
   * Fetch admin rows from Supabase (or fallback to local cache)
   */
  async fetchAdminOrders() {
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data: tagsData, error } = await supabase
          .from('tags')
          .select(`
            id,
            qr_code_value,
            qr_image_url,
            tag_material,
            package_type,
            status,
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
                address,
                city
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(tagsData)) {
          const rows = tagsData.map((t, idx) => {
            const veh = t.vehicles || {};
            const cust = veh.customers || {};
            const rawId = t.id ? t.id.substring(0, 6).toUpperCase() : `${1000 + idx}`;
            const formattedStatus = t.status
              ? t.status.charAt(0).toUpperCase() + t.status.slice(1).toLowerCase()
              : 'Pending';

            // Distinct physical sticker serial number (maps directly to Supabase record)
            let serialNo = '';
            if (t.qr_code_value && !t.qr_code_value.startsWith('tgt-')) {
              const clean = t.qr_code_value.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
              if (clean) serialNo = `SN-${clean}`;
            }
            if (!serialNo && t.id) {
              const clean = t.id.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
              if (clean) serialNo = `SN-${clean}`;
            }
            if (!serialNo) {
              serialNo = `SN-${rawId}`;
            }

            return {
              orderId: `#TGT-${rawId}`,
              rawId: rawId,
              order_id: 'ord-' + (idx + 1),
              order_number: 'TGT-' + rawId,
              serialNumber: serialNo,
              serial_number: serialNo,
              customer_id: cust.id || '',
              customerName: cust.full_name || 'Vehicle Owner',
              customer_name: cust.full_name || 'Vehicle Owner',
              email: '',
              phoneNumber: cust.phone_number || '',
              phone_number: cust.phone_number || '',
              guardianNumber: cust.guardian_number || '',
              guardian_number: cust.guardian_number || '',
              address: cust.address || '',
              city: cust.city || 'Faisalabad',
              location: cust.city ? `${cust.city}, PK` : 'Faisalabad, PK',
              vehicle_id: veh.id || '',
              vehicleNumber: veh.vehicle_number || 'VEHICLE',
              vehicle_number: veh.vehicle_number || 'VEHICLE',
              vehicleType: veh.vehicle_type || 'Car',
              vehicle_type: veh.vehicle_type || 'Car',
              tag_id: t.id,
              tagId: t.id,
              qrId: `QR-${rawId}-1`,
              qr_code_value: t.qr_code_value || '',
              qr_image_url: t.qr_image_url || '',
              tag_material: t.tag_material || 'vinyl',
              package: t.package_type || 'Single Tag',
              packageSub: (t.tag_material ? t.tag_material.charAt(0).toUpperCase() + t.tag_material.slice(1) : 'Vinyl') + ' Tag',
              package_type: t.package_type || 'Single Tag',
              status: formattedStatus,
              changeStatus: formattedStatus,
              amount: 1499,
              total_amount: 1499,
              payment_status: 'pending',
              delivery_status: 'pending',
              date: t.created_at ? t.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
              created_at: t.created_at || new Date().toISOString(),
              scans: 0
            };
          });

          this.saveLocalOrders(rows);
          return rows;
        }
      } catch (err) {
        console.warn('Supabase fetchAdminOrders failed, using local cache:', err);
      }
    }

    return this.loadLocalOrders();
  }

  /**
   * Updates customer, vehicle, and tag fields in Supabase & local cache
   */
  async updateTagAndOrder(tagId, updates) {
    const vNumber = updates.vehicle_number || updates.vehicleNumber;
    const vType = updates.vehicle_type || updates.vehicleType;
    let vId = updates.vehicle_id || updates.vehicleId;
    const cName = updates.customer_name || updates.customerName;
    const cPhone = updates.phone_number || updates.phoneNumber;
    const cGuard = updates.guardian_number || updates.guardianNumber;
    let cId = updates.customer_id || updates.customerId;
    const status = updates.status;
    const tagMaterial = updates.tag_material || updates.tagMaterial;

    // Find in local cache if vehicle_id / customer_id missing
    const current = this.loadLocalOrders();
    const index = current.findIndex((o) => 
      (tagId && (o.tag_id === tagId || o.tagId === tagId)) ||
      (updates.orderId && o.orderId === updates.orderId) ||
      (updates.order_id && o.order_id === updates.order_id)
    );
    if (index !== -1) {
      if (!vId) vId = current[index].vehicle_id || current[index].vehicleId;
      if (!cId) cId = current[index].customer_id || current[index].customerId;
    }

    // 1. Supabase update
    if (supabase && isSupabaseConfigured()) {
      try {
        if (tagId) {
          const tagUpdates = {};
          if (status) tagUpdates.status = status.toLowerCase();
          if (tagMaterial) tagUpdates.tag_material = tagMaterial;
          if (Object.keys(tagUpdates).length > 0) {
            tagUpdates.updated_at = new Date().toISOString();
            const { error: tagErr } = await supabase.from('tags').update(tagUpdates).eq('id', tagId);
            if (tagErr) console.warn('Supabase tag update warning:', tagErr);
          }

          // If vehicle_id is missing, look it up from the tag in Supabase
          if (!vId && (vNumber || vType)) {
            const { data: tagRow } = await supabase.from('tags').select('vehicle_id').eq('id', tagId).single();
            if (tagRow?.vehicle_id) vId = tagRow.vehicle_id;
          }
        }

        if (vId && (vNumber || vType)) {
          const vehUpdates = {};
          if (vNumber !== undefined) vehUpdates.vehicle_number = vNumber;
          if (vType !== undefined) vehUpdates.vehicle_type = vType;
          const { error: vehErr } = await supabase.from('vehicles').update(vehUpdates).eq('id', vId);
          if (vehErr) console.warn('Supabase vehicle update warning:', vehErr);
        }

        if (!cId && vId && (cName || cPhone || cGuard)) {
          const { data: vehRow } = await supabase.from('vehicles').select('customer_id').eq('id', vId).single();
          if (vehRow?.customer_id) cId = vehRow.customer_id;
        }

        if (cId && (cName || cPhone || cGuard)) {
          const custUpdates = {};
          if (cName !== undefined) custUpdates.full_name = cName;
          if (cPhone !== undefined) custUpdates.phone_number = cPhone;
          if (cGuard !== undefined) custUpdates.guardian_number = cGuard;
          if (updates.address) custUpdates.address = updates.address;
          if (updates.city) custUpdates.city = updates.city;
          const { error: custErr } = await supabase.from('customers').update(custUpdates).eq('id', cId);
          if (custErr) console.warn('Supabase customer update warning:', custErr);
        }
      } catch (err) {
        console.warn('Supabase update error:', err);
      }
    }

    // 2. Local cache update
    if (index !== -1) {
      current[index] = {
        ...current[index],
        ...updates,
        vehicleNumber: vNumber || current[index].vehicleNumber,
        vehicle_number: vNumber || current[index].vehicle_number,
        vehicleType: vType || current[index].vehicleType,
        vehicle_type: vType || current[index].vehicle_type,
        customerName: cName || current[index].customerName,
        customer_name: cName || current[index].customer_name,
        phoneNumber: cPhone || current[index].phoneNumber,
        phone_number: cPhone || current[index].phone_number,
        guardianNumber: cGuard || current[index].guardianNumber,
        guardian_number: cGuard || current[index].guardian_number,
        status: status ? (status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()) : current[index].status
      };
      this.saveLocalOrders([...current]);
    }
    return true;
  }

  /**
   * Generates a new QR Tag in Supabase & local cache (either pre-printed stock or customer-assigned)
   * Supports batch quantity (e.g. 1 to 150)
   */
  async generateNewTag({
    customerName = 'Unassigned Inventory',
    phoneNumber = '0300 0000000',
    guardianNumber = '',
    vehicleNumber = 'UNASSIGNED',
    vehicleType = 'Car',
    tagMaterial = 'vinyl',
    packageType = 'Single Tag',
    status = 'pending',
    quantity = 1
  }) {
    const qty = Math.max(1, Math.min(Number(quantity) || 1, 150));
    const createdRows = [];

    for (let q = 0; q < qty; q++) {
      let customerId = null;
      let vehicleId = null;
      let tagId = null;
      const generatedOrderNumber = 'TGT-' + Math.floor(100000 + Math.random() * 900000);
      const rawId = generatedOrderNumber.replace('TGT-', '');
      const qrToken = `tgt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${q}`;
      const qrDataUrl = await this.generateQRCodeDataUrl(buildScanUrl(qrToken));
      const shortToken = qrToken.replace(/^tgt-/, '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
      const serialNo = `SN-${shortToken}`;

      const vPlate = qty > 1 && vehicleNumber === 'UNASSIGNED' ? `STOCK-${String(q + 1).padStart(3, '0')}` : vehicleNumber;
      const cName = qty > 1 && customerName.includes('Unassigned') ? `Unassigned Stock #${String(q + 1).padStart(3, '0')}` : customerName;

      if (supabase && isSupabaseConfigured()) {
        try {
          // 1. Customer
          const { data: custRec } = await supabase
            .from('customers')
            .insert({
              full_name: cName,
              phone_number: phoneNumber,
              guardian_number: guardianNumber || null,
              city: 'Faisalabad'
            })
            .select()
            .single();
          if (custRec) customerId = custRec.id;

          // 2. Vehicle
          if (customerId) {
            const { data: vehRec } = await supabase
              .from('vehicles')
              .insert({
                customer_id: customerId,
                vehicle_number: vPlate,
                vehicle_type: vehicleType
              })
              .select()
              .single();
            if (vehRec) vehicleId = vehRec.id;
          }

          // 3. Tag
          if (vehicleId) {
            const { data: tagRec } = await supabase
              .from('tags')
              .insert({
                vehicle_id: vehicleId,
                qr_code_value: qrToken,
                qr_image_url: qrDataUrl,
                tag_material: tagMaterial,
                package_type: packageType,
                status: status.toLowerCase()
              })
              .select()
              .single();
            if (tagRec) tagId = tagRec.id;
          }
        } catch (err) {
          console.warn('Supabase generate tag error:', err);
        }
      }

      createdRows.push({
        orderId: `#TGT-${rawId}`,
        rawId: rawId,
        order_id: 'ord-' + Date.now() + '-' + q,
        order_number: generatedOrderNumber,
        serialNumber: serialNo,
        serial_number: serialNo,
        customer_id: customerId || 'cust-' + Date.now() + '-' + q,
        customerName: cName,
        customer_name: cName,
        email: '',
        phoneNumber: phoneNumber,
        phone_number: phoneNumber,
        guardianNumber: guardianNumber,
        guardian_number: guardianNumber,
        address: '',
        city: 'Faisalabad',
        location: 'Faisalabad, PK',
        vehicle_id: vehicleId || 'veh-' + Date.now() + '-' + q,
        vehicleNumber: vPlate,
        vehicle_number: vPlate,
        vehicleType: vehicleType,
        vehicle_type: vehicleType,
        tag_id: tagId || 'tag-' + Date.now() + '-' + q,
        tagId: tagId || 'tag-' + Date.now() + '-' + q,
        qrId: `QR-${rawId}-1`,
        qr_code_value: qrToken,
        qr_image_url: qrDataUrl,
        tag_material: tagMaterial,
        package: packageType,
        packageSub: tagMaterial.charAt(0).toUpperCase() + tagMaterial.slice(1) + ' Tag',
        package_type: packageType,
        status: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
        changeStatus: status.charAt(0).toUpperCase() + status.slice(1).toLowerCase(),
        amount: 1499,
        total_amount: 1499,
        date: new Date().toISOString().slice(0, 10),
        created_at: new Date().toISOString(),
        scans: 0
      });
    }

    const current = this.loadLocalOrders();
    this.saveLocalOrders([...createdRows, ...current]);
    return qty === 1 ? createdRows[0] : createdRows;
  }

  /**
   * Reassigns an existing QR Tag to new customer/vehicle details or regenerates QR token
   */
  async reassignTagDetails(tagId, updates) {
    let newQrToken = null;
    let newQrDataUrl = null;

    if (updates.regenerateQrToken) {
      newQrToken = `tgt-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      newQrDataUrl = await this.generateQRCodeDataUrl(buildScanUrl(newQrToken));
    }

    const payload = {
      ...updates,
      ...(newQrToken ? { qr_code_value: newQrToken, qr_image_url: newQrDataUrl } : {})
    };

    if (newQrToken && supabase && isSupabaseConfigured() && tagId) {
      try {
        await supabase
          .from('tags')
          .update({
            qr_code_value: newQrToken,
            qr_image_url: newQrDataUrl,
            updated_at: new Date().toISOString()
          })
          .eq('id', tagId);
      } catch (err) {
        console.warn('Supabase token regeneration error:', err);
      }
    }

    await this.updateTagAndOrder(tagId, payload);
    return {
      success: true,
      qr_code_value: newQrToken,
      qr_image_url: newQrDataUrl
    };
  }

  /**
   * Deletes an order (tag, associated vehicle, and cached data) from Supabase & local cache
   */
  async deleteOrder(order) {
    if (!order) return;
    const tagId = order.tag_id || order.tagId;
    const vehicleId = order.vehicle_id || order.vehicleId;
    const orderId = order.order_id || order.orderId;

    if (supabase && isSupabaseConfigured()) {
      try {
        // 1. Delete the tag (child)
        if (tagId) {
          const { error: tagErr } = await supabase.from('tags').delete().eq('id', tagId);
          if (tagErr) console.warn('Supabase delete tag warning:', tagErr);
        }

        // 2. Delete vehicle
        if (vehicleId) {
          const { error: vehErr } = await supabase.from('vehicles').delete().eq('id', vehicleId);
          if (vehErr) console.warn('Supabase delete vehicle warning:', vehErr);
        }

        // 3. Delete order record if matching uuid
        if (orderId && orderId.length > 20) {
          const { error: ordErr } = await supabase.from('orders').delete().eq('id', orderId);
          if (ordErr) console.warn('Supabase delete order warning:', ordErr);
        }
      } catch (err) {
        console.warn('Supabase deleteOrder error:', err);
      }
    }

    // 4. Update local cache
    const current = this.loadLocalOrders();
    const updated = current.filter(
      (o) =>
        (tagId ? o.tag_id !== tagId : true) &&
        o.orderId !== order.orderId &&
        o.order_number !== order.order_number
    );
    this.saveLocalOrders(updated);
    return true;
  }

  /**
   * Minimal Public Scan Lookup by QR Token
   */
  async lookupTagByToken(token) {
    if (!token) return null;

    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('tags')
          .select(`
            id,
            status,
            tag_material,
            qr_code_value,
            vehicles (
              vehicle_number,
              vehicle_type,
              customers (
                full_name,
                phone_number,
                guardian_number
              )
            )
          `)
          .eq('qr_code_value', token)
          .single();

        if (!error && data) {
          const veh = data.vehicles || {};
          const cust = veh.customers || {};
          return {
            isValid: true,
            status: data.status,
            tagId: data.id,
            vehicleNumber: veh.vehicle_number || 'VEHICLE',
            vehicleType: veh.vehicle_type || 'Car',
            ownerName: cust.full_name || 'Vehicle Owner',
            maskedName: (cust.full_name || 'Driver').split(' ')[0],
            phoneNumber: cust.phone_number || '',
            guardianNumber: cust.guardian_number || '',
            tagMaterial: data.tag_material || 'vinyl'
          };
        }
      } catch (err) {
        console.warn('Supabase lookupTagByToken error:', err);
      }
    }

    // Fallback: check local orders
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
        maskedName: found.customer_name.split(' ')[0],
        phoneNumber: found.phone_number,
        guardianNumber: found.guardian_number,
        tagMaterial: found.tag_material
      };
    }

    return null;
  }

  /**
   * Universal Tag & Order lookup by URL, QR token, serial number, plate, or order ID
   */
  async lookupTagByAny(query) {
    if (!query) return null;
    let clean = String(query).trim();

    // 1. If it's a URL, extract the token query param
    if (clean.includes('token=')) {
      try {
        const u = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
        clean = u.searchParams.get('token') || clean;
      } catch (_) {
        const m = clean.match(/[?&]token=([^&]+)/);
        if (m) clean = m[1];
      }
    } else if (clean.includes('qr=')) {
      const m = clean.match(/[?&]qr=([^&]+)/);
      if (m) clean = m[1];
    }

    const unprefixClean = clean.replace(/^SN-|^#TGT-|^TGT-/, '').trim();

    // Check local/cached orders first for instant response
    const all = this.loadLocalOrders();
    const localMatch = all.find((o) => {
      const qVal = (o.qr_code_value || '').toLowerCase();
      const sNum = (o.serialNumber || o.serial_number || '').replace(/^SN-/, '').toLowerCase();
      const vNum = (o.vehicleNumber || o.vehicle_number || '').toLowerCase();
      const oNum = (o.orderId || o.order_number || o.rawId || '').replace(/^#?TGT-/, '').toLowerCase();
      const qRaw = clean.toLowerCase();
      const qClean = unprefixClean.toLowerCase();
      return (
        qVal === qRaw ||
        qVal === qClean ||
        sNum === qClean ||
        vNum === qRaw ||
        vNum === qClean ||
        oNum === qClean ||
        qVal.includes(qClean)
      );
    });

    if (localMatch) {
      return localMatch;
    }

    // Query Supabase live
    if (supabase && isSupabaseConfigured()) {
      try {
        // Query tags table
        const { data, error } = await supabase
          .from('tags')
          .select(`
            id,
            status,
            tag_material,
            package_type,
            qr_code_value,
            qr_image_url,
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
          .or(`qr_code_value.ilike.%${unprefixClean}%,qr_code_value.eq.${clean}`)
          .limit(1);

        if (!error && data && data.length > 0) {
          const t = data[0];
          const veh = t.vehicles || {};
          const cust = veh.customers || {};
          const shortToken = (t.qr_code_value || '').replace(/^tgt-/, '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
          const rawId = shortToken || String(Math.floor(100000 + Math.random() * 900000));
          return {
            orderId: `#TGT-${rawId}`,
            rawId: rawId,
            serialNumber: `SN-${shortToken}`,
            serial_number: `SN-${shortToken}`,
            customerName: cust.full_name || 'Vehicle Owner',
            customer_name: cust.full_name || 'Vehicle Owner',
            customer_id: cust.id,
            vehicleNumber: veh.vehicle_number || 'UNASSIGNED',
            vehicle_number: veh.vehicle_number || 'UNASSIGNED',
            vehicleType: veh.vehicle_type || 'Car',
            vehicle_type: veh.vehicle_type || 'Car',
            vehicle_id: veh.id,
            phoneNumber: cust.phone_number || '',
            phone_number: cust.phone_number || '',
            guardianNumber: cust.guardian_number || '',
            guardian_number: cust.guardian_number || '',
            package: t.package_type || 'Single Tag',
            package_type: t.package_type || 'Single Tag',
            tagMaterial: t.tag_material || 'vinyl',
            tag_material: t.tag_material || 'vinyl',
            status: t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1).toLowerCase() : 'Pending',
            tag_id: t.id,
            tagId: t.id,
            qr_code_value: t.qr_code_value,
            qr_image_url: t.qr_image_url,
            created_at: t.created_at,
            scans: 0
          };
        }

        // Query vehicles table by vehicle_number
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
              tag_material,
              package_type,
              qr_code_value,
              qr_image_url,
              created_at
            )
          `)
          .ilike('vehicle_number', `%${unprefixClean}%`)
          .limit(1);

        if (vData && vData.length > 0) {
          const veh = vData[0];
          const cust = veh.customers || {};
          const t = (veh.tags && veh.tags[0]) || {};
          const shortToken = (t.qr_code_value || '').replace(/^tgt-/, '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase();
          const rawId = shortToken || String(Math.floor(100000 + Math.random() * 900000));
          return {
            orderId: `#TGT-${rawId}`,
            rawId: rawId,
            serialNumber: `SN-${shortToken}`,
            serial_number: `SN-${shortToken}`,
            customerName: cust.full_name || 'Vehicle Owner',
            customer_name: cust.full_name || 'Vehicle Owner',
            customer_id: cust.id,
            vehicleNumber: veh.vehicle_number || 'UNASSIGNED',
            vehicle_number: veh.vehicle_number || 'UNASSIGNED',
            vehicleType: veh.vehicle_type || 'Car',
            vehicle_type: veh.vehicle_type || 'Car',
            vehicle_id: veh.id,
            phoneNumber: cust.phone_number || '',
            phone_number: cust.phone_number || '',
            guardianNumber: cust.guardian_number || '',
            guardian_number: cust.guardian_number || '',
            package: t.package_type || 'Single Tag',
            package_type: t.package_type || 'Single Tag',
            tagMaterial: t.tag_material || 'vinyl',
            tag_material: t.tag_material || 'vinyl',
            status: t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1).toLowerCase() : 'Pending',
            tag_id: t.id,
            tagId: t.id,
            qr_code_value: t.qr_code_value,
            qr_image_url: t.qr_image_url,
            created_at: t.created_at,
            scans: 0
          };
        }
      } catch (err) {
        console.warn('Supabase lookupTagByAny error:', err);
      }
    }

    return null;
  }

  /**
   * Log each scan event to Supabase or local storage audit trail
   */
  async logTagScan(token, tagId) {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';

    if (supabase && isSupabaseConfigured() && tagId) {
      try {
        await supabase.from('tag_scans').insert({
          tag_id: tagId,
          user_agent: userAgent
        });
      } catch (err) {
        console.warn('Could not log scan to Supabase:', err);
      }
    }

    try {
      const scanKey = `scan_count_${token}`;
      const count = Number(localStorage.getItem(scanKey) || 0);
      localStorage.setItem(scanKey, String(count + 1));
    } catch (_) {}
  }

  /**
   * Realtime database change subscription
   */
  subscribeToChanges(callback) {
    if (!supabase || !isSupabaseConfigured()) {
      return () => {};
    }

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tags' }, () => callback())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => callback())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicles' }, () => callback())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' }, () => callback())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
}

export const orderBackendService = new OrderBackendService();
