import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { renderStyledQrDataUrl, renderStickerBlob, stickerFileName, triggerFileDownload } from '../utils/stickerImage';
import { useCart } from '../context/CartContext';
import { orderBackendService } from '../services/orderBackendService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import {
  LayoutGrid,
  Package,
  Users,
  QrCode,
  Settings,
  Search,
  Bell,
  Clock,
  Printer,
  Truck,
  DollarSign,
  TrendingUp,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  X,
  Plus,
  Download,
  Phone,
  Mail,
  MapPin,
  Shield,
  FileText,
  Trash2,
  Filter,
  Eye,
  RotateCcw,
  RefreshCw,
  Edit3,
  Check,
  Share2,
  Camera
} from 'lucide-react';
import QRScannerModal from '../components/QRScannerModal';
import { buildScanUrl } from '../utils/scanUrl';
import { zipStore } from '../utils/zipStore';

export default function AdminPage() {
  const { lastOrder } = useCart();
  const [activeNav, setActiveNav] = useState('orders'); // Default to Orders matching image 1
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [packageFilter, setPackageFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [printModalItem, setPrintModalItem] = useState(null);
  const [printQrDataUrl, setPrintQrDataUrl] = useState('');
  const [selectedOrderKeys, setSelectedOrderKeys] = useState([]);
  const [selectedAssetKeys, setSelectedAssetKeys] = useState([]);
  const [isBundling, setIsBundling] = useState(false);

  // Generate or resolve high-res QR Code data URL whenever a sticker is prepared for printing
  useEffect(() => {
    if (printModalItem) {
      const token = printModalItem.qr_code_value || printModalItem.qrId || printModalItem.tag_id || printModalItem.rawId || 'tagtique';
      renderStyledQrDataUrl(buildScanUrl(token)).then((url) => {
        setPrintQrDataUrl(url);
      }).catch(() => {
        setPrintQrDataUrl(printModalItem.qr_image_url || '');
      });
    } else {
      setPrintQrDataUrl('');
    }
  }, [printModalItem]);

  const orderSelectionKey = (order) => String(order.tag_id || order.tagId || order.qr_code_value || order.orderId || order.rawId);
  const assetSelectionKey = (asset) => String(asset.id || asset.qr_code_value || asset.qrId);

  const toggleKey = (list, setList, key) => {
    setList((current) => (current.includes(key) ? current.filter((item) => item !== key) : [...current, key]));
  };

  const downloadStickers = async (items) => {
    const ready = (items || []).filter(Boolean);
    if (!ready.length || isBundling) return;
    setIsBundling(true);
    try {
      if (ready.length === 1) {
        const blob = await renderStickerBlob(ready[0]);
        triggerFileDownload(blob, stickerFileName(ready[0]));
        showToast('Downloaded the full sticker');
        return;
      }
      showToast(`Preparing ${ready.length} stickers...`);
      const files = [];
      const usedNames = new Set();
      for (const item of ready) {
        const blob = await renderStickerBlob(item);
        let name = stickerFileName(item);
        if (usedNames.has(name)) name = name.replace(/\.png$/, `-${files.length + 1}.png`);
        usedNames.add(name);
        files.push({ name, data: new Uint8Array(await blob.arrayBuffer()) });
      }
      triggerFileDownload(zipStore(files), `tagtique-stickers-${files.length}.zip`);
      showToast(`Downloaded ${files.length} stickers as a zip`);
    } catch (err) {
      console.error('Sticker download failed:', err);
      showToast('Could not download the stickers');
    } finally {
      setIsBundling(false);
    }
  };

  // Edit form state for vehicle number & order fields
  const [editForm, setEditForm] = useState({
    vehicleNumber: '',
    vehicleType: 'Car',
    customerName: '',
    phoneNumber: '',
    guardianNumber: '',
    status: 'Pending'
  });

  useEffect(() => {
    if (selectedOrder) {
      setEditForm({
        vehicleNumber: selectedOrder.vehicleNumber || selectedOrder.vehicle_number || '',
        vehicleType: selectedOrder.vehicleType || selectedOrder.vehicle_type || 'Car',
        customerName: selectedOrder.customerName || selectedOrder.customer_name || '',
        phoneNumber: selectedOrder.phoneNumber || selectedOrder.phone_number || '',
        guardianNumber: selectedOrder.guardianNumber || selectedOrder.guardian_number || '',
        status: selectedOrder.status || 'Pending'
      });
    }
  }, [selectedOrder]);

  // Generate QR Tag modal state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    type: 'unassigned', // 'unassigned' (pre-printed stock) or 'custom' (on-demand)
    quantity: 1, // Quantity for batch stock generation (e.g. 1, 5, 10, 20, 50, 120)
    customerName: '',
    vehicleNumber: '',
    vehicleType: 'Car',
    phoneNumber: '',
    guardianNumber: '',
    tagMaterial: 'vinyl',
    packageType: 'Single Tag'
  });

  // Reassign QR Tag modal state
  const [reassignModalOrder, setReassignModalOrder] = useState(null);
  const [reassignForm, setReassignForm] = useState({
    customerName: '',
    vehicleNumber: '',
    vehicleType: 'Car',
    phoneNumber: '',
    guardianNumber: '',
    status: 'Pending',
    regenerateQrToken: false
  });

  useEffect(() => {
    if (reassignModalOrder) {
      setReassignForm({
        customerName: reassignModalOrder.customerName || reassignModalOrder.customer_name || '',
        vehicleNumber: reassignModalOrder.vehicleNumber || reassignModalOrder.vehicle_number || '',
        vehicleType: reassignModalOrder.vehicleType || reassignModalOrder.vehicle_type || 'Car',
        phoneNumber: reassignModalOrder.phoneNumber || reassignModalOrder.phone_number || '',
        guardianNumber: reassignModalOrder.guardianNumber || reassignModalOrder.guardian_number || '',
        status: reassignModalOrder.status || 'Pending',
        regenerateQrToken: false
      });
    }
  }, [reassignModalOrder]);

  // Live Orders State (No hardcoded demo items - populated directly from Supabase)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('tagtique_admin_v3_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out legacy demo entries if any
          return parsed.filter(
            (o) => o?.customerName !== 'Alex Henderson' && o?.orderId !== '#TGT-000482' && o?.rawId !== '000482'
          );
        }
      }
    } catch {}
    return [];
  });

  // Load live Supabase orders & subscribe to realtime changes
  useEffect(() => {
    let unsubscribe = () => {};
    orderBackendService.fetchAdminOrders().then((liveRows) => {
      if (Array.isArray(liveRows)) {
        setOrders(liveRows);
      }
    });

    unsubscribe = orderBackendService.subscribeToChanges(() => {
      orderBackendService.fetchAdminOrders().then((liveRows) => {
        if (Array.isArray(liveRows)) {
          setOrders(liveRows);
        }
      });
    });

    return () => unsubscribe();
  }, []);

  // Sync incoming orders from storefront customizer
  useEffect(() => {
    if (lastOrder && lastOrder.orderId) {
      setOrders((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const exists = safePrev.some((o) => o?.orderId === lastOrder.orderId || o?.rawId === lastOrder.orderId);
        if (!exists) {
          const firstItem = lastOrder.items?.[0] || {};
          const plateText = firstItem.engravedText || firstItem.displayName || 'NEW 001';
          const rawId = String(Math.floor(100000 + Math.random() * 900000)).slice(0, 6);
          const newOrder = {
            orderId: `#TGT-${rawId}`,
            rawId: lastOrder.orderId,
            order_id: 'ord-' + (safePrev.length + 1),
            order_number: `TGT-${rawId}`,
            customerName: lastOrder.customer?.name || 'Customer',
            customer_name: lastOrder.customer?.name || 'Customer',
            email: lastOrder.customer?.email || 'user@example.com',
            vehicleNumber: plateText,
            vehicle_number: plateText,
            vehicleType: firstItem.tagType || 'Car',
            vehicle_type: firstItem.tagType || 'Car',
            phoneNumber: lastOrder.customer?.phone || '0300-1234567',
            phone_number: lastOrder.customer?.phone || '0300-1234567',
            guardianNumber: '0300-6622175',
            guardian_number: '0300-6622175',
            package: lastOrder.items?.length > 2 ? 'Family Pack' : lastOrder.items?.length === 2 ? 'Pack of 2' : 'Single Tag',
            packageSub: firstItem.finishName || 'Vinyl Tag',
            package_type: lastOrder.items?.length > 2 ? 'Family Pack' : lastOrder.items?.length === 2 ? 'Pack of 2' : 'Single Tag',
            status: 'Pending',
            changeStatus: 'Pending',
            amount: Number(lastOrder.finalTotal || lastOrder.subtotal) || 1499,
            total_amount: Number(lastOrder.finalTotal || lastOrder.subtotal) || 1499,
            date: new Date().toISOString().slice(0, 10),
            location: lastOrder.shippingAddress?.city ? `${lastOrder.shippingAddress.city}, PK` : 'Faisalabad, PK',
            qrId: `QR-${rawId}-1`,
            serialNumber: `SN-${rawId}`,
            serial_number: `SN-${rawId}`,
            scans: 0
          };
          const updated = [newOrder, ...safePrev];
          try {
            localStorage.setItem('tagtique_admin_v3_orders', JSON.stringify(updated));
          } catch (_) {}
          return updated;
        }
        return safePrev;
      });
    }
  }, [lastOrder]);

  // Keyboard shortcut Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
        setSelectedOrder(null);
        setPrintModalItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const updated = safePrev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus, changeStatus: newStatus } : o));
      try {
        localStorage.setItem('tagtique_admin_v3_orders', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
    if (selectedOrder && selectedOrder.orderId === orderId) {
      setSelectedOrder((prev) => ({ ...prev, status: newStatus, changeStatus: newStatus }));
    }
    const target = safeOrders.find((o) => o.orderId === orderId);
    if (target?.tag_id) {
      orderBackendService.updateTagAndOrder(target.tag_id, { status: newStatus.toLowerCase() });
    }
    showToast(`Order ${orderId} updated to "${newStatus}"`);
  };

  const handleDeleteOrder = async (order) => {
    if (!order) return;
    const identifier = order.orderId || order.order_number || 'this order';
    const customer = order.customerName || order.customer_name || 'Customer';
    const vehicle = order.vehicleNumber || order.vehicle_number || '';
    const confirmPrompt = `Are you sure you want to permanently delete order ${identifier} (${customer}${vehicle ? ' - ' + vehicle : ''})?\n\nThis will remove the tag, vehicle registration, and proxy mapping.`;

    if (!window.confirm(confirmPrompt)) {
      return;
    }

    try {
      await orderBackendService.deleteOrder(order);

      setOrders((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const updated = safePrev.filter((o) => {
          if (order.tag_id && o.tag_id && o.tag_id === order.tag_id) return false;
          if (order.orderId && o.orderId && o.orderId === order.orderId) return false;
          if (order.rawId && o.rawId && o.rawId === order.rawId) return false;
          return true;
        });
        try {
          localStorage.setItem('tagtique_admin_v3_orders', JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });

      if (selectedOrder && (selectedOrder.orderId === order.orderId || (order.tag_id && selectedOrder.tag_id === order.tag_id))) {
        setSelectedOrder(null);
      }

      showToast(`Order ${identifier} deleted permanently`);
    } catch (err) {
      console.error('Delete error:', err);
      showToast(`Failed to delete order ${identifier}`);
    }
  };

  const handleSaveOrder = async (e) => {
    if (e) e.preventDefault();
    if (!selectedOrder) return;

    const trimmedVehicleNumber = (editForm.vehicleNumber || '').trim().toUpperCase();
    if (!trimmedVehicleNumber) {
      alert('Please enter a valid vehicle number / plate.');
      return;
    }

    const updates = {
      vehicle_id: selectedOrder.vehicle_id || selectedOrder.vehicleId,
      vehicle_number: trimmedVehicleNumber,
      vehicleNumber: trimmedVehicleNumber,
      vehicle_type: editForm.vehicleType,
      vehicleType: editForm.vehicleType,
      customer_id: selectedOrder.customer_id || selectedOrder.customerId,
      customer_name: editForm.customerName.trim(),
      customerName: editForm.customerName.trim(),
      phone_number: editForm.phoneNumber.trim(),
      phoneNumber: editForm.phoneNumber.trim(),
      guardian_number: editForm.guardianNumber.trim(),
      guardianNumber: editForm.guardianNumber.trim(),
      status: editForm.status
    };

    try {
      await orderBackendService.updateTagAndOrder(selectedOrder.tag_id || selectedOrder.tagId, updates);

      setOrders((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const updated = safePrev.map((o) => {
          const matchTag = selectedOrder.tag_id && o.tag_id === selectedOrder.tag_id;
          const matchOrder = o.orderId === selectedOrder.orderId || o.order_number === selectedOrder.order_number;
          if (matchTag || matchOrder) {
            return {
              ...o,
              ...updates
            };
          }
          return o;
        });
        try {
          localStorage.setItem('tagtique_admin_v3_orders', JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });

      setSelectedOrder(null);
      showToast(`Updated vehicle number to "${trimmedVehicleNumber}"`);
    } catch (err) {
      console.error('Save order error:', err);
      showToast('Failed to save vehicle details');
    }
  };

  const handleQuickEditVehicle = async (order) => {
    const currentNum = order.vehicleNumber || order.vehicle_number || '';
    const newPlate = window.prompt(`Edit Vehicle Number for order ${order.orderId || order.order_number}:`, currentNum);
    if (newPlate === null) return;
    const trimmed = newPlate.trim().toUpperCase();
    if (!trimmed) {
      alert('Vehicle number cannot be empty.');
      return;
    }
    if (trimmed === currentNum) return;

    try {
      await orderBackendService.updateTagAndOrder(order.tag_id || order.tagId, {
        vehicle_id: order.vehicle_id || order.vehicleId,
        vehicle_number: trimmed,
        vehicleNumber: trimmed
      });

      setOrders((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const updated = safePrev.map((o) => {
          const matchTag = order.tag_id && o.tag_id === order.tag_id;
          const matchOrder = o.orderId === order.orderId || o.order_number === order.order_number;
          if (matchTag || matchOrder) {
            return {
              ...o,
              vehicleNumber: trimmed,
              vehicle_number: trimmed
            };
          }
          return o;
        });
        try {
          localStorage.setItem('tagtique_admin_v3_orders', JSON.stringify(updated));
        } catch (_) {}
        return updated;
      });

      showToast(`Vehicle plate updated to "${trimmed}"`);
    } catch (err) {
      console.error('Quick edit vehicle error:', err);
      showToast('Failed to update vehicle plate');
    }
  };

  const handleGenerateTag = async (e) => {
    if (e) e.preventDefault();
    try {
      const isUnassigned = generateForm.type === 'unassigned';
      const qty = isUnassigned ? Math.max(1, Math.min(Number(generateForm.quantity) || 1, 150)) : 1;
      const created = await orderBackendService.generateNewTag({
        customerName: isUnassigned ? 'Unassigned Inventory' : (generateForm.customerName.trim() || 'Valued Customer'),
        vehicleNumber: isUnassigned ? 'UNASSIGNED' : (generateForm.vehicleNumber.trim().toUpperCase() || 'NEW 001'),
        vehicleType: generateForm.vehicleType,
        phoneNumber: isUnassigned ? '0300 0000000' : (generateForm.phoneNumber.trim() || '0300 0000000'),
        guardianNumber: isUnassigned ? '' : generateForm.guardianNumber.trim(),
        tagMaterial: generateForm.tagMaterial,
        packageType: generateForm.packageType,
        status: 'pending',
        quantity: qty
      });

      const itemsCreated = Array.isArray(created) ? created : [created];
      setOrders((prev) => [...itemsCreated, ...(Array.isArray(prev) ? prev : [])]);
      setIsGenerateModalOpen(false);
      showToast(
        qty > 1
          ? `Batch generated ${qty} QR Tags (${itemsCreated[0]?.vehicleNumber} to ${itemsCreated[itemsCreated.length - 1]?.vehicleNumber})`
          : `Generated new QR Tag ${itemsCreated[0]?.serialNumber} (${itemsCreated[0]?.vehicleNumber})`
      );
      
      // Automatically open sticker preview for printing the first tag
      if (itemsCreated[0]) {
        setPrintModalItem(itemsCreated[0]);
      }
    } catch (err) {
      console.error('Generate tag error:', err);
      showToast('Failed to generate new QR Tag');
    }
  };

  const handleReassignTag = async (e) => {
    if (e) e.preventDefault();
    if (!reassignModalOrder) return;

    const trimmedPlate = (reassignForm.vehicleNumber || '').trim().toUpperCase();
    const trimmedCustomer = (reassignForm.customerName || '').trim();

    if (!trimmedPlate) {
      alert('Please enter a vehicle registration number.');
      return;
    }

    try {
      const updates = {
        vehicle_id: reassignModalOrder.vehicle_id || reassignModalOrder.vehicleId,
        vehicle_number: trimmedPlate,
        vehicleNumber: trimmedPlate,
        vehicle_type: reassignForm.vehicleType,
        vehicleType: reassignForm.vehicleType,
        customer_id: reassignModalOrder.customer_id || reassignModalOrder.customerId,
        customer_name: trimmedCustomer,
        customerName: trimmedCustomer,
        phone_number: reassignForm.phoneNumber.trim(),
        phoneNumber: reassignForm.phoneNumber.trim(),
        guardian_number: reassignForm.guardianNumber.trim(),
        guardianNumber: reassignForm.guardianNumber.trim(),
        status: reassignForm.status,
        regenerateQrToken: reassignForm.regenerateQrToken
      };

      const result = await orderBackendService.reassignTagDetails(
        reassignModalOrder.tag_id || reassignModalOrder.tagId,
        updates
      );

      setOrders((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return safePrev.map((o) => {
          const matchTag = reassignModalOrder.tag_id && o.tag_id === reassignModalOrder.tag_id;
          const matchOrder = o.orderId === reassignModalOrder.orderId || o.order_number === reassignModalOrder.order_number;
          if (matchTag || matchOrder) {
            return {
              ...o,
              ...updates,
              ...(result.qr_code_value ? { qr_code_value: result.qr_code_value, qr_image_url: result.qr_image_url } : {})
            };
          }
          return o;
        });
      });

      const targetSerial = reassignModalOrder.serialNumber || 'TAG';
      setReassignModalOrder(null);
      showToast(`Successfully reassigned QR ${targetSerial} to ${trimmedCustomer || 'new owner'} (${trimmedPlate})`);
    } catch (err) {
      console.error('Reassign tag error:', err);
      showToast('Failed to reassign QR details');
    }
  };

  const handleRefreshData = async () => {
    try {
      const liveRows = await orderBackendService.fetchAdminOrders();
      setOrders(Array.isArray(liveRows) ? liveRows : []);
      showToast('Dashboard synchronized with live Supabase database');
    } catch (_) {
      showToast('Failed to sync with Supabase');
    }
  };

  const safeOrders = Array.isArray(orders) ? orders : [];

  // Dynamically derive customers from real orders
  const dynamicCustomers = useMemo(() => {
    const map = new Map();
    for (const order of safeOrders) {
      const name = (order.customerName || order.customer_name || '').trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          id: order.customer_id || key,
          name: name,
          email: order.email || `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          phone: order.phoneNumber || order.phone_number || '-',
          location: order.location || (order.city ? `${order.city}, PK` : 'Faisalabad, PK'),
          totalOrders: 0,
          lastOrderDate: order.date || (order.created_at ? order.created_at.slice(0, 10) : ''),
          lifetimeSpend: 0
        });
      }
      const c = map.get(key);
      c.totalOrders += 1;
      c.lifetimeSpend += Number(order.amount || order.total_amount) || 1499;
      const orderDate = order.date || (order.created_at ? order.created_at.slice(0, 10) : '');
      if (orderDate && orderDate > c.lastOrderDate) {
        c.lastOrderDate = orderDate;
      }
    }
    return Array.from(map.values());
  }, [safeOrders]);

  // Dynamically derive QR code assets from real orders
  const dynamicQrAssets = useMemo(() => {
    return safeOrders.map((order, idx) => ({
      id: order.tag_id || order.tagId || `qr-${idx}`,
      qrId: order.qrId || (order.qr_code_value ? `QR-${order.qr_code_value.slice(0, 8).toUpperCase()}` : `QR-00${idx + 1}`),
      serialNumber: order.serialNumber || (order.qr_code_value ? `SN-${order.qr_code_value.replace(/^tgt-/, '').replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase()}` : `SN-${order.rawId || idx + 1}`),
      orderId: order.orderId || order.order_number || `#TGT-${idx + 1}`,
      plate: order.vehicleNumber || order.vehicle_number || 'VEHICLE',
      customer: order.customerName || order.customer_name || 'Vehicle Owner',
      scans: order.scans || 0,
      status: order.status === 'Pending' || order.status === 'pending' ? 'Pending Print' : 'Active',
      qr_image_url: order.qr_image_url || '',
      qr_code_value: order.qr_code_value || ''
    }));
  }, [safeOrders]);

  // Filtered Orders
  const filteredOrders = safeOrders.filter((order) => {
    if (!order) return false;
    const q = String(searchQuery || '').trim().toLowerCase();
    const nameMatch = String(order.customerName || '').toLowerCase().includes(q);
    const idMatch = String(order.orderId || '').toLowerCase().includes(q);
    const phoneMatch = String(order.phoneNumber || '').includes(searchQuery || '');
    const vehicleMatch = String(order.vehicleNumber || '').toLowerCase().includes(q);
    const serialMatch = String(order.serialNumber || '').toLowerCase().includes(q) || String(order.qr_code_value || '').toLowerCase().includes(q);
    const matchSearch = !q || nameMatch || idMatch || phoneMatch || vehicleMatch || serialMatch;
    const matchStatus = statusFilter === 'ALL' || order.status.toLowerCase() === statusFilter.toLowerCase();
    const matchPackage = packageFilter === 'ALL' || order.package.toLowerCase() === packageFilter.toLowerCase();
    return matchSearch && matchStatus && matchPackage;
  });

  // KPI calculations for dashboard overview
  const totalOrdersCount = safeOrders.length;
  const newCount = safeOrders.filter((o) => o?.status === 'Pending' || o?.status === 'New').length;
  const printingCount = safeOrders.filter((o) => o?.status === 'Printing').length;
  const shippedCount = safeOrders.filter((o) => o?.status === 'Shipped').length;
  const grossRevenuePkr = safeOrders.reduce((sum, o) => sum + (Number(o?.amount) || 0), 0);

  return (
    <div className="min-h-screen flex bg-tag-bg text-tag-brown font-manrope selection:bg-tag-amber selection:text-tag-brown-deep">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-tag-brown text-tag-bg px-5 py-3 rounded-2xl shadow-warm-lg flex items-center gap-3 animate-fadeIn font-semibold text-xs border border-tag-amber/30">
          <CheckCircle2 className="w-4 h-4 text-tag-amber" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* LEFT SIDEBAR (Themed in warm luxury cream/pill/espresso) */}
      <aside className="w-64 bg-[#FAF3E5] border-r border-tag-border flex flex-col justify-between shrink-0 sticky top-0 h-screen z-20 select-none shadow-xs">
        <div className="flex flex-col">
          {/* Header Brand */}
          <div className="p-6 pb-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-tag-card border border-tag-border flex items-center justify-center text-tag-brown shadow-warm-sm">
              <Shield className="w-5 h-5 fill-tag-amber text-tag-brown" />
            </div>
            <div className="flex flex-col">
              <span className="font-baloo font-extrabold text-[15px] tracking-wide text-tag-brown leading-tight">
                TAGTIQUE
              </span>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-tag-brown-muted">
                OPERATIONS
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="px-4 flex flex-col gap-1.5 mt-3">
            <button
              type="button"
              onClick={() => setActiveNav('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeNav === 'dashboard'
                  ? 'bg-gradient-to-r from-[#F4EADA] to-[#FCEFDA] text-tag-brown border border-tag-border shadow-warm-sm'
                  : 'text-tag-brown-muted hover:text-tag-brown hover:bg-tag-card/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid className={`w-4 h-4 ${activeNav === 'dashboard' ? 'text-tag-brown' : 'text-tag-brown-subtle'}`} />
                <span>Dashboard</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveNav('orders')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeNav === 'orders'
                  ? 'bg-gradient-to-r from-[#F4EADA] to-[#FCEFDA] text-tag-brown border border-tag-border shadow-warm-sm'
                  : 'text-tag-brown-muted hover:text-tag-brown hover:bg-tag-card/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className={`w-4 h-4 ${activeNav === 'orders' ? 'text-tag-brown' : 'text-tag-brown-subtle'}`} />
                <span>Orders</span>
              </div>
              {newCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#F4EADA] text-tag-brown border border-tag-border">
                  {newCount} New
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveNav('customers')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeNav === 'customers'
                  ? 'bg-gradient-to-r from-[#F4EADA] to-[#FCEFDA] text-tag-brown border border-tag-border shadow-warm-sm'
                  : 'text-tag-brown-muted hover:text-tag-brown hover:bg-tag-card/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className={`w-4 h-4 ${activeNav === 'customers' ? 'text-tag-brown' : 'text-tag-brown-subtle'}`} />
                <span>Customers</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveNav('qrcodes')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeNav === 'qrcodes'
                  ? 'bg-gradient-to-r from-[#F4EADA] to-[#FCEFDA] text-tag-brown border border-tag-border shadow-warm-sm'
                  : 'text-tag-brown-muted hover:text-tag-brown hover:bg-tag-card/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <QrCode className={`w-4 h-4 ${activeNav === 'qrcodes' ? 'text-tag-brown' : 'text-tag-brown-subtle'}`} />
                <span>QR Codes</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsScannerModalOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold text-tag-brown-muted hover:text-tag-brown hover:bg-tag-card/60 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Camera className="w-4 h-4 text-tag-amber group-hover:scale-110 transition-transform" />
                <span>QR Scanner</span>
              </div>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                LIVE
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveNav('settings')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeNav === 'settings'
                  ? 'bg-gradient-to-r from-[#F4EADA] to-[#FCEFDA] text-tag-brown border border-tag-border shadow-warm-sm'
                  : 'text-tag-brown-muted hover:text-tag-brown hover:bg-tag-card/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className={`w-4 h-4 ${activeNav === 'settings' ? 'text-tag-brown' : 'text-tag-brown-subtle'}`} />
                <span>Settings</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Sidebar Bottom: Customer View & Reset */}
        <div className="p-4 border-t border-tag-border flex flex-col gap-2">
          <button
            type="button"
            onClick={handleRefreshData}
            title="Sync latest live records from Supabase"
            className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-tag-brown-muted hover:text-tag-brown hover:bg-tag-card/60 flex items-center gap-2 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-tag-amber" />
            <span>Sync Supabase Data</span>
          </button>

          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-tag-brown hover:bg-tag-card transition-colors border border-transparent hover:border-tag-border"
          >
            <span>Customer View</span>
            <ExternalLink className="w-3.5 h-3.5 text-tag-amber" />
          </Link>
        </div>
      </aside>

      {/* RIGHT WORKSPACE AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-[#FAF3E5] border-b border-tag-border px-8 flex items-center justify-between sticky top-0 z-10 shadow-xs">
          {/* Search & Scanner Trigger */}
          <div className="flex items-center gap-2.5">
            <div
              onClick={() => setIsSearchModalOpen(true)}
              className="flex items-center gap-2.5 text-xs text-tag-brown-muted bg-tag-bg hover:bg-tag-pill px-3.5 py-2 rounded-xl border border-tag-border cursor-pointer w-64 sm:w-72 transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-tag-brown-light" />
              <span>Press</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-tag-card border border-tag-border rounded font-bold text-tag-brown">
                Ctrl+K
              </kbd>
              <span className="truncate">to quick search</span>
            </div>

            <button
              type="button"
              onClick={() => setIsScannerModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-tag-card hover:bg-tag-pill border border-tag-border text-xs font-bold text-tag-brown transition-colors shadow-2xs"
              title="Open QR Scanner & Inspector"
            >
              <Camera className="w-3.5 h-3.5 text-tag-amber" />
              <span className="hidden sm:inline">Scan QR</span>
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-5">
            <button
              type="button"
              className="relative p-2 rounded-full text-tag-brown hover:bg-tag-card transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-tag-amber ring-2 ring-[#FAF3E5]" />
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-tag-border">
              <div className="w-8 h-8 rounded-full bg-tag-pill border border-tag-border text-tag-brown flex items-center justify-center font-bold text-xs">
                OA
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-tag-brown leading-tight">
                  Ops Admin
                </span>
                <span className="text-[10px] text-tag-brown-muted font-medium">
                  Fulfillment Hub
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto flex flex-col gap-6">
          {/* ======================================================== */}
          {/* TAB 1: ORDERS (E-TAG ORDERS & QR REGISTRY) - MATCHING IMG 1 */}
          {/* ======================================================== */}
          {activeNav === 'orders' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="font-baloo font-extrabold text-2xl sm:text-3xl text-tag-brown tracking-tight">
                      E-Tag Orders & QR Registry
                    </h1>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Supabase Realtime Connected</span>
                    </span>
                  </div>
                  <p className="text-xs text-tag-brown-muted font-medium mt-1">
                    Real-time management for vehicle tags, masked phone relays, and print-ready QR codes
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsScannerModalOpen(true)}
                    className="px-4 py-1.5 rounded-full bg-tag-brown hover:bg-tag-brown-deep text-tag-bg text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-warm-sm border border-tag-amber/30 hover:scale-[1.02]"
                    title="Scan physical vehicle sticker with camera or upload image"
                  >
                    <Camera className="w-3.5 h-3.5 text-tag-amber" />
                    <span>Scan QR Tag</span>
                  </button>

                  <button
                    type="button"
                    disabled={isBundling || selectedOrderKeys.length === 0}
                    onClick={() => downloadStickers(filteredOrders.filter((order) => selectedOrderKeys.includes(orderSelectionKey(order))))}
                    className="px-4 py-1.5 rounded-full bg-tag-brown hover:bg-tag-brown-deep text-tag-bg text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-warm-sm disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-tag-amber" />
                    <span>{isBundling ? 'Preparing...' : `Download bundle${selectedOrderKeys.length ? ` (${selectedOrderKeys.length})` : ''}`}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGenerateForm({
                        type: 'unassigned',
                        customerName: '',
                        vehicleNumber: '',
                        vehicleType: 'Car',
                        phoneNumber: '',
                        guardianNumber: '',
                        tagMaterial: 'vinyl',
                        packageType: 'Single Tag'
                      });
                      setIsGenerateModalOpen(true);
                    }}
                    className="amber-gradient-btn px-4 py-1.5 rounded-full text-xs font-extrabold text-tag-brown flex items-center gap-1.5 shadow-warm-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Generate QR Tag</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRefreshData}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-tag-card hover:bg-tag-pill border border-tag-border text-xs font-bold text-tag-brown transition-colors shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-tag-amber" />
                    <span>Sync</span>
                  </button>
                  <span className="text-xs font-bold text-tag-brown-muted">
                    Showing {filteredOrders.length} of {safeOrders.length}
                  </span>
                </div>
              </div>

              {/* Filter Bar matching Image 1 */}
              <div className="bg-tag-card rounded-2xl border border-tag-border p-4 shadow-warm-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:flex-1">
                  <Search className="w-4 h-4 text-tag-brown-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by customer name, phone, or vehicle number..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-tag-border text-xs font-semibold text-tag-brown outline-none focus:border-tag-amber bg-tag-bg"
                  />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-tag-border text-xs font-bold text-tag-brown bg-tag-bg outline-none focus:border-tag-amber"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Printing">Printing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>

                  <select
                    value={packageFilter}
                    onChange={(e) => setPackageFilter(e.target.value)}
                    className="px-3 py-2.5 rounded-xl border border-tag-border text-xs font-bold text-tag-brown bg-tag-bg outline-none focus:border-tag-amber"
                  >
                    <option value="ALL">All Packages</option>
                    <option value="Single Tag">Single Tag</option>
                    <option value="Pack of 2">Pack of 2</option>
                    <option value="Family Pack">Family Pack</option>
                  </select>
                </div>
              </div>

              {/* Orders Table matching Image 1 */}
              <div className="bg-tag-card rounded-2xl border border-tag-border shadow-warm-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-tag-border bg-tag-pill/40 text-tag-brown-muted font-bold tracking-wider uppercase text-[10.5px]">
                        <th className="py-3.5 pl-4">
                          <input
                            type="checkbox"
                            checked={filteredOrders.length > 0 && filteredOrders.every((order) => selectedOrderKeys.includes(orderSelectionKey(order)))}
                            onChange={(e) => setSelectedOrderKeys(e.target.checked ? filteredOrders.map(orderSelectionKey) : [])}
                            aria-label="Select all stickers"
                          />
                        </th>
                        <th className="py-3.5">CUSTOMER NAME</th>
                        <th className="py-3.5">VEHICLE NUMBER</th>
                        <th className="py-3.5">PHONE NUMBER</th>
                        <th className="py-3.5">GUARDIAN NUMBER</th>
                        <th className="py-3.5">PACKAGE</th>
                        <th className="py-3.5">STATUS</th>
                        <th className="py-3.5">CHANGE STATUS</th>
                        <th className="py-3.5 pr-4 text-right">ROW ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tag-border/60">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="py-12 text-center text-tag-brown-muted font-bold">
                            No orders match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order.orderId} className="hover:bg-tag-bg/60 transition-colors">
                            <td className="py-4 pl-4">
                              <input
                                type="checkbox"
                                checked={selectedOrderKeys.includes(orderSelectionKey(order))}
                                onChange={() => toggleKey(selectedOrderKeys, setSelectedOrderKeys, orderSelectionKey(order))}
                                aria-label={`Select ${order.vehicleNumber || order.orderId}`}
                              />
                            </td>
                            {/* Customer Name & Order ID & Serial */}
                            <td className="py-4">
                              <div className="font-extrabold text-sm text-tag-brown capitalize">
                                {order.customerName}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-[11px] font-mono text-tag-brown-muted">
                                  {order.orderId}
                                </span>
                                {order.serialNumber && (
                                  <span
                                    className="text-[9.5px] font-mono font-bold text-tag-amber-deep bg-tag-pill px-1.5 py-0.2 rounded border border-tag-border/60"
                                    title="Physical Sticker Serial Number (Supabase key)"
                                  >
                                    {order.serialNumber}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Vehicle Number */}
                            <td className="py-4">
                              <div className="flex flex-col gap-1 items-start">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(order)}
                                  className="group inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg border border-tag-border bg-tag-pill hover:bg-white hover:border-tag-amber font-mono font-bold text-xs text-tag-brown transition-all shadow-2xs cursor-pointer text-left"
                                  title="Click to edit vehicle plate and details"
                                >
                                  <span>{order.vehicleNumber}</span>
                                  <Edit3 className="w-2.5 h-2.5 text-tag-brown-muted group-hover:text-tag-amber opacity-60 group-hover:opacity-100 transition-opacity" />
                                </button>
                                <span className="text-[11px] text-tag-brown-muted font-medium">
                                  {order.vehicleType}
                                </span>
                              </div>
                            </td>

                            {/* Phone Number */}
                            <td className="py-4 font-mono font-semibold text-tag-brown">
                              {order.phoneNumber}
                            </td>

                            {/* Guardian Number */}
                            <td className="py-4 font-mono font-medium text-tag-brown-muted">
                              {order.guardianNumber}
                            </td>

                            {/* Package */}
                            <td className="py-4">
                              <div className="font-bold text-tag-brown">
                                {order.package}
                              </div>
                              <div className="text-[10.5px] text-tag-brown-muted">
                                {order.packageSub}
                              </div>
                            </td>

                            {/* Status Pill Badge */}
                            <td className="py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border ${
                                  order.status === 'Pending'
                                    ? 'bg-[#FEF5E7] text-[#975A16] border-[#FBD38D]'
                                    : order.status === 'Printing'
                                    ? 'bg-amber-50 text-amber-800 border-amber-300'
                                    : order.status === 'Shipped'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${
                                    order.status === 'Pending' || order.status === 'Printing'
                                      ? 'bg-amber-500'
                                      : order.status === 'Shipped'
                                      ? 'bg-blue-500'
                                      : 'bg-emerald-500'
                                  }`}
                                />
                                <span>{order.status}</span>
                              </span>
                            </td>

                            {/* Change Status Dropdown */}
                            <td className="py-4">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateStatus(order.orderId, e.target.value)}
                                className="px-2.5 py-1 rounded-lg border border-tag-border bg-tag-bg text-xs font-bold text-tag-brown outline-none cursor-pointer"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Printing">Printing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>

                            {/* Row Actions */}
                            <td className="py-4 pr-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setPrintModalItem(order)}
                                  className="px-3 py-1 rounded-lg bg-tag-brown hover:bg-tag-brown-deep text-tag-bg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                                  title="Print Sticker Cut Sheet"
                                >
                                  <Printer className="w-3.5 h-3.5 text-tag-amber" />
                                  <span>Print Sticker</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => downloadStickers([order])}
                                  className="px-2.5 py-1 rounded-lg border border-tag-border bg-tag-card hover:bg-tag-pill text-tag-brown text-xs font-bold flex items-center gap-1 transition-colors"
                                  title="Download the full yellow sticker"
                                >
                                  <Download className="w-3 h-3 text-tag-brown-light" />
                                  <span className="hidden md:inline">Download sticker</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(order)}
                                  className="px-2.5 py-1 rounded-lg bg-tag-brown hover:bg-tag-brown-deep text-tag-bg text-xs font-bold flex items-center gap-1 transition-colors"
                                  title="Edit Order"
                                >
                                  <Edit3 className="w-3 h-3 text-tag-amber" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setReassignModalOrder(order)}
                                  className="px-2.5 py-1 rounded-lg border border-tag-amber/70 bg-amber-50 hover:bg-amber-100 text-tag-amber-deep text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                                  title="Reassign QR tag to new customer or vehicle on demand"
                                >
                                  <RotateCcw className="w-3 h-3 text-tag-amber-deep" />
                                  <span>Reassign</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteOrder(order)}
                                  className="px-2.5 py-1 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-bold flex items-center gap-1 transition-all shadow-2xs hover:border-red-300"
                                  title={`Delete ${order.orderId || order.order_number}`}
                                >
                                  <Trash2 className="w-3 h-3 text-red-500" />
                                  <span>Delete</span>
                                </button>

                                <Link
                                  to="/scan"
                                  target="_blank"
                                  className="p-1 rounded-lg border border-tag-border bg-tag-card hover:bg-tag-pill text-tag-brown transition-colors"
                                  title="Test Live Profile Relay"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: REGISTERED CUSTOMERS - MATCHING IMG 2 */}
          {/* ======================================================== */}
          {activeNav === 'customers' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <h1 className="font-baloo font-extrabold text-2xl sm:text-3xl text-tag-brown tracking-tight">
                    Registered Customers
                  </h1>
                  <p className="text-xs text-tag-brown-muted font-medium mt-1">
                    Directory of vehicle owners with active Tagtique contact relays
                  </p>
                </div>
                <span className="text-xs font-bold text-tag-brown-muted bg-tag-card px-3 py-1.5 rounded-full border border-tag-border">
                  Total Customers: {dynamicCustomers.length}
                </span>
              </div>

              {/* Search Bar */}
              <div className="bg-tag-card rounded-2xl border border-tag-border p-4 shadow-warm-sm">
                <div className="relative w-full sm:max-w-md">
                  <Search className="w-4 h-4 text-tag-brown-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search customers by name, email, or city..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-tag-border text-xs font-semibold text-tag-brown outline-none focus:border-tag-amber bg-tag-bg"
                  />
                </div>
              </div>

              {/* Customers Table matching Image 2 */}
              <div className="bg-tag-card rounded-2xl border border-tag-border shadow-warm-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-tag-border bg-tag-pill/40 text-tag-brown-muted font-bold tracking-wider uppercase text-[10.5px]">
                        <th className="py-3.5 pl-4">CUSTOMER NAME</th>
                        <th className="py-3.5">CONTACT EMAIL & PHONE</th>
                        <th className="py-3.5">LOCATION</th>
                        <th className="py-3.5">TOTAL ORDERS</th>
                        <th className="py-3.5">LAST ORDER DATE</th>
                        <th className="py-3.5">LIFETIME SPEND</th>
                        <th className="py-3.5 pr-4 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tag-border/60">
                      {dynamicCustomers.filter((c) =>
                        !searchQuery ||
                        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.location.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-tag-brown-muted font-bold">
                            No customers found. Customers will automatically appear here as orders are placed.
                          </td>
                        </tr>
                      ) : (
                        dynamicCustomers.filter((c) =>
                          !searchQuery ||
                          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.location.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map((cust) => (
                          <tr key={cust.id} className="hover:bg-tag-bg/60 transition-colors">
                            <td className="py-4 pl-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-tag-pill border border-tag-border text-tag-brown flex items-center justify-center font-bold text-xs">
                                  {cust.name.charAt(0)}
                                </div>
                                <span className="font-extrabold text-sm text-tag-brown">
                                  {cust.name}
                                </span>
                              </div>
                            </td>

                            <td className="py-4">
                              <div className="font-medium text-tag-brown">{cust.email}</div>
                              <div className="text-[11px] font-mono text-tag-brown-muted">{cust.phone}</div>
                            </td>

                            <td className="py-4 font-medium text-tag-brown-muted">
                              {cust.location}
                            </td>

                            <td className="py-4 font-mono font-bold text-tag-brown">
                              {cust.totalOrders} {cust.totalOrders > 1 ? 'orders' : 'order'}
                            </td>

                            <td className="py-4 font-mono text-tag-brown-muted">
                              {cust.lastOrderDate}
                            </td>

                            <td className="py-4 font-mono font-bold text-sm text-tag-brown">
                              PKR {cust.lifetimeSpend.toLocaleString()}
                            </td>

                            <td className="py-4 pr-4 text-right">
                              <button
                                type="button"
                                onClick={() => showToast(`Loaded history for ${cust.name}`)}
                                className="text-tag-brown hover:text-tag-amber-deep font-bold text-xs inline-flex items-center gap-1 transition-colors hover:underline"
                              >
                                <span>View History</span>
                                <span>→</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: QR CODE ASSET INVENTORY - MATCHING IMG 3 */}
          {/* ======================================================== */}
          {activeNav === 'qrcodes' && (
            <div className="flex flex-col gap-6 animate-fadeIn">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <h1 className="font-baloo font-extrabold text-2xl sm:text-3xl text-tag-brown tracking-tight">
                    QR Code Asset Inventory
                  </h1>
                  <p className="text-xs text-tag-brown-muted font-medium mt-1">
                    Cryptographic proxy tokens generated and etched onto physical vehicle stickers
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsScannerModalOpen(true)}
                    className="px-4 py-1.5 rounded-full bg-tag-brown hover:bg-tag-brown-deep text-tag-bg text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-warm-sm border border-tag-amber/30 hover:scale-[1.02]"
                    title="Scan physical vehicle sticker with camera or upload image"
                  >
                    <Camera className="w-3.5 h-3.5 text-tag-amber" />
                    <span>Scan QR Tag</span>
                  </button>

                  <button
                    type="button"
                    disabled={isBundling || selectedAssetKeys.length === 0}
                    onClick={() => {
                      const chosen = dynamicQrAssets.filter((asset) => selectedAssetKeys.includes(assetSelectionKey(asset)));
                      downloadStickers(chosen.map((asset) => (
                        safeOrders.find((order) => order.orderId === asset.orderId || order.tag_id === asset.id || order.tagId === asset.id) || {
                          vehicleNumber: asset.plate,
                          qr_code_value: asset.qr_code_value || asset.qrId,
                          serialNumber: asset.serialNumber
                        }
                      )));
                    }}
                    className="px-4 py-1.5 rounded-full bg-tag-brown hover:bg-tag-brown-deep text-tag-bg text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-warm-sm disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5 text-tag-amber" />
                    <span>{isBundling ? 'Preparing...' : `Download bundle${selectedAssetKeys.length ? ` (${selectedAssetKeys.length})` : ''}`}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGenerateForm({
                        type: 'unassigned',
                        customerName: '',
                        vehicleNumber: '',
                        vehicleType: 'Car',
                        phoneNumber: '',
                        guardianNumber: '',
                        tagMaterial: 'vinyl',
                        packageType: 'Single Tag'
                      });
                      setIsGenerateModalOpen(true);
                    }}
                    className="amber-gradient-btn px-4 py-1.5 rounded-full text-xs font-extrabold text-tag-brown flex items-center gap-1.5 shadow-warm-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Generate New QR</span>
                  </button>
                  <span className="text-xs font-bold text-tag-brown-muted bg-tag-card px-3 py-1.5 rounded-full border border-tag-border">
                    Active Assets: {dynamicQrAssets.length}
                  </span>
                </div>
              </div>

              {/* Search Bar */}
              <div className="bg-tag-card rounded-2xl border border-tag-border p-4 shadow-warm-sm">
                <div className="relative w-full sm:max-w-md">
                  <Search className="w-4 h-4 text-tag-brown-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by QR ID, Order #, Customer, or Plate..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-tag-border text-xs font-semibold text-tag-brown outline-none focus:border-tag-amber bg-tag-bg"
                  />
                </div>
              </div>

              {/* QR Assets Table matching Image 3 */}
              <div className="bg-tag-card rounded-2xl border border-tag-border shadow-warm-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-tag-border bg-tag-pill/40 text-tag-brown-muted font-bold tracking-wider uppercase text-[10.5px]">
                        <th className="py-3.5 pl-4">
                          <input
                            type="checkbox"
                            checked={dynamicQrAssets.length > 0 && dynamicQrAssets.every((asset) => selectedAssetKeys.includes(assetSelectionKey(asset)))}
                            onChange={(e) => setSelectedAssetKeys(e.target.checked ? dynamicQrAssets.map(assetSelectionKey) : [])}
                            aria-label="Select all QR stickers"
                          />
                        </th>
                        <th className="py-3.5">ASSET PREVIEW</th>
                        <th className="py-3.5">QR IDENTIFIER</th>
                        <th className="py-3.5">LINKED ORDER #</th>
                        <th className="py-3.5">VEHICLE PLATE</th>
                        <th className="py-3.5">LINKED CUSTOMER</th>
                        <th className="py-3.5">TOTAL SCANS</th>
                        <th className="py-3.5">STATUS</th>
                        <th className="py-3.5 pr-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tag-border/60">
                      {dynamicQrAssets.filter((a) =>
                        !searchQuery ||
                        a.qrId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        a.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        a.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        a.plate.toLowerCase().includes(searchQuery.toLowerCase())
                      ).length === 0 ? (
                        <tr>
                          <td colSpan="9" className="py-12 text-center text-tag-brown-muted font-bold">
                            No QR code assets found. Assets will appear here as vehicle tags are registered.
                          </td>
                        </tr>
                      ) : (
                        dynamicQrAssets.filter((a) =>
                          !searchQuery ||
                          a.qrId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.plate.toLowerCase().includes(searchQuery.toLowerCase())
                        ).map((asset) => (
                        <tr key={asset.id} className="hover:bg-tag-bg/60 transition-colors">
                          <td className="py-4 pl-4">
                            <input
                              type="checkbox"
                              checked={selectedAssetKeys.includes(assetSelectionKey(asset))}
                              onChange={() => toggleKey(selectedAssetKeys, setSelectedAssetKeys, assetSelectionKey(asset))}
                              aria-label={`Select ${asset.plate || asset.qrId}`}
                            />
                          </td>
                          {/* Asset QR Thumbnail */}
                          <td className="py-4">
                            <div className="w-10 h-10 rounded-xl bg-tag-pill border border-tag-border flex items-center justify-center p-1.5 shadow-2xs">
                              <QrCode className="w-full h-full text-tag-brown" />
                            </div>
                          </td>

                          {/* QR Identifier & Serial */}
                          <td className="py-4">
                            <div className="font-mono font-bold text-xs text-tag-brown">
                              {asset.qrId}
                            </div>
                            <div className="text-[10px] font-mono font-bold text-tag-amber-deep">
                              {asset.serialNumber}
                            </div>
                          </td>

                          {/* Linked Order # */}
                          <td className="py-4 font-mono text-tag-brown-muted">
                            {asset.orderId}
                          </td>

                          {/* Vehicle Plate */}
                          <td className="py-4 font-mono font-bold text-tag-brown">
                            <button
                              type="button"
                              onClick={() => {
                                const matched = safeOrders.find((o) => o.orderId === asset.orderId || o.tag_id === asset.id || o.tagId === asset.id);
                                if (matched) setSelectedOrder(matched);
                              }}
                              className="px-2 py-0.5 rounded-lg border border-tag-border bg-tag-pill hover:bg-white hover:border-tag-amber text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                              title="Click to edit vehicle plate"
                            >
                              <span>{asset.plate}</span>
                              <Edit3 className="w-2.5 h-2.5 text-tag-brown-muted opacity-60" />
                            </button>
                          </td>

                          {/* Linked Customer */}
                          <td className="py-4 font-medium text-tag-brown">
                            {asset.customer}
                          </td>

                          {/* Total Scans */}
                          <td className="py-4 font-mono font-semibold text-tag-brown">
                            {asset.scans} scans
                          </td>

                          {/* Status */}
                          <td className="py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-bold border ${
                                asset.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : asset.status === 'Pending Print'
                                  ? 'bg-[#FEF5E7] text-[#975A16] border-[#FBD38D]'
                                  : 'bg-gray-100 text-gray-700 border-gray-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  asset.status === 'Active'
                                    ? 'bg-emerald-500'
                                    : asset.status === 'Pending Print'
                                    ? 'bg-amber-500'
                                    : 'bg-gray-400'
                                }`}
                              />
                              <span>{asset.status}</span>
                            </span>
                          </td>

                          {/* Actions matching Image 3 */}
                          <td className="py-4 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link
                                to="/scan"
                                target="_blank"
                                className="px-2.5 py-1 rounded-lg border border-tag-border bg-tag-card hover:bg-tag-pill text-xs font-bold text-tag-brown flex items-center gap-1 transition-colors"
                              >
                                <span>Scan</span>
                              </Link>

                              <button
                                type="button"
                                onClick={() => showToast(`Regenerated cryptographic token for ${asset.qrId}`)}
                                className="px-2.5 py-1 rounded-lg border border-tag-border bg-tag-card hover:bg-tag-pill text-xs font-bold text-tag-brown flex items-center gap-1 transition-colors"
                              >
                                <RefreshCw className="w-3 h-3 text-tag-brown-light" />
                                <span>Regen</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const matched = safeOrders.find((o) => o.orderId === asset.orderId || o.tag_id === asset.id || o.tagId === asset.id);
                                  setPrintModalItem(matched || {
                                    vehicleNumber: asset.plate,
                                    customerName: asset.customer,
                                    orderId: asset.orderId,
                                    package: 'Single Tag',
                                    serialNumber: asset.serialNumber,
                                    qr_image_url: asset.qr_image_url,
                                    qr_code_value: asset.qr_code_value || asset.qrId
                                  });
                                }}
                                className="px-3 py-1 rounded-lg bg-tag-brown hover:bg-tag-brown-deep text-tag-bg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                              >
                                <Printer className="w-3 h-3 text-tag-amber" />
                                <span>Print Sticker</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const matched = safeOrders.find((o) => o.orderId === asset.orderId || o.tag_id === asset.id || o.tagId === asset.id);
                                  if (matched) setReassignModalOrder(matched);
                                }}
                                className="px-2.5 py-1 rounded-lg border border-tag-amber/70 bg-amber-50 hover:bg-amber-100 text-tag-amber-deep text-xs font-bold flex items-center gap-1 transition-colors shadow-2xs"
                                title="Reassign QR tag to a new customer or vehicle"
                              >
                                <RotateCcw className="w-3 h-3 text-tag-amber-deep" />
                                <span>Reassign</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => downloadStickers([
                                  safeOrders.find((order) => order.orderId === asset.orderId || order.tag_id === asset.id || order.tagId === asset.id) || {
                                    vehicleNumber: asset.plate,
                                    qr_code_value: asset.qr_code_value || asset.qrId,
                                    serialNumber: asset.serialNumber
                                  }
                                ])}
                                className="px-2.5 py-1 rounded-lg border border-tag-border bg-tag-card hover:bg-tag-pill text-xs font-bold text-tag-brown flex items-center gap-1 transition-colors"
                              >
                                <Download className="w-3 h-3 text-tag-brown-light" />
                                <span>Download sticker</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: DASHBOARD (FULFILLMENT OVERVIEW) */}
          {/* ======================================================== */}
          {activeNav === 'dashboard' && (
            <div className="flex flex-col gap-8 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col">
                  <h1 className="font-baloo font-extrabold text-2xl sm:text-3xl text-tag-brown tracking-tight">
                    Fulfillment Overview
                  </h1>
                  <p className="text-xs text-tag-brown-muted font-medium mt-1">
                    Operational status and physical tag queue metrics
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveNav('orders');
                      setStatusFilter('Pending');
                    }}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-tag-brown text-tag-bg hover:bg-tag-brown-deep transition-colors flex items-center gap-2 shadow-xs"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-tag-amber" />
                    <span>Process New ({newCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveNav('orders');
                      setStatusFilter('Printing');
                    }}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#FEF5E7] text-[#975A16] border border-[#FBD38D] hover:bg-[#FDEED9] transition-colors"
                  >
                    Printing Queue ({printingCount})
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveNav('orders');
                      setStatusFilter('ALL');
                    }}
                    className="px-4 py-1.5 rounded-full text-xs font-bold bg-tag-pill text-tag-brown border border-tag-border hover:bg-tag-card transition-colors flex items-center gap-1"
                  >
                    <span>All Orders</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* 5 KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-tag-card rounded-2xl border border-tag-border p-5 shadow-warm-sm flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-tag-brown-muted">
                      TOTAL ORDERS
                    </span>
                    <div className="w-7 h-7 rounded-full bg-tag-pill border border-tag-border flex items-center justify-center text-tag-brown">
                      <Package className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-baloo font-extrabold text-3xl text-tag-brown tracking-tight">
                      {totalOrdersCount}
                    </span>
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      +17% from last week
                    </span>
                  </div>
                </div>

                <div className="bg-tag-card rounded-2xl border border-tag-border p-5 shadow-warm-sm flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-tag-brown-muted">
                      NEW / UNPROCESSED
                    </span>
                    <div className="w-7 h-7 rounded-full bg-tag-pill border border-tag-border flex items-center justify-center text-tag-brown">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-baloo font-extrabold text-3xl text-tag-brown tracking-tight">
                      {newCount}
                    </span>
                    <span className="text-xs text-tag-brown-light font-bold flex items-center gap-1 mt-1">
                      <span>↗</span> Requires QR verification
                    </span>
                  </div>
                </div>

                <div className="bg-tag-card rounded-2xl border border-tag-border p-5 shadow-warm-sm flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-tag-brown-muted">
                      IN PRINTING & UV
                    </span>
                    <div className="w-7 h-7 rounded-full bg-[#FEF5E7] border border-[#FBD38D] flex items-center justify-center text-[#975A16]">
                      <Printer className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-baloo font-extrabold text-3xl text-tag-brown tracking-tight">
                      {printingCount}
                    </span>
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-1">
                      <span>↗</span> Sent to production queue
                    </span>
                  </div>
                </div>

                <div className="bg-tag-card rounded-2xl border border-tag-border p-5 shadow-warm-sm flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-tag-brown-muted">
                      DISPATCHED / SHIPPED
                    </span>
                    <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
                      <Truck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-baloo font-extrabold text-3xl text-tag-brown tracking-tight">
                      {shippedCount}
                    </span>
                    <span className="text-xs text-blue-700 font-bold flex items-center gap-1 mt-1">
                      <span>↗</span> In transit with courier
                    </span>
                  </div>
                </div>

                <div className="bg-tag-card rounded-2xl border border-tag-border p-5 shadow-warm-sm flex flex-col justify-between gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-tag-brown-muted">
                      GROSS REVENUE
                    </span>
                    <div className="w-7 h-7 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs">
                      ₨
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-baloo font-extrabold text-2xl sm:text-[26px] text-tag-brown tracking-tight">
                      PKR {grossRevenuePkr.toLocaleString()}
                    </span>
                    <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-1">
                      <span>↗</span> Completed sales
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: WORKSHOP SETTINGS */}
          {/* ======================================================== */}
          {activeNav === 'settings' && (
            <div className="flex flex-col gap-6 max-w-2xl animate-fadeIn">
              <h1 className="font-baloo font-extrabold text-2xl sm:text-3xl text-tag-brown tracking-tight">
                Workshop & Store Settings
              </h1>
              <div className="bg-tag-card rounded-2xl border border-tag-border p-6 shadow-warm-sm flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-tag-brown-muted block mb-1">Workshop Location</label>
                  <input
                    type="text"
                    readOnly
                    defaultValue="208 Chak Road, West Canal Road, Faisalabad, Pakistan"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-bg text-xs font-semibold text-tag-brown"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-tag-brown-muted block mb-1">Raast ID (Direct Pay)</label>
                  <input
                    type="text"
                    readOnly
                    defaultValue="tagtique@mcb"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-bg text-xs font-mono font-bold text-tag-brown"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-tag-brown-muted block mb-1">Meezan IBAN</label>
                  <input
                    type="text"
                    readOnly
                    defaultValue="PK36MEZN0001234567890123"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-bg text-xs font-mono font-bold text-tag-brown"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-tag-brown-muted block mb-1">Official WhatsApp Hotline</label>
                  <input
                    type="text"
                    readOnly
                    defaultValue="0329-2082080"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-tag-border bg-tag-bg text-xs font-mono font-bold text-tag-brown"
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* QUICK SEARCH PALETTE (CTRL+K) */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 z-50 bg-tag-brown-deep/50 backdrop-blur-xs flex items-start justify-center pt-24 px-4">
          <div className="bg-tag-card rounded-3xl border border-tag-border shadow-warm-lg max-w-lg w-full overflow-hidden animate-fadeIn">
            <div className="p-4 border-b border-tag-border flex items-center gap-3">
              <Search className="w-4 h-4 text-tag-brown-light" />
              <input
                type="text"
                autoFocus
                placeholder="Search orders, plates, customers..."
                className="w-full text-sm outline-none text-tag-brown bg-transparent font-semibold"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setIsSearchModalOpen(false)}
                className="p-1 rounded-lg text-tag-brown-muted hover:text-tag-brown hover:bg-tag-pill"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-tag-border/40 p-2">
              {filteredOrders.slice(0, 6).map((order) => (
                <div
                  key={order.orderId}
                  onClick={() => {
                    setSelectedOrder(order);
                    setIsSearchModalOpen(false);
                  }}
                  className="p-3 rounded-2xl hover:bg-tag-pill cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-tag-brown">{order.orderId} · {order.customerName}</span>
                    <span className="text-[11px] text-tag-brown-muted">{order.vehicleNumber} · {order.package}</span>
                  </div>
                  <span className="font-mono font-bold text-tag-brown">PKR {order.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PRINT STICKER MODAL */}
      {printModalItem && (
        <div className="fixed inset-0 z-50 bg-tag-brown-deep/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-tag-card rounded-3xl border border-tag-border shadow-warm-lg max-w-md w-full p-6 flex flex-col gap-5 animate-fadeIn">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-tag-border pb-3 no-print">
              <div className="flex items-center gap-2.5">
                <Printer className="w-5 h-5 text-tag-amber" />
                <div>
                  <h3 className="font-baloo font-extrabold text-lg text-tag-brown">
                    Vehicle Sticker Print Ready
                  </h3>
                  <p className="text-[11px] text-tag-brown-muted font-medium">
                    Physical decal with micro-serial for Supabase dynamic remapping
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPrintModalItem(null)}
                className="p-1.5 rounded-full text-tag-brown-muted hover:text-tag-brown hover:bg-tag-pill"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actual Printable Physical Sticker Card */}
            <div className="print-sticker-container w-full max-w-[340px] mx-auto px-5 pt-8 pb-6 rounded-3xl bg-[#FDF7EC] flex flex-col items-center text-center gap-5 shadow-warm-md select-none">
              <div className="flex flex-col items-center gap-2 px-1">
                <p dir="rtl" className="font-extrabold text-[26px] leading-snug text-[#2E1B10]" style={{ fontFamily: '"Noto Sans Arabic", "Segoe UI", sans-serif' }}>
                  اسکین کریں، رابطہ کریں
                </p>
                <p className="font-extrabold text-[22px] leading-tight text-[#2E1B10] tracking-tight">
                  Scan to Contact Driver
                </p>
              </div>

              <div className="w-full bg-[#FDF7EC] rounded-2xl p-2 flex items-center justify-center">
                {printQrDataUrl ? (
                  <img
                    src={printQrDataUrl}
                    alt="Scan QR"
                    className="w-full h-auto object-contain select-none"
                  />
                ) : (
                  <QrCode className="w-40 h-40 text-[#F5B21F] animate-pulse" />
                )}
              </div>
            </div>

            {/* Informative Supabase dynamic remapping notice banner */}
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-xs flex flex-col gap-1 no-print">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Dynamic Supabase Remapping</span>
              </div>
              <p className="text-[11px] text-amber-950/80 leading-relaxed">
                The physical sticker displays serial <strong className="font-mono">{printModalItem.serialNumber || `SN-${printModalItem.rawId}`}</strong> in micro-print. You can update the vehicle plate, owner name, or emergency contact anytime in Supabase, and this printed sticker will immediately reflect the new data.
              </p>
            </div>

            {/* Print Modal Footer Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-tag-border no-print flex-wrap">
              <button
                type="button"
                onClick={() => setPrintModalItem(null)}
                className="px-4 py-2 rounded-full border border-tag-border text-xs font-bold text-tag-brown hover:bg-tag-pill"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                {printQrDataUrl && (
                  <button
                    type="button"
                    onClick={() => downloadStickers([printModalItem])}
                    className="px-3.5 py-2 rounded-full border border-tag-border bg-tag-card hover:bg-tag-pill text-xs font-bold text-tag-brown flex items-center gap-1.5 shadow-2xs"
                  >
                    <Download className="w-3.5 h-3.5 text-tag-brown-light" />
                    <span>Download sticker</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    showToast('Sticker sent to printer queue');
                  }}
                  className="amber-gradient-btn px-5 py-2 rounded-full text-xs font-extrabold text-tag-brown flex items-center gap-1.5 shadow-warm-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Sticker Now</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / VIEW ORDER INSPECTOR MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-tag-brown-deep/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-tag-card rounded-3xl border border-tag-border shadow-warm-lg max-w-lg w-full p-6 flex flex-col gap-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-tag-border pb-3">
              <div className="flex items-center gap-2.5">
                <Package className="w-5 h-5 text-tag-amber" />
                <div>
                  <h3 className="font-baloo font-extrabold text-lg text-tag-brown">
                    Order {selectedOrder.orderId}
                  </h3>
                  <span className="text-xs text-tag-brown-muted font-mono">{selectedOrder.date}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full text-tag-brown-muted hover:text-tag-brown hover:bg-tag-pill"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveOrder} className="flex flex-col gap-4">
              {/* Status Selector */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-tag-bg border border-tag-border flex-wrap gap-2">
                <span className="text-xs font-bold text-tag-brown">Order Status:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {['Pending', 'Printing', 'Shipped', 'Delivered'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditForm((prev) => ({ ...prev, status: st }))}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        editForm.status === st
                          ? 'bg-tag-brown text-tag-bg shadow-warm-sm'
                          : 'bg-tag-card border border-tag-border text-tag-brown hover:bg-tag-pill'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Number & Vehicle Type */}
              <div className="p-4 rounded-2xl bg-[#FFFDF8] border-2 border-tag-amber/50 shadow-warm-sm flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-tag-brown flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-tag-amber" />
                    <span>Vehicle & Tag Details</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-tag-amber-deep">
                    {selectedOrder.package}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-tag-brown block mb-1">
                      Vehicle Number / Plate <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={editForm.vehicleNumber}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, vehicleNumber: e.target.value.toUpperCase() }))}
                      placeholder="e.g. LEC 900"
                      required
                      className="w-full px-3 py-2 rounded-xl border-2 border-tag-amber/60 bg-white font-mono font-extrabold text-sm text-tag-brown outline-none focus:border-tag-amber focus:ring-2 focus:ring-tag-amber/20 uppercase tracking-wider shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-tag-brown block mb-1">
                      Vehicle Type
                    </label>
                    <select
                      value={editForm.vehicleType}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, vehicleType: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-bold text-xs text-tag-brown outline-none focus:border-tag-amber shadow-2xs"
                    >
                      <option value="Car">Car</option>
                      <option value="Motorcycle">Motorcycle</option>
                      <option value="Van">Van</option>
                      <option value="Truck">Truck</option>
                      <option value="SUV">SUV</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Physical Tag Serial & Supabase Key */}
              <div className="p-3.5 rounded-2xl bg-tag-pill/70 border border-tag-border flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-tag-brown flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-tag-amber" />
                    <span>Physical Sticker Serial & Supabase Key</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                    Dynamic Remapping
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-tag-border flex items-center justify-between">
                    <span className="text-tag-brown-muted font-medium text-[11px]">Printed Serial No:</span>
                    <span className="font-mono font-black text-xs text-tag-amber-deep">
                      {selectedOrder.serialNumber || `SN-${selectedOrder.rawId}`}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-tag-border flex items-center justify-between">
                    <span className="text-tag-brown-muted font-medium text-[11px]">Supabase Tag ID:</span>
                    <span className="font-mono font-bold text-[11px] text-tag-brown truncate max-w-[130px]" title={selectedOrder.tag_id || selectedOrder.tagId}>
                      {selectedOrder.tag_id ? selectedOrder.tag_id.slice(0, 10) + '...' : selectedOrder.rawId}
                    </span>
                  </div>
                </div>

                <p className="text-[10.5px] text-tag-brown-muted leading-tight">
                  This serial is printed in micro-font on the physical sticker. Any updates you save here or in Supabase take effect immediately on the existing physical tag without reprinting.
                </p>

                <div className="pt-1 flex items-center justify-between border-t border-tag-border/50">
                  <span className="text-[10px] text-tag-brown-muted font-medium">Customer requested tag reassignment?</span>
                  <button
                    type="button"
                    onClick={() => {
                      const target = selectedOrder;
                      setSelectedOrder(null);
                      setReassignModalOrder(target);
                    }}
                    className="text-xs font-bold text-tag-amber-deep hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reassign QR Details</span>
                  </button>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="p-4 rounded-2xl bg-tag-bg border border-tag-border flex flex-col gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-tag-brown-muted">
                  Customer & Contact Information
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-tag-brown-muted block mb-1">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      value={editForm.customerName}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, customerName: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-bold text-xs text-tag-brown outline-none focus:border-tag-amber shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-tag-brown-muted block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editForm.phoneNumber}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-mono text-xs text-tag-brown outline-none focus:border-tag-amber shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-tag-brown-muted block mb-1">
                      Guardian / Emergency #
                    </label>
                    <input
                      type="text"
                      value={editForm.guardianNumber}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, guardianNumber: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-mono text-xs text-tag-brown outline-none focus:border-tag-amber shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-tag-brown-muted block mb-1">
                      Total Order Amount
                    </label>
                    <div className="px-3 py-2 rounded-xl border border-tag-border bg-tag-pill font-mono font-bold text-xs text-tag-amber-deep">
                      PKR {Number(selectedOrder.amount || selectedOrder.total_amount || 1499).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-tag-border flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href={`https://wa.me/${String(editForm.phoneNumber || selectedOrder.phoneNumber || '').replace(/\D/g, '')}?text=Hello%20${encodeURIComponent(editForm.customerName || selectedOrder.customerName)},%20your%20Tagtique%20order%20${selectedOrder.orderId}%20is%20${editForm.status}!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDeleteOrder(selectedOrder)}
                    className="px-3.5 py-2 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    <span>Delete</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const target = { ...selectedOrder, vehicleNumber: editForm.vehicleNumber, customerName: editForm.customerName };
                      setSelectedOrder(null);
                      setPrintModalItem(target);
                    }}
                    className="px-3.5 py-2 rounded-full border border-tag-border text-xs font-bold text-tag-brown hover:bg-tag-pill flex items-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5 text-tag-amber" />
                    <span>Print</span>
                  </button>

                  <button
                    type="submit"
                    className="amber-gradient-btn px-5 py-2 rounded-full text-xs font-extrabold text-tag-brown flex items-center gap-1.5 shadow-warm-sm"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ======================================================== */}
      {/* GENERATE NEW QR TAG MODAL */}
      {/* ======================================================== */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 bg-tag-brown-deep/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-tag-card rounded-3xl border border-tag-border shadow-warm-lg max-w-lg w-full p-6 flex flex-col gap-5 animate-fadeIn max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-tag-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 border border-amber-300/80 flex items-center justify-center text-tag-amber-deep">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-baloo font-extrabold text-lg text-tag-brown leading-tight">
                    Generate New QR Tag
                  </h3>
                  <p className="text-[11px] text-tag-brown-muted font-medium">
                    Create pre-printed inventory stock or generate a live tag for a customer on demand
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(false)}
                className="p-1.5 rounded-full text-tag-brown-muted hover:text-tag-brown hover:bg-tag-pill"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-tag-pill/80 border border-tag-border">
              <button
                type="button"
                onClick={() => setGenerateForm((p) => ({ ...p, type: 'unassigned' }))}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                  generateForm.type === 'unassigned'
                    ? 'bg-tag-brown text-tag-bg shadow-warm-sm'
                    : 'text-tag-brown hover:bg-white/60'
                }`}
              >
                📦 Pre-Printed Stock (Blank Tag)
              </button>

              <button
                type="button"
                onClick={() => setGenerateForm((p) => ({ ...p, type: 'custom' }))}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                  generateForm.type === 'custom'
                    ? 'bg-tag-brown text-tag-bg shadow-warm-sm'
                    : 'text-tag-brown hover:bg-white/60'
                }`}
              >
                👤 Issue On-Demand (With Details)
              </button>
            </div>

            <form onSubmit={handleGenerateTag} className="flex flex-col gap-4">
              {generateForm.type === 'unassigned' ? (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col gap-2.5 text-xs text-amber-950">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <Shield className="w-4 h-4 text-amber-600" />
                    <span>Instant Blank Stock Tag Generation</span>
                  </div>
                  <p className="text-[11.5px] leading-relaxed text-amber-900/90">
                    This generates a unique cryptographic QR token and Serial Number in Supabase. You can print the physical sticker immediately for your inventory drawer. When a customer orders or demands later, you can click <strong>Reassign</strong> to link their vehicle and phone number in seconds.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2 rounded-xl bg-white border border-amber-200">
                      <span className="text-amber-700/80 block text-[10px]">Default Plate:</span>
                      <strong className="text-tag-brown">STOCK-###</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-white border border-amber-200">
                      <span className="text-amber-700/80 block text-[10px]">Status:</span>
                      <strong className="text-amber-800">Pending Assignment</strong>
                    </div>
                  </div>

                  {/* Quantity selector for batch generation */}
                  <div className="flex flex-col gap-1.5 pt-2 border-t border-amber-200/80">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-amber-950">
                        Batch Quantity to Generate:
                      </label>
                      <span className="font-mono font-black text-xs text-tag-amber-deep">
                        {generateForm.quantity} Tags
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[1, 5, 10, 20, 50, 120].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setGenerateForm((p) => ({ ...p, quantity: preset }))}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold font-mono transition-all ${
                            generateForm.quantity === preset
                              ? 'bg-tag-amber text-tag-brown shadow-warm-sm border border-tag-amber-deep'
                              : 'bg-white border border-tag-border text-tag-brown hover:bg-tag-pill'
                          }`}
                        >
                          {preset === 120 ? '⭐ 120 Pack' : `${preset}x`}
                        </button>
                      ))}
                      <div className="flex items-center gap-1 ml-auto">
                        <span className="text-[10px] text-amber-900/80 font-medium">Custom:</span>
                        <input
                          type="number"
                          min="1"
                          max="150"
                          value={generateForm.quantity}
                          onChange={(e) =>
                            setGenerateForm((p) => ({
                              ...p,
                              quantity: Math.max(1, Math.min(150, parseInt(e.target.value) || 1))
                            }))
                          }
                          className="w-16 px-2 py-1 rounded-xl border border-tag-border bg-white text-xs font-mono font-bold text-tag-brown text-center outline-none focus:border-tag-amber"
                          title="Custom Quantity (up to 150)"
                        />
                      </div>
                    </div>
                    <p className="text-[10.5px] text-amber-900/80 italic mt-0.5">
                      Each generated tag gets its own unique serial number (e.g. SN-...), unique cryptographic token, and separate database record so you can reassign any tag individually later!
                    </p>
                  </div>
                </div>
              ) : (
                /* Customer on demand fields */
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-tag-brown block mb-1">
                        Vehicle Number / Plate <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. LEC 900"
                        value={generateForm.vehicleNumber}
                        onChange={(e) => setGenerateForm((p) => ({ ...p, vehicleNumber: e.target.value.toUpperCase() }))}
                        className="w-full px-3 py-2 rounded-xl border-2 border-tag-amber/60 bg-white font-mono font-extrabold text-sm text-tag-brown outline-none focus:border-tag-amber uppercase tracking-wider"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-tag-brown block mb-1">
                        Vehicle Type
                      </label>
                      <select
                        value={generateForm.vehicleType}
                        onChange={(e) => setGenerateForm((p) => ({ ...p, vehicleType: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-bold text-xs text-tag-brown outline-none focus:border-tag-amber"
                      >
                        <option value="Car">Car</option>
                        <option value="Motorcycle">Motorcycle</option>
                        <option value="Van">Van</option>
                        <option value="Truck">Truck</option>
                        <option value="SUV">SUV</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-tag-brown block mb-1">
                        Customer Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Ahmad Shahab"
                        value={generateForm.customerName}
                        onChange={(e) => setGenerateForm((p) => ({ ...p, customerName: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-bold text-xs text-tag-brown outline-none focus:border-tag-amber"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-tag-brown block mb-1">
                        Customer Phone Number
                      </label>
                      <input
                        type="text"
                        placeholder="0300-1234567"
                        value={generateForm.phoneNumber}
                        onChange={(e) => setGenerateForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-mono text-xs text-tag-brown outline-none focus:border-tag-amber"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-tag-brown block mb-1">
                      Guardian / Emergency Contact #
                    </label>
                    <input
                      type="text"
                      placeholder="0300-7654321"
                      value={generateForm.guardianNumber}
                      onChange={(e) => setGenerateForm((p) => ({ ...p, guardianNumber: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-mono text-xs text-tag-brown outline-none focus:border-tag-amber"
                    />
                  </div>
                </div>
              )}

              {/* Tag Material & Package */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-tag-brown block mb-1">
                    Tag Material
                  </label>
                  <select
                    value={generateForm.tagMaterial}
                    onChange={(e) => setGenerateForm((p) => ({ ...p, tagMaterial: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-bold text-xs text-tag-brown outline-none focus:border-tag-amber"
                  >
                    <option value="vinyl">Vinyl Sticker Tag</option>
                    <option value="acrylic">Acrylic Luxury Shield</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-tag-brown block mb-1">
                    Package Type
                  </label>
                  <select
                    value={generateForm.packageType}
                    onChange={(e) => setGenerateForm((p) => ({ ...p, packageType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-bold text-xs text-tag-brown outline-none focus:border-tag-amber"
                  >
                    <option value="Single Tag">Single Tag</option>
                    <option value="Pack of 2">Pack of 2</option>
                    <option value="Family Pack">Family Pack</option>
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-tag-border">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-tag-border text-xs font-bold text-tag-brown hover:bg-tag-pill"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="amber-gradient-btn px-5 py-2 rounded-full text-xs font-extrabold text-tag-brown flex items-center gap-1.5 shadow-warm-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>
                    {generateForm.type === 'unassigned' && generateForm.quantity > 1
                      ? `Generate Batch (${generateForm.quantity} QR Tags)`
                      : 'Generate QR & Save to Supabase'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* REASSIGN QR TAG DETAILS MODAL */}
      {/* ======================================================== */}
      {reassignModalOrder && (
        <div className="fixed inset-0 z-50 bg-tag-brown-deep/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-tag-card rounded-3xl border border-tag-border shadow-warm-lg max-w-lg w-full p-6 flex flex-col gap-5 animate-fadeIn max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-tag-border pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-tag-amber-deep">
                  <RotateCcw className="w-5 h-5 text-tag-amber-deep" />
                </div>
                <div>
                  <h3 className="font-baloo font-extrabold text-lg text-tag-brown leading-tight">
                    Reassign QR Tag Details
                  </h3>
                  <p className="text-[11px] text-tag-brown-muted font-medium">
                    Link existing physical sticker to a new customer, vehicle plate, or emergency contact on demand
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReassignModalOrder(null)}
                className="p-1.5 rounded-full text-tag-brown-muted hover:text-tag-brown hover:bg-tag-pill"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Tag Identity Bar */}
            <div className="p-3.5 rounded-2xl bg-tag-pill/80 border border-tag-border flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex flex-col">
                <span className="text-[10px] text-tag-brown-muted font-bold uppercase tracking-wider">
                  Physical Sticker Serial:
                </span>
                <span className="font-mono font-black text-sm text-tag-amber-deep">
                  {reassignModalOrder.serialNumber || `SN-${reassignModalOrder.rawId}`}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-tag-brown-muted font-bold uppercase tracking-wider">
                  Current Plate:
                </span>
                <span className="font-mono font-bold text-xs text-tag-brown">
                  {reassignModalOrder.vehicleNumber || 'UNASSIGNED'}
                </span>
              </div>

              <div className="flex flex-col text-right">
                <span className="text-[10px] text-tag-brown-muted font-bold uppercase tracking-wider">
                  Order Reference:
                </span>
                <span className="font-mono font-bold text-xs text-tag-brown">
                  {reassignModalOrder.orderId}
                </span>
              </div>
            </div>

            <form onSubmit={handleReassignTag} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-tag-brown block mb-1">
                    New / Assigned Customer Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reassignForm.customerName}
                    onChange={(e) => setReassignForm((p) => ({ ...p, customerName: e.target.value }))}
                    placeholder="e.g. Usman Ali"
                    className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-bold text-xs text-tag-brown outline-none focus:border-tag-amber shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-tag-brown block mb-1">
                    New Vehicle Plate Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={reassignForm.vehicleNumber}
                    onChange={(e) => setReassignForm((p) => ({ ...p, vehicleNumber: e.target.value.toUpperCase() }))}
                    placeholder="e.g. LEC 900"
                    className="w-full px-3 py-2 rounded-xl border-2 border-tag-amber/60 bg-white font-mono font-extrabold text-sm text-tag-brown outline-none focus:border-tag-amber uppercase tracking-wider shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-tag-brown block mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={reassignForm.vehicleType}
                    onChange={(e) => setReassignForm((p) => ({ ...p, vehicleType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-bold text-xs text-tag-brown outline-none focus:border-tag-amber shadow-2xs"
                  >
                    <option value="Car">Car</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                    <option value="SUV">SUV</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-tag-brown block mb-1">
                    Tag Status
                  </label>
                  <select
                    value={reassignForm.status}
                    onChange={(e) => setReassignForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-bold text-xs text-tag-brown outline-none focus:border-tag-amber shadow-2xs"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Printing">Printing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-tag-brown block mb-1">
                    Customer Phone Number
                  </label>
                  <input
                    type="text"
                    value={reassignForm.phoneNumber}
                    onChange={(e) => setReassignForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-mono text-xs text-tag-brown outline-none focus:border-tag-amber shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-tag-brown block mb-1">
                    Guardian / Emergency #
                  </label>
                  <input
                    type="text"
                    value={reassignForm.guardianNumber}
                    onChange={(e) => setReassignForm((p) => ({ ...p, guardianNumber: e.target.value }))}
                    placeholder="0300-7654321"
                    className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-mono text-xs text-tag-brown outline-none focus:border-tag-amber shadow-2xs"
                  />
                </div>
              </div>

              {/* Security & Token Regeneration Toggle */}
              <div className="p-3 rounded-2xl bg-tag-bg border border-tag-border flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="regenTokenCheck"
                  checked={reassignForm.regenerateQrToken}
                  onChange={(e) => setReassignForm((p) => ({ ...p, regenerateQrToken: e.target.checked }))}
                  className="mt-0.5 w-4 h-4 rounded text-tag-amber accent-tag-amber cursor-pointer"
                />
                <label htmlFor="regenTokenCheck" className="text-xs cursor-pointer select-none">
                  <strong className="text-tag-brown block font-bold">
                    Regenerate Fresh QR Token & Scan URL
                  </strong>
                  <span className="text-[11px] text-tag-brown-muted">
                    Enable only if the customer lost their tag or requires a newly scrambled cryptographic QR code. (Leave unchecked to keep the physical sticker scannable as-is).
                  </span>
                </label>
              </div>

              {/* Informative Supabase dynamic remapping notice */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs flex flex-col gap-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <Shield className="w-3.5 h-3.5 text-amber-600" />
                  <span>Dynamic Supabase Synchronization</span>
                </div>
                <p className="text-[11px] text-amber-900/90 leading-tight">
                  The physical sticker with serial <strong className="font-mono">{reassignModalOrder.serialNumber || `SN-${reassignModalOrder.rawId}`}</strong> will immediately connect any future scans or caller relays to this newly assigned customer and vehicle.
                </p>
              </div>

              {/* Footer buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-tag-border gap-3">
                <button
                  type="button"
                  onClick={() => setReassignModalOrder(null)}
                  className="px-4 py-2 rounded-full border border-tag-border text-xs font-bold text-tag-brown hover:bg-tag-pill"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="amber-gradient-btn px-5 py-2 rounded-full text-xs font-extrabold text-tag-brown flex items-center gap-1.5 shadow-warm-sm"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Confirm & Reassign QR</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QR SCANNER & TAG INSPECTOR MODAL */}
      {/* ======================================================== */}
      <QRScannerModal
        isOpen={isScannerModalOpen}
        onClose={() => setIsScannerModalOpen(false)}
        orders={safeOrders}
        onUpdateOrder={(updatedOrder) => {
          setOrders((prev) => {
            const safePrev = Array.isArray(prev) ? prev : [];
            const updated = safePrev.map((o) => {
              const matchTag = updatedOrder.tag_id && o.tag_id === updatedOrder.tag_id;
              const matchOrder = o.orderId === updatedOrder.orderId || o.order_number === updatedOrder.order_number;
              if (matchTag || matchOrder) {
                return { ...o, ...updatedOrder };
              }
              return o;
            });
            try {
              localStorage.setItem('tagtique_admin_v3_orders', JSON.stringify(updated));
            } catch (_) {}
            return updated;
          });
          showToast(`Reassigned ${updatedOrder.vehicleNumber || updatedOrder.serialNumber}`);
        }}
        onPrintTag={(tag) => {
          setPrintModalItem(tag);
        }}
        onTagSelected={(tag) => {
          const plate = tag.vehicleNumber || tag.vehicle_number || '';
          const serial = tag.serialNumber || tag.serial_number || '';
          if (plate && !plate.includes('UNASSIGNED')) {
            setSearchQuery(plate);
          } else if (serial) {
            setSearchQuery(serial);
          }
        }}
      />
    </div>
  );
}
