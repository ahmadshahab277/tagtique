import React, { useEffect, useMemo, useState } from 'react';
import { Camera, Copy, Nfc, RefreshCw, Search, CheckCircle2, Sparkles, Radio, Phone } from 'lucide-react';
import QRScannerModal from '../QRScannerModal';
import { orderBackendService } from '../../services/orderBackendService';
import { nfcTagService } from '../../services/nfcTagService';
import {
  buildCompactJson,
  buildNdefRecords,
  buildPayload,
  buildReadableText,
  estimateNdefBytes,
  ndefIncludesJson,
  nfcPageUrl,
  readingForVerify,
  normalizeTagCode,
  suggestNextTagCode
} from '../../utils/nfcPayload';
import { explainNfcError, isWebNfcSupported, readBackAfterWrite, readNfcTag, startNfcWrite } from '../../utils/nfcWriter';

const EMPTY_FORM = {
  tagCode: '',
  ownerName: '',
  ownerPhone: '',
  guardianName: '',
  guardianPhone: '',
  vehicleLabel: '',
  customerName: '',
  vehicleId: '',
  qrCode: '',
  status: 'unassigned'
};

const SYNC_LABEL = {
  synced: 'Synced',
  update_required: 'Update required',
  unverified: 'Unverified',
  disabled: 'Disabled'
};

function syncClass(status) {
  if (status === 'synced') return 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (status === 'update_required') return 'bg-amber-50 text-amber-950 border-amber-200';
  if (status === 'disabled') return 'bg-red-50 text-red-900 border-red-200';
  return 'bg-[#FAF7F2] text-[#1C120C] border-[#EAE3D6]';
}

function formatWhen(value) {
  if (!value) return 'Not verified yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not verified yet';
  return date.toLocaleString();
}

