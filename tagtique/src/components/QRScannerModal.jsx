import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode,
  Search,
  Upload,
  Camera,
  X,
  CheckCircle2,
  RotateCcw,
  Printer,
  ExternalLink,
  Copy,
  Check,
  Phone,
  Shield,
  Zap,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Save,
  Car,
  ChevronRight,
  Sliders,
  Scan,
  Radio
} from 'lucide-react';
import { orderBackendService } from '../services/orderBackendService';

export default function QRScannerModal({
  isOpen,
  onClose,
  orders = [],
  onUpdateOrder,
  onPrintTag,
  onTagSelected
}) {
  // Default to 'scanner' (Hardware Scanner Gun & Direct Lookup) instead of camera!
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'file' | 'camera'
  const [manualQuery, setManualQuery] = useState('');
  const [inventorySearch, setInventorySearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [scannedTag, setScannedTag] = useState(null);
  const [copiedSerial, setCopiedSerial] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);

  // In-Panel Direct Edit & Reassign state
  const [editForm, setEditForm] = useState({
    customerName: '',
    vehicleNumber: '',
    vehicleType: 'Car',
    phoneNumber: '',
    guardianNumber: '',
    status: 'Pending',
    regenerateQrToken: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const inputRef = useRef(null);
  const html5QrCodeRef = useRef(null);
  const scannerContainerId = 'tagtique-qr-reader-viewport';

  // Synchronize editForm whenever a tag is recognized/selected
  useEffect(() => {
    if (scannedTag) {
      setEditForm({
        customerName: scannedTag.customerName || scannedTag.customer_name || '',
        vehicleNumber: scannedTag.vehicleNumber || scannedTag.vehicle_number || '',
        vehicleType: scannedTag.vehicleType || scannedTag.vehicle_type || 'Car',
        phoneNumber: scannedTag.phoneNumber || scannedTag.phone_number || '',
        guardianNumber: scannedTag.guardianNumber || scannedTag.guardian_number || '',
        status: scannedTag.status || 'Pending',
        regenerateQrToken: false
      });
      setSaveSuccessMsg('');
    }
  }, [scannedTag]);

  // Auto-focus the scanner input when modal opens or after resetting
  useEffect(() => {
    if (isOpen && !scannedTag && activeTab === 'scanner') {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, scannedTag, activeTab]);

  // Global listener for USB / Bluetooth handheld barcode scanner guns
  useEffect(() => {
    if (!isOpen || scannedTag) return;

    let buffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e) => {
      // If user is already typing in an input element, let the input handle it
      if (document.activeElement && document.activeElement.tagName === 'INPUT') {
        return;
      }

      const currentTime = Date.now();
      // Hardware scanners typically type characters very quickly (< 100ms per character)
      if (currentTime - lastKeyTime > 150) {
        buffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (buffer.length >= 2) {
          e.preventDefault();
          handleDecodedResult(buffer.trim());
          buffer = '';
        }
      } else if (e.key.length === 1) {
        buffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, scannedTag]);

  // Audio chime & haptic feedback on recognition
  const playRecognitionChime = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.12); // C6

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch (_) {}

    try {
      if (navigator.vibrate) {
        navigator.vibrate([60, 40, 60]);
      }
    } catch (_) {}
  };

  // Optional Camera Handling (only if user explicitly clicks Camera tab)
  useEffect(() => {
    if (isOpen && activeTab === 'camera' && !scannedTag) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab, scannedTag]);

  const startCamera = async (forceDeviceId = null) => {
    setCameraError('');
    await stopCamera();

    const container = document.getElementById(scannerContainerId);
    if (!container) return;

    try {
      let camDevices = cameras;
      if (!camDevices || camDevices.length === 0) {
        try {
          camDevices = await Html5Qrcode.getCameras();
          if (camDevices && camDevices.length > 0) {
            setCameras(camDevices);
          }
        } catch (_) {}
      }

      const html5QrCode = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = html5QrCode;

      let cameraConfig;
      const targetId = forceDeviceId || selectedCameraId;
      if (targetId) {
        cameraConfig = { deviceId: { exact: targetId } };
      } else if (camDevices && camDevices.length > 0) {
        cameraConfig = { deviceId: { exact: camDevices[0].id } };
      } else {
        cameraConfig = { facingMode: 'user' };
      }

      await html5QrCode.start(
        cameraConfig,
        { fps: 15, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          handleDecodedResult(decodedText);
        },
        () => {}
      );
      setIsCameraActive(true);
    } catch (err) {
      console.warn('Camera error:', err);
      setIsCameraActive(false);
      setCameraError('No webcam found or permission was denied.');
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (_) {}
      html5QrCodeRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Process decoded QR or query string
  const handleDecodedResult = async (rawInput) => {
    if (!rawInput) return;
    playRecognitionChime();
    stopCamera();
    setIsSearching(true);
    setCameraError('');

    try {
      const found = await orderBackendService.lookupTagByAny(rawInput);
      if (found) {
        setScannedTag(found);
        if (onTagSelected) onTagSelected(found);
      } else {
        const q = String(rawInput).trim().toLowerCase();
        const local = orders.find((o) => {
          const vNum = (o.vehicleNumber || o.vehicle_number || '').toLowerCase();
          const sNum = (o.serialNumber || o.serial_number || '').toLowerCase();
          const qVal = (o.qr_code_value || '').toLowerCase();
          return vNum.includes(q) || sNum.includes(q) || qVal.includes(q);
        });

        if (local) {
          setScannedTag(local);
          if (onTagSelected) onTagSelected(local);
        } else {
          setCameraError(`No Tagtique record found for: "${rawInput}"`);
        }
      }
    } catch (err) {
      console.error('Scan lookup error:', err);
      setCameraError('Error retrieving tag record. Please try again.');
    } finally {
      setIsSearching(false);
      setManualQuery('');
    }
  };

  // File upload decode
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCameraError('');
    setIsSearching(true);
    try {
      const html5QrCode = new Html5Qrcode('tagtique-file-decoder-temp');
      const decodedText = await html5QrCode.scanFile(file, true);
      html5QrCode.clear();
      await handleDecodedResult(decodedText);
    } catch (err) {
      console.warn('Failed to decode image file:', err);
      setCameraError('Could not recognize any valid QR code in this image. Please upload a clearer photo.');
    } finally {
      setIsSearching(false);
    }
  };

  // Direct In-Panel Reassign & Edit Save
  const handleSaveReassign = async (e) => {
    if (e) e.preventDefault();
    if (!scannedTag) return;

    const trimmedPlate = (editForm.vehicleNumber || '').trim().toUpperCase();
    const trimmedCustomer = (editForm.customerName || '').trim();

    if (!trimmedPlate) {
      alert('Please enter a vehicle plate number.');
      return;
    }

    setIsSaving(true);
    try {
      const updates = {
        vehicle_id: scannedTag.vehicle_id || scannedTag.vehicleId,
        vehicle_number: trimmedPlate,
        vehicleNumber: trimmedPlate,
        vehicle_type: editForm.vehicleType,
        vehicleType: editForm.vehicleType,
        customer_id: scannedTag.customer_id || scannedTag.customerId,
        customer_name: trimmedCustomer,
        customerName: trimmedCustomer,
        phone_number: editForm.phoneNumber.trim(),
        phoneNumber: editForm.phoneNumber.trim(),
        guardian_number: editForm.guardianNumber.trim(),
        guardianNumber: editForm.guardianNumber.trim(),
        status: editForm.status,
        regenerateQrToken: editForm.regenerateQrToken
      };

      const result = await orderBackendService.reassignTagDetails(
        scannedTag.tag_id || scannedTag.tagId,
        updates
      );

      const updatedTag = {
        ...scannedTag,
        ...updates,
        ...(result.qr_code_value
          ? { qr_code_value: result.qr_code_value, qr_image_url: result.qr_image_url }
          : {})
      };

      setScannedTag(updatedTag);
      setSaveSuccessMsg(`✅ Tag reassigned successfully to "${trimmedPlate}" (${trimmedCustomer})!`);
      playRecognitionChime();

      if (onUpdateOrder) {
        onUpdateOrder(updatedTag);
      }
      if (onTagSelected) {
        onTagSelected(updatedTag);
      }
    } catch (err) {
      console.error('Reassign error:', err);
      alert('Failed to save reassignment to Supabase. Check connection.');
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedSerial(true);
    setTimeout(() => setCopiedSerial(false), 2000);
  };

  // Filter orders for quick click
  const filteredInventory = orders.filter((o) => {
    if (!inventorySearch) return true;
    const q = inventorySearch.toLowerCase();
    const v = (o.vehicleNumber || o.vehicle_number || '').toLowerCase();
    const c = (o.customerName || o.customer_name || '').toLowerCase();
    const s = (o.serialNumber || o.serial_number || '').toLowerCase();
    return v.includes(q) || c.includes(q) || s.includes(q);
  }).slice(0, 36);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-tag-brown-deep/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      {/* Hidden container for file scan engine */}
      <div id="tagtique-file-decoder-temp" className="hidden" />

      <div className="bg-tag-card rounded-3xl border border-tag-border shadow-warm-lg max-w-2xl w-full p-5 sm:p-6 flex flex-col gap-4 max-h-[94vh] overflow-y-auto">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-tag-border pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-tag-amber/20 border border-tag-amber/40 flex items-center justify-center text-tag-amber-deep shadow-2xs">
              <Scan className="w-5 h-5 text-tag-amber-deep" />
            </div>
            <div>
              <h3 className="font-baloo font-extrabold text-lg sm:text-xl text-tag-brown leading-tight">
                QR Scanner & Live Tag Editor
              </h3>
              <p className="text-[11px] text-tag-brown-muted font-medium">
                Scan with handheld scanner gun, type plate/serial, or pick any inventory tag to edit details
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-tag-brown-muted hover:text-tag-brown hover:bg-tag-pill transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* SCANNED / SELECTED TAG PANEL: DETAILS & DIRECT EDIT */}
        {/* ======================================================== */}
        {scannedTag ? (
          <div className="flex flex-col gap-4 animate-fadeIn">
            {/* Success Save Banner */}
            {saveSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs font-bold animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
                <span className="text-[11px] text-emerald-700 font-mono">Synced to Supabase</span>
              </div>
            )}

            {/* Top Identity Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#1C120C] to-[#2B1B10] text-[#FDF7EC] border border-tag-amber/30 shadow-warm-md flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-tag-amber/10 blur-2xl pointer-events-none" />

              <div className="flex items-start justify-between gap-3 flex-wrap">
                {/* Physical Plate Display */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-tag-amber font-black mb-1">
                    CURRENT VEHICLE PLATE
                  </span>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border-2 border-tag-amber/80 font-mono font-black text-xl sm:text-2xl tracking-wider text-tag-amber uppercase shadow-2xs">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-700 text-white font-bold tracking-normal font-sans">
                      PK
                    </span>
                    <span>{editForm.vehicleNumber || scannedTag.vehicleNumber || 'UNASSIGNED'}</span>
                  </div>
                </div>

                {/* Status & Material */}
                <div className="flex flex-col items-end gap-1.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
                      editForm.status === 'Delivered'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : editForm.status === 'Shipped'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span>{editForm.status}</span>
                  </span>

                  <span className="text-[11px] font-medium text-tag-bg/80 font-mono">
                    {editForm.vehicleType} • {scannedTag.package || 'Single Tag'}
                  </span>
                </div>
              </div>

              {/* Physical Serial & Order Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-3 border-t border-white/10 text-xs">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-white/60">
                    Physical Sticker Serial:
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-black text-tag-amber text-xs">
                      {scannedTag.serialNumber || scannedTag.serial_number || `SN-${scannedTag.rawId}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(scannedTag.serialNumber || `SN-${scannedTag.rawId}`)}
                      className="p-0.5 text-white/60 hover:text-white"
                      title="Copy Serial"
                    >
                      {copiedSerial ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-white/60">
                    Order Reference:
                  </span>
                  <span className="font-mono font-bold text-white text-xs">
                    {scannedTag.orderId || scannedTag.order_number || '#TGT-STOCK'}
                  </span>
                </div>

                <div className="flex flex-col col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-white/60">
                    QR Scan Relay:
                  </span>
                  <a
                    href={`/scan?token=${scannedTag.qr_code_value || scannedTag.qrId || 'tagtique'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[11px] text-tag-amber hover:underline truncate flex items-center gap-1"
                  >
                    <span>/scan?token=...</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
              </div>
            </div>

            {/* DIRECT IN-PANEL EDIT & REASSIGN FORM */}
            <form onSubmit={handleSaveReassign} className="p-4 sm:p-5 rounded-2xl bg-tag-pill/80 border border-tag-border flex flex-col gap-4 text-xs">
              <div className="flex items-center justify-between border-b border-tag-border pb-2.5">
                <div className="flex items-center gap-2 font-bold text-tag-brown">
                  <RotateCcw className="w-4 h-4 text-tag-amber-deep" />
                  <span className="text-xs uppercase tracking-wider font-extrabold">
                    Edit & Reassign Tag Information
                  </span>
                </div>
                <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                  Direct Supabase Write
                </span>
              </div>

              {/* Customer Name & Plate Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-tag-brown block mb-1">
                    Customer / Driver Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.customerName}
                    onChange={(e) => setEditForm((p) => ({ ...p, customerName: e.target.value }))}
                    placeholder="e.g. Ali Ahmed"
                    className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-bold text-xs text-tag-brown outline-none focus:border-tag-amber shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-tag-brown block mb-1">
                    Vehicle Plate Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.vehicleNumber}
                    onChange={(e) => setEditForm((p) => ({ ...p, vehicleNumber: e.target.value.toUpperCase() }))}
                    placeholder="e.g. LEC 900 or ICT 452"
                    className="w-full px-3 py-2 rounded-xl border-2 border-tag-amber/80 bg-white font-mono font-extrabold text-sm text-tag-brown outline-none focus:border-tag-amber uppercase tracking-wider shadow-2xs"
                  />
                </div>
              </div>

              {/* Vehicle Type, Phone, Guardian */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-tag-brown block mb-1">
                    Vehicle Type
                  </label>
                  <select
                    value={editForm.vehicleType}
                    onChange={(e) => setEditForm((p) => ({ ...p, vehicleType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-bold text-xs text-tag-brown outline-none focus:border-tag-amber shadow-2xs"
                  >
                    <option value="Car">Car</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="SUV">SUV</option>
                    <option value="Van">Van</option>
                    <option value="Truck">Truck</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-tag-brown block mb-1">
                    Customer Phone Number
                  </label>
                  <input
                    type="text"
                    value={editForm.phoneNumber}
                    onChange={(e) => setEditForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-mono text-xs text-tag-brown outline-none focus:border-tag-amber shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-tag-brown block mb-1">
                    Emergency / Guardian #
                  </label>
                  <input
                    type="text"
                    value={editForm.guardianNumber}
                    onChange={(e) => setEditForm((p) => ({ ...p, guardianNumber: e.target.value }))}
                    placeholder="0300-7654321"
                    className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-mono text-xs text-tag-brown outline-none focus:border-tag-amber shadow-2xs"
                  />
                </div>
              </div>

              {/* Status & Token Regeneration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="text-[11px] font-bold text-tag-brown block mb-1">
                    Fulfillment Status
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) => setEditForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-tag-border bg-white font-bold text-xs text-tag-brown outline-none focus:border-tag-amber shadow-2xs"
                  >
                    <option value="Pending">Pending Assignment</option>
                    <option value="Printing">Printing Sticker</option>
                    <option value="Shipped">Shipped to Driver</option>
                    <option value="Delivered">Delivered / Active</option>
                  </select>
                </div>

                <div className="pt-3 sm:pt-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="reassignRegenTokenDirect"
                    checked={editForm.regenerateQrToken}
                    onChange={(e) => setEditForm((p) => ({ ...p, regenerateQrToken: e.target.checked }))}
                    className="w-4 h-4 rounded text-tag-amber accent-tag-amber cursor-pointer"
                  />
                  <label htmlFor="reassignRegenTokenDirect" className="text-xs text-tag-brown font-semibold cursor-pointer select-none">
                    Regenerate new cryptographic QR token
                  </label>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between pt-3 border-t border-tag-border gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setScannedTag(null);
                      setActiveTab('scanner');
                    }}
                    className="px-3 py-2 rounded-xl border border-tag-border bg-white hover:bg-tag-card text-xs font-bold text-tag-brown flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-tag-brown-muted" />
                    <span>Scan Next QR Sticker</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onPrintTag) onPrintTag({ ...scannedTag, ...editForm });
                    }}
                    className="px-3.5 py-2 rounded-xl bg-tag-brown hover:bg-tag-brown-deep text-tag-bg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                    title="Print Sticker"
                  >
                    <Printer className="w-3.5 h-3.5 text-tag-amber" />
                    <span>Print Sticker</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="amber-gradient-btn px-6 py-2.5 rounded-xl text-xs font-extrabold text-tag-brown flex items-center gap-2 shadow-warm-md hover:scale-[1.02] transition-transform disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Saving to Supabase...' : 'Save & Reassign Tag'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ======================================================== */
          /* SCANNER GUN / DIRECT INPUT / INVENTORY PICKER */
          /* ======================================================== */
          <div className="flex flex-col gap-4">
            {/* Mode Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-tag-pill border border-tag-border text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setCameraError('');
                  setActiveTab('scanner');
                }}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'scanner'
                    ? 'bg-tag-brown text-tag-bg shadow-warm-sm'
                    : 'text-tag-brown hover:bg-white/60'
                }`}
              >
                <Scan className="w-3.5 h-3.5 text-tag-amber" />
                <span>Scanner Gun / Plate</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCameraError('');
                  setActiveTab('file');
                }}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'file'
                    ? 'bg-tag-brown text-tag-bg shadow-warm-sm'
                    : 'text-tag-brown hover:bg-white/60'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload QR Image</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCameraError('');
                  setActiveTab('camera');
                }}
                className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'camera'
                    ? 'bg-tag-brown text-tag-bg shadow-warm-sm'
                    : 'text-tag-brown hover:bg-white/60'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Webcam (Optional)</span>
              </button>
            </div>

            {/* TAB 1: HARDWARE SCANNER GUN & DIRECT LOOKUP (DEFAULT) */}
            {activeTab === 'scanner' && (
              <div className="flex flex-col gap-4">
                {/* Active Scanner Listening Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-tag-amber/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-tag-amber text-tag-brown flex items-center justify-center shadow-warm-sm">
                      <Scan className="w-5 h-5 animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs text-tag-brown flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>Ready for Handheld Scanner Gun or Direct Input</span>
                      </span>
                      <span className="text-[11px] text-tag-brown-muted">
                        Point USB/Bluetooth scanner gun at sticker, or type plate/serial below and hit Enter
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-white border border-tag-border text-tag-brown shadow-2xs shrink-0 hidden sm:inline">
                    AUTO-DETECT ACTIVE
                  </span>
                </div>

                {/* Direct Scanner Input Field */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-tag-brown-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      ref={inputRef}
                      id="scanner-gun-input"
                      type="text"
                      autoFocus
                      value={manualQuery}
                      onChange={(e) => setManualQuery(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleDecodedResult(manualQuery.trim());
                        }
                      }}
                      placeholder="Point scanner gun & pull trigger, or type e.g. STOCK-102 / SN-..."
                      className="w-full pl-10 pr-3.5 py-3 rounded-2xl border-2 border-tag-amber/70 bg-white font-mono font-extrabold text-sm text-tag-brown outline-none focus:border-tag-amber uppercase tracking-wider shadow-warm-sm placeholder:font-sans placeholder:font-normal placeholder:text-xs"
                    />
                  </div>

                  <button
                    type="button"
                    disabled={isSearching || !manualQuery.trim()}
                    onClick={() => handleDecodedResult(manualQuery.trim())}
                    className="amber-gradient-btn px-6 py-3 rounded-2xl text-xs font-extrabold text-tag-brown flex items-center gap-1.5 shadow-warm-sm disabled:opacity-50 shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>{isSearching ? 'Finding...' : 'Inspect & Edit'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: UPLOAD IMAGE */}
            {activeTab === 'file' && (
              <div className="flex flex-col gap-3">
                <label className="flex flex-col items-center justify-center p-8 rounded-3xl border-2 border-dashed border-tag-border hover:border-tag-amber bg-tag-pill/40 hover:bg-tag-pill/70 cursor-pointer transition-all gap-3 group">
                  <div className="w-14 h-14 rounded-2xl bg-white border border-tag-border flex items-center justify-center text-tag-amber group-hover:scale-105 transition-transform shadow-2xs">
                    <QrCode className="w-7 h-7 text-tag-amber" />
                  </div>
                  <div className="text-center">
                    <span className="font-bold text-xs sm:text-sm text-tag-brown block">
                      Click to choose or drag & drop QR image
                    </span>
                    <span className="text-[11px] text-tag-brown-muted">
                      Decodes digital sticker cut-sheets, photos, or screenshots
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* TAB 3: OPTIONAL WEBCAM */}
            {activeTab === 'camera' && (
              <div className="flex flex-col gap-3">
                <div className="relative w-full aspect-video max-h-[220px] mx-auto bg-black rounded-3xl overflow-hidden border-2 border-tag-border shadow-warm-md flex items-center justify-center">
                  <div
                    id={scannerContainerId}
                    className="w-full h-full flex items-center justify-center overflow-hidden [&_video]:object-cover [&_video]:w-full [&_video]:h-full"
                  />

                  {!isCameraActive && (
                    <div className="text-center text-white/90 text-xs p-4 flex flex-col items-center gap-2">
                      <Camera className="w-7 h-7 text-tag-amber" />
                      <span className="font-bold">Webcam Standby</span>
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="px-4 py-1.5 rounded-full bg-tag-amber text-tag-brown font-extrabold text-xs shadow-warm-sm hover:scale-105 transition-all mt-1"
                      >
                        Start Camera
                      </button>
                    </div>
                  )}
                </div>

                {cameras.length > 1 && (
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-[10px] font-bold text-tag-brown-muted">Device:</span>
                    <select
                      value={selectedCameraId}
                      onChange={(e) => {
                        setSelectedCameraId(e.target.value);
                        startCamera(e.target.value);
                      }}
                      className="px-2.5 py-1 rounded-xl border border-tag-border bg-white text-xs font-bold text-tag-brown outline-none focus:border-tag-amber"
                    >
                      {cameras.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label || `Camera ${c.id.slice(0, 5)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* INSTANT INVENTORY PICKER (CLICK ANY TAG TO EDIT DIRECTLY) */}
            {/* ======================================================== */}
            <div className="p-4 rounded-2xl bg-tag-bg border border-tag-border flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-xs font-bold text-tag-brown">
                  <Sparkles className="w-3.5 h-3.5 text-tag-amber-deep" />
                  <span>Click Any Inventory Tag to Inspect & Reassign:</span>
                </div>
                <div className="relative w-44 sm:w-56">
                  <Search className="w-3 h-3 text-tag-brown-light absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={inventorySearch}
                    onChange={(e) => setInventorySearch(e.target.value)}
                    placeholder="Filter by plate or serial..."
                    className="w-full pl-8 pr-2.5 py-1 rounded-xl border border-tag-border bg-white text-[11px] font-medium text-tag-brown outline-none focus:border-tag-amber shadow-2xs"
                  />
                </div>
              </div>

              {/* Grid of stock tags */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1">
                {filteredInventory.map((item) => (
                  <button
                    key={item.orderId || item.tag_id || item.rawId}
                    type="button"
                    onClick={() => {
                      handleDecodedResult(
                        item.vehicleNumber || item.vehicle_number || item.serialNumber || item.orderId
                      );
                    }}
                    className="p-2.5 rounded-xl bg-white border border-tag-border hover:border-tag-amber hover:bg-amber-50/60 flex flex-col text-left transition-all group shadow-2xs"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono font-black text-xs text-tag-brown group-hover:text-tag-amber-deep">
                        {item.vehicleNumber || item.vehicle_number || 'UNASSIGNED'}
                      </span>
                      <span className="text-[10px] text-tag-amber-deep font-mono font-bold">
                        {item.serialNumber ? item.serialNumber.slice(-4) : ''}
                      </span>
                    </div>
                    <span className="text-[10.5px] text-tag-brown-muted truncate font-medium mt-1">
                      {item.customerName || item.customer_name || 'Stock'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message if any */}
            {cameraError && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-tag-border text-xs">
          <span className="text-[11px] text-tag-brown-muted font-medium flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-tag-amber" />
            <span>Encrypted Tagtique Supabase Registry</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full border border-tag-border text-xs font-bold text-tag-brown hover:bg-tag-pill transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