export default function NfcAdminSection({ orders = [] }) {
  const [tags, setTags] = useState([]);
  const [query, setQuery] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [selectedCode, setSelectedCode] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [audit, setAudit] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [qrQuery, setQrQuery] = useState('');
  const webNfc = isWebNfcSupported();

  const selected = tags.find((tag) => tag.tagCode === selectedCode) || null;

  const load = async (preferCode) => {
    setBusy('load');
    setError('');
    try {
      const rows = await nfcTagService.list();
      setTags(rows);
      const code = preferCode || selectedCode || (rows.length > 0 ? rows[0].tagCode : '');
      if (code) {
        const match = rows.find((tag) => tag.tagCode === code);
        if (match) fillForm(match);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  };

  useEffect(() => {
    load();
    // The list is loaded once when the NFC section opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fillForm(tag) {
    setSelectedCode(tag.tagCode);
    setForm({
      tagCode: tag.tagCode,
      ownerName: tag.ownerName || '',
      ownerPhone: tag.ownerPhone || '',
      guardianName: tag.guardianName || '',
      guardianPhone: tag.guardianPhone || '',
      vehicleLabel: tag.vehicleLabel || '',
      customerName: tag.customerName || '',
      vehicleId: tag.vehicleId || '',
      qrCode: tag.qrCode || '',
      status: tag.status || 'unassigned'
    });
    nfcTagService.audit(tag.tagCode).then(setAudit).catch(() => setAudit([]));
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return tags;
    return tags.filter((tag) =>
      [tag.tagCode, tag.ownerName, tag.ownerPhone, tag.guardianPhone, tag.vehicleLabel, tag.customerName, tag.qrCode]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
  }, [tags, query]);

  const payload = buildPayload({ ...form, tagCode: normalizeTagCode(form.tagCode) || form.tagCode, payloadVersion: selected?.payloadVersion || 1, updatedAt: selected?.updatedAt });
  const permanentUrl = nfcPageUrl(normalizeTagCode(form.tagCode));
  const byteEstimate = payload.id ? estimateNdefBytes(payload, { includeJson: ndefIncludesJson(payload) }) : 0;

  async function copyText(value, label) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice(`${label} copied.`);
      setError('');
    } catch {
      setError('Could not copy. Select the text and copy it manually.');
    }
  }

  async function syncVehicleAndLocalCache(tagCode, savePayload) {
    try {
      const plate = (savePayload.vehicleLabel || '').trim();
      const qrCode = (savePayload.qrCode || '').trim();
      const ownerName = (savePayload.ownerName || savePayload.customerName || '').trim();
      const ownerPhone = (savePayload.ownerPhone || '').trim();
      const guardianPhone = (savePayload.guardianPhone || '').trim();

      // 1. Look up in orderBackendService or Supabase
      const allOrders = orderBackendService.loadLocalOrders();
      let matchedOrder = allOrders.find(
        (o) =>
          (qrCode && o.qr_code_value === qrCode) ||
          (savePayload.vehicleId && (o.vehicle_id === savePayload.vehicleId || o.vehicleId === savePayload.vehicleId)) ||
          (plate && o.vehicleNumber?.toUpperCase() === plate.toUpperCase())
      );

      if (!matchedOrder && qrCode) {
        matchedOrder = await orderBackendService.lookupTagByAny(qrCode);
      }

      if (matchedOrder) {
        await orderBackendService.reassignTagDetails(
          matchedOrder.tag_id || matchedOrder.tagId,
          {
            vehicle_id: matchedOrder.vehicle_id || matchedOrder.vehicleId,
            vehicle_number: plate || matchedOrder.vehicleNumber,
            vehicleNumber: plate || matchedOrder.vehicleNumber,
            customer_name: ownerName || matchedOrder.customerName,
            customerName: ownerName || matchedOrder.customerName,
            phone_number: ownerPhone || matchedOrder.phoneNumber,
            phoneNumber: ownerPhone || matchedOrder.phoneNumber,
            guardian_number: guardianPhone || matchedOrder.guardianNumber,
            guardianNumber: guardianPhone || matchedOrder.guardianNumber,
            status: 'Delivered',
            regenerateQrToken: false
          }
        );
      }

      // 2. Synchronize localStorage caches
      const vOrders = JSON.parse(localStorage.getItem('tagtique_admin_v3_orders') || '[]');
      if (Array.isArray(vOrders)) {
        let changed = false;
        for (const o of vOrders) {
          if (
            (qrCode && o.qr_code_value === qrCode) ||
            (tagCode && (o.tagCode === tagCode || o.tag_id === tagCode)) ||
            (plate && o.vehicleNumber?.toUpperCase() === plate.toUpperCase())
          ) {
            o.vehicleNumber = plate || o.vehicleNumber;
            o.vehicle_number = plate || o.vehicle_number;
            o.customerName = ownerName || o.customerName;
            o.customer_name = ownerName || o.customer_name;
            o.phoneNumber = ownerPhone || o.phoneNumber;
            o.phone_number = ownerPhone || o.phone_number;
            o.guardianNumber = guardianPhone || o.guardianNumber;
            o.guardian_number = guardianPhone || o.guardian_number;
            o.status = 'Delivered';
            changed = true;
          }
        }
        if (changed) {
          localStorage.setItem('tagtique_admin_v3_orders', JSON.stringify(vOrders));
        }
      }
    } catch (syncErr) {
      console.warn('Vehicle and cache sync warning:', syncErr);
    }
  }

  async function saveInternal(tagCode) {
    const activeStatus = form.status === 'unassigned' ? 'active' : form.status;
    const savePayload = { ...form, tagCode, status: activeStatus };
    const saved = await nfcTagService.save(savePayload);
    await syncVehicleAndLocalCache(tagCode, savePayload);
    return saved;
  }

  async function save() {
    const tagCode = normalizeTagCode(form.tagCode || selectedCode || selected?.tagCode);
    if (!tagCode) {
      setError('Use a permanent ID like TAG-000001.');
      return;
    }
    setBusy('save');
    setError('');
    setNotice('');
    try {
      await saveInternal(tagCode);
      setNotice(
        `✅ Assigned & Live! Tag "${tagCode}" is now active in the cloud for ${form.vehicleLabel || form.ownerName || 'vehicle'}. Taps from any iPhone or Android will open this vehicle immediately.`
      );
      await load(tagCode);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  }

  async function registerBulk() {
    const codes = bulkText.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean);
    if (!codes.length) return;
    setBusy('bulk');
    setError('');
    setNotice('');
    try {
      const result = await nfcTagService.bulkRegister(codes);
      const created = result?.created || [];
      const skipped = result?.skipped || [];
      setNotice(`Registered ${created.length}. Skipped ${skipped.length}. Existing IDs were left unchanged.`);
      setBulkText('');
      await load(created[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy('');
    }
  }

  function applyScannedQr(order) {
    const vehicleId = String(order.vehicle_id || order.vehicleId || '');
    const qrCode = order.qr_code_value || order.qrId || '';
    const plate = order.vehicleNumber || order.vehicle_number || '';
    setForm((current) => ({
      ...current,
      vehicleLabel: plate || current.vehicleLabel,
      customerName: order.customerName || order.customer_name || current.customerName,
      vehicleId: /^[0-9a-f-]{36}$/i.test(vehicleId) ? vehicleId : current.vehicleId,
      ownerName: order.customerName || order.customer_name || current.ownerName,
      ownerPhone: order.phoneNumber || order.phone_number || current.ownerPhone,
      guardianPhone: order.guardianNumber || order.guardian_number || current.guardianPhone,
      qrCode: qrCode || current.qrCode,
      status: current.status === 'unassigned' ? 'active' : current.status
    }));
    setNotice(`QR sticker "${plate || qrCode}" loaded! Click "Save & Assign Tag" below to activate.`);
    setError('');
  }

  async function findQr() {
    const query = qrQuery.trim();
    if (!query) return;
    setBusy('find');
    setError('');
    try {
      const found = await orderBackendService.lookupTagByAny(query);
      const local = found || orders.find((order) => {
        const haystack = [
          order.qr_code_value,
          order.qrId,
          order.vehicleNumber,
          order.vehicle_number,
          order.serialNumber,
          order.serial_number,
          order.phoneNumber,
          order.phone_number,
          order.tag_id
        ].join(' ').toLowerCase();
        return haystack.includes(query.toLowerCase());
      });
      if (!local) {
        setError('No QR sticker matched that code. Scan the sticker, or type its QR id or number plate.');
        return;
      }
      applyScannedQr(local);
    } catch (err) {
      setError(err.message || 'Could not look up that QR sticker.');
    } finally {
      setBusy('');
    }
  }

  async function rewrite() {
    const targetCode = normalizeTagCode(form.tagCode || selectedCode || selected?.tagCode);
    if (!targetCode) {
      setError('Please provide a Tag ID (e.g. TAG-000001).');
      return;
    }
    if (form.status === 'disabled') {
      setError('A disabled tag cannot be rewritten.');
      return;
    }

    setBusy('write');
    setError('');
    setNotice('');

    // Step 1: Auto-save so cloud database is always in sync with form inputs
    try {
      await saveInternal(targetCode);
    } catch (saveErr) {
      console.warn('Pre-write auto-save warning:', saveErr);
    }

    // Step 2: If on iPhone or non-Web-NFC browser
    if (!webNfc) {
      const url = nfcPageUrl(targetCode);
      await copyText(url, 'Tag URL');
      setNotice(
        `✅ Tag Assigned in Cloud! Tag "${targetCode}" is now active for ${form.vehicleLabel || 'this vehicle'}. Since you are on iPhone, the URL has been copied to your clipboard. To write a new chip, paste it into the free NFC Tools app on your iPhone.`
      );
      setBusy('');
      return;
    }

    // Step 3: Android Chrome Web NFC Write
    const nextPayload = buildPayload({
      ...form,
      tagCode: targetCode,
      payloadVersion: (selected?.payloadVersion || 1) + 1,
      updatedAt: new Date().toISOString()
    });

    let writePromise;
    try {
      writePromise = startNfcWrite(nextPayload);
    } catch (err) {
      setError(explainNfcError(err));
      setBusy('');
      return;
    }

    setNotice('📱 Hold your Android phone flat against the NFC sticker tag chip now...');

    try {
      await writePromise;
      try {
        if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
      } catch (_) {}

      setNotice(`✅ NFC Tag "${targetCode}" successfully programmed & assigned to "${form.vehicleLabel || form.ownerName || 'vehicle'}"!`);

      // Attempt readback without throwing error if phone was moved
      try {
        const reading = await readBackAfterWrite();
        if (reading?.parsed) {
          await nfcTagService.verify(targetCode, readingForVerify(reading.parsed, nextPayload));
          await load(targetCode);
        }
      } catch (readErr) {
        console.warn('Readback notice (write still succeeded):', readErr);
      }
    } catch (err) {
      setError(explainNfcError(err));
    } finally {
      setBusy('');
    }
  }

  async function verifyExternal() {
    if (!selected) return;
    if (!webNfc) {
      setError('This browser cannot read NFC tags. Open the admin page in Chrome on Android and hold the phone on the chip.');
      return;
    }
    setBusy('verify');
    setError('');
    setNotice('');
    try {
      const reading = await readNfcTag();
      if (!reading.parsed) {
        setError('No Tagtique contact record was found on this chip.');
        return;
      }
      const result = await nfcTagService.verify(selected.tagCode, reading.parsed);
      await load(selected.tagCode);
      if (!result?.synced) {
        setError(result?.message || 'This chip does not match the saved contacts.');
        return;
      }
      setNotice(`Verified ${formatWhen(result.tag?.lastVerifiedAt)}.`);
    } catch (err) {
      setError(explainNfcError(err));
    } finally {
      setBusy('');
    }
  }

  const externalPacket = payload.id
    ? `TEXT RECORD\n${buildReadableText(payload)}\n\nURL RECORD\n${payload.url}\n\nJSON RECORD\n${ndefIncludesJson(payload) ? buildCompactJson(payload) : 'Leave this out if the chip is too small. Text + URL are enough to verify.'}`
    : '';

  return (
    <div className="flex flex-col gap-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="font-baloo font-extrabold text-2xl sm:text-3xl text-tag-brown tracking-tight">NFC tags</h1>
          <p className="text-sm text-tag-brown-muted mt-1 max-w-2xl">
            QR stickers are unchanged. An NFC tag keeps one permanent ID and one permanent URL. Editing a phone number updates the website immediately, and the physical chip stays out of date until it is rewritten and read back.
          </p>
        </div>
        <button type="button" onClick={() => load(selectedCode)} className="px-3 py-2 rounded-xl border border-tag-border bg-tag-card text-xs font-bold text-tag-brown flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {error && <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-950">{error}</div>}
      {notice && <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-950">{notice}</div>}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="bg-tag-card rounded-2xl border border-tag-border p-4 flex flex-col gap-3">
            <h2 className="font-bold text-tag-brown">Register IDs</h2>
            <textarea
              value={bulkText}
              onChange={(event) => setBulkText(event.target.value)}
              rows={4}
              placeholder={'TAG-000001\nTAG-000002'}
              className="w-full px-3 py-2 rounded-xl border border-tag-border bg-tag-bg text-sm font-mono"
            />
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={busy === 'bulk'} onClick={registerBulk} className="px-3 py-2 rounded-xl bg-tag-brown text-[#FDF7EC] text-sm font-bold disabled:opacity-50">
                Register these IDs
              </button>
              <button
                type="button"
                onClick={() => {
                  const code = suggestNextTagCode(tags.map((tag) => tag.tagCode));
                  setForm({ ...EMPTY_FORM, tagCode: code, status: 'unassigned' });
                  setSelectedCode('');
                }}
                className="px-3 py-2 rounded-xl border border-tag-border text-sm font-bold text-tag-brown"
              >
                New blank tag
              </button>
            </div>
          </div>

          <div className="bg-tag-card rounded-2xl border border-tag-border p-4 flex flex-col gap-3">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search ID, name, or number"
              className="w-full px-3 py-2 rounded-xl border border-tag-border bg-tag-bg text-sm"
            />
            <div className="flex flex-col gap-2 max-h-[28rem] overflow-y-auto">
              {filtered.length === 0 && <p className="text-sm text-tag-brown-muted">No NFC tags yet.</p>}
              {filtered.map((tag) => (
                <button
                  key={tag.tagCode}
                  type="button"
                  onClick={() => fillForm(tag)}
                  className={`text-left p-3 rounded-xl border ${tag.tagCode === selectedCode ? 'border-tag-brown bg-[#F4EADA]' : 'border-tag-border bg-tag-bg'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-sm">{tag.tagCode}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${syncClass(tag.syncStatus)}`}>
                      {SYNC_LABEL[tag.syncStatus] || tag.syncStatus}
                    </span>
                  </div>
                  <p className="text-xs text-tag-brown-muted mt-1">{tag.vehicleLabel || tag.customerName || tag.status}{tag.qrCode ? ` · ${tag.qrCode}` : ''}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-3 bg-tag-card rounded-2xl border border-tag-border p-4 sm:p-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-bold text-tag-brown-muted">
              Permanent tag ID
              <input
                value={form.tagCode}
                onChange={(event) => setForm({ ...form, tagCode: event.target.value.toUpperCase() })}
                disabled={Boolean(selected)}
                className="px-3 py-2 rounded-xl border border-tag-border bg-tag-bg text-sm font-mono font-bold text-tag-brown disabled:opacity-70"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-tag-brown-muted">
              Tag status
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="px-3 py-2 rounded-xl border border-tag-border bg-tag-bg text-sm font-bold text-tag-brown">
                <option value="unassigned">Unassigned</option>
                <option value="active">Active</option>
                <option value="lost">Lost</option>
                <option value="replaced">Replaced</option>
                <option value="disabled">Disabled</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-tag-brown-muted">
              Main owner name
              <input value={form.ownerName} onChange={(event) => setForm({ ...form, ownerName: event.target.value })} className="px-3 py-2 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-tag-brown-muted">
              Main owner number
              <input value={form.ownerPhone} onChange={(event) => setForm({ ...form, ownerPhone: event.target.value })} className="px-3 py-2 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-tag-brown-muted">
              Guardian name
              <input value={form.guardianName} onChange={(event) => setForm({ ...form, guardianName: event.target.value })} className="px-3 py-2 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-tag-brown-muted">
              Guardian number
              <input value={form.guardianPhone} onChange={(event) => setForm({ ...form, guardianPhone: event.target.value })} className="px-3 py-2 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-tag-brown-muted">
              Vehicle shown publicly
              <input value={form.vehicleLabel} onChange={(event) => setForm({ ...form, vehicleLabel: event.target.value })} className="px-3 py-2 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-tag-brown-muted">
              Customer
              <input value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} className="px-3 py-2 rounded-xl border border-tag-border bg-tag-bg text-sm text-tag-brown" />
            </label>
          </div>

          <div className="p-4 rounded-2xl border-2 border-tag-border bg-tag-bg flex flex-col gap-3 shadow-2xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <p className="text-sm font-bold text-tag-brown flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-tag-amber-deep" />
                  <span>Assign from a QR Sticker / Number Plate</span>
                </p>
                <p className="text-xs text-tag-brown-muted mt-0.5">
                  Scan printed sticker or type vehicle plate. Links owner details to this permanent NFC chip.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Any Device (iPhone, Android, PC)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setScannerOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-tag-brown text-[#FDF7EC] text-xs font-extrabold flex items-center justify-center gap-2 shadow-2xs hover:bg-[#1C120C] transition-all"
              >
                <Camera className="w-4 h-4 text-tag-amber" />
                <span>Scan QR Sticker</span>
              </button>
              <input
                value={qrQuery}
                onChange={(event) => setQrQuery(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') findQr(); }}
                placeholder="Type plate (e.g. MH12AB) or QR token"
                className="flex-1 px-3 py-2 rounded-xl border border-tag-border bg-white text-xs font-mono font-bold text-tag-brown outline-none focus:border-tag-amber shadow-2xs"
              />
              <button
                type="button"
                disabled={busy === 'find'}
                onClick={findQr}
                className="px-4 py-2.5 rounded-xl bg-white border border-tag-border text-xs font-bold text-tag-brown flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-2xs"
              >
                <Search className="w-3.5 h-3.5 text-tag-brown-muted" />
                <span>{busy === 'find' ? 'Finding...' : 'Find & Link'}</span>
              </button>
            </div>

            {form.qrCode && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300/80 flex items-center justify-between gap-2">
                <span className="text-xs font-mono font-bold text-tag-brown">
                  Linked QR Sticker: <span className="text-tag-amber-deep">{form.qrCode}</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Ready to Assign
                </span>
              </div>
            )}
          </div>

          {/* Primary Action Buttons (Cloud Save + Android NFC Write + Verification) */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={busy === 'save' || busy === 'write'}
                onClick={save}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl amber-gradient-btn text-tag-brown text-xs font-black flex items-center justify-center gap-2 shadow-warm-xs disabled:opacity-50 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4 text-tag-brown" />
                <span>{busy === 'save' ? 'Saving to Cloud...' : 'Save & Assign Tag'}</span>
              </button>

              <button
                type="button"
                disabled={busy === 'write'}
                onClick={rewrite}
                className="flex-1 sm:flex-initial px-5 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center justify-center gap-2 shadow-warm-xs disabled:opacity-50 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
              >
                <Nfc className="w-4 h-4 text-emerald-200" />
                <span>{busy === 'write' ? 'Holding Phone to Chip...' : webNfc ? 'Rewrite / Program NFC Tag' : 'Assign & Copy Tag URL'}</span>
              </button>

              {webNfc && (
                <button
                  type="button"
                  disabled={busy === 'verify'}
                  onClick={verifyExternal}
                  className="px-4 py-3 rounded-2xl border border-tag-border bg-white text-xs font-bold text-tag-brown flex items-center justify-center gap-1.5 shadow-2xs hover:bg-tag-bg disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-tag-brown-muted" />
                  <span>{busy === 'verify' ? 'Reading Chip...' : 'Read & Verify'}</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-tag-brown-muted flex items-center gap-1.5 font-medium leading-relaxed">
              <Sparkles className="w-3.5 h-3.5 text-tag-amber-deep shrink-0" />
              <span>
                {webNfc
                  ? 'On Android Chrome: Tap "Rewrite / Program NFC Tag" and hold the chip flat against your phone to burn the new vehicle code.'
                  : 'On iPhone: Tap "Save & Assign Tag" to activate in the cloud instantly. To flash a blank chip, copy the tag URL below into NFC Tools.'}
              </span>
            </p>

            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-300/70 text-[11px] text-amber-950 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>
                <strong>Offline Routing Active:</strong> If someone taps this tag without internet, their phone automatically routes directly to Tagtique Support (<strong>0329-2082080</strong>).
              </span>
            </div>
          </div>

          {selected && (
            <div className="p-3.5 rounded-2xl border border-tag-border bg-emerald-50/60 text-xs flex flex-col gap-1 text-emerald-950">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Cloud Live Status: {selected.vehicleLabel ? `Assigned to ${selected.vehicleLabel}` : 'Ready for assignment'}</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-200/80 text-emerald-900 px-2 py-0.5 rounded-full">
                  Live in Supabase
                </span>
              </div>
              <p className="text-[11px] text-tag-brown-muted">
                Last updated: {formatWhen(selected.updatedAt)} · Taps from any phone will display these vehicle details dynamically.
              </p>
            </div>
          )}

          {/* Physical Chip URL Reference */}
          <div className="p-4 rounded-2xl border border-tag-border bg-white flex flex-col gap-3 mt-1 shadow-2xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Nfc className="w-4 h-4 text-tag-amber-deep" />
                <span className="text-xs font-bold text-tag-brown">Permanent NFC Tag URL</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-tag-pill text-tag-brown-muted border border-tag-border">
                {webNfc ? 'Android Web NFC Supported' : 'iPhone / NFC Tools Ready'}
              </span>
            </div>

            <p className="text-[11px] text-tag-brown-muted leading-relaxed">
              Once an NFC sticker chip has this permanent link, <strong>all future vehicle assignments and phone number edits update instantly in the cloud</strong>.
            </p>

            {permanentUrl && (
              <div className="p-2.5 rounded-xl border border-tag-border bg-tag-bg flex items-center gap-2">
                <code className="text-xs font-mono font-bold text-tag-brown break-all flex-1">{permanentUrl}</code>
                <button
                  type="button"
                  onClick={() => copyText(permanentUrl, 'Permanent URL')}
                  className="px-3 py-1.5 rounded-lg bg-tag-brown text-[#FDF7EC] text-xs font-bold flex items-center gap-1 shrink-0 shadow-2xs hover:bg-[#1C120C]"
                >
                  <Copy className="w-3.5 h-3.5 text-tag-amber" />
                  <span>Copy URL</span>
                </button>
              </div>
            )}
          </div>

          {!!buildNdefRecords && selected && audit.length > 0 && (
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-tag-brown-muted">Recent changes</span>
              {audit.map((item, index) => (
                <p key={`${item.createdAt}-${index}`} className="text-xs text-tag-brown-muted">
                  {formatWhen(item.createdAt)} · {item.action}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>

      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        orders={orders}
        closeOnSelect
        title="Scan a QR sticker"
        subtitle="Point the camera at the printed sticker, or use the scanner gun. The NFC ID stays the same."
        onTagSelected={applyScannedQr}
      />
    </div>
  );
}
