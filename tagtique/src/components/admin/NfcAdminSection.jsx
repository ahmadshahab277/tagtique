import React, { useEffect, useMemo, useState } from 'react';
import { Camera, Copy, Nfc, RefreshCw, Search } from 'lucide-react';
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
      const code = preferCode || selectedCode;
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

  async function save() {
    const tagCode = normalizeTagCode(form.tagCode);
    if (!tagCode) {
      setError('Use a permanent ID like TAG-000001. Saving never creates a replacement ID.');
      return;
    }
    setBusy('save');
    setError('');
    setNotice('');
    try {
      const saved = await nfcTagService.save({ ...form, tagCode });
      setNotice(
        saved.syncStatus === 'update_required'
          ? 'Contacts saved. The website will show the new numbers. The physical chip still has the old ones until you rewrite it.'
          : 'Saved. Changing the database does not change a chip that was already written.'
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
    setNotice(`QR ${qrCode || plate || 'sticker'} is ready to assign. The NFC ID stays the same. Press Save contacts.`);
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
    if (!selected) return;
    if (selected.status === 'disabled' || form.status === 'disabled') {
      setError('A disabled tag cannot be rewritten.');
      return;
    }
    if (!webNfc) {
      setError('This browser cannot write NFC tags. Copy the payload below and write it with a compatible Android NFC app, then use Read & verify.');
      return;
    }
    const nextPayload = buildPayload({
      ...form,
      tagCode: selected.tagCode,
      payloadVersion: selected.payloadVersion,
      updatedAt: selected.updatedAt
    });
    if (!nextPayload.ownerPhone && !nextPayload.guardianPhone) {
      setError('Add at least one phone number before writing the chip.');
      return;
    }
    let writePromise;
    try {
      writePromise = startNfcWrite(nextPayload);
    } catch (err) {
      setError(explainNfcError(err));
      return;
    }
    setBusy('write');
    setError('');
    setNotice('Keep this phone on the NFC chip until the write finishes.');
    try {
      await writePromise;
      await nfcTagService.save({ ...form, tagCode: selected.tagCode });
      const reading = await readBackAfterWrite();
      if (!reading.parsed) {
        setError('The chip was written, but it could not be read back. It is not marked Synced. Press Read & verify while holding the phone on the chip.');
        return;
      }
      const result = await nfcTagService.verify(selected.tagCode, readingForVerify(reading.parsed, nextPayload));
      await load(selected.tagCode);
      if (!result?.synced) {
        setError(result?.message || 'Read-back did not match. The tag is not marked Synced.');
        return;
      }
      setNotice(`Synced at ${formatWhen(result.tag?.lastVerifiedAt)}. The permanent ID and URL did not change.`);
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

          <div className="p-3 rounded-2xl border border-tag-border bg-tag-bg flex flex-col gap-3">
            <div>
              <p className="text-sm font-bold text-tag-brown">Assign from a QR sticker</p>
              <p className="text-xs text-tag-brown-muted mt-1">Scan the printed sticker, or type its QR id or number plate. This fills the owner and vehicle. It does not change the NFC ID.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button type="button" onClick={() => setScannerOpen(true)} className="px-4 py-2.5 rounded-xl bg-tag-brown text-[#FDF7EC] text-sm font-bold flex items-center justify-center gap-2">
                <Camera className="w-4 h-4" />
                Scan QR sticker
              </button>
              <input
                value={qrQuery}
                onChange={(event) => setQrQuery(event.target.value)}
                onKeyDown={(event) => { if (event.key === 'Enter') findQr(); }}
                placeholder="QR id, plate, or phone"
                className="flex-1 px-3 py-2 rounded-xl border border-tag-border bg-white text-sm text-tag-brown"
              />
              <button type="button" disabled={busy === 'find'} onClick={findQr} className="px-4 py-2.5 rounded-xl border border-tag-border text-sm font-bold text-tag-brown flex items-center justify-center gap-2 disabled:opacity-50">
                <Search className="w-4 h-4" />
                Find
              </button>
            </div>
            {form.qrCode && <p className="text-xs font-mono font-bold text-tag-brown">Linked QR: {form.qrCode}</p>}
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy === 'save'} onClick={save} className="px-4 py-2.5 rounded-xl bg-tag-brown text-[#FDF7EC] text-sm font-bold disabled:opacity-50">
              Save contacts
            </button>
          </div>

          {selected && (
            <div className={`p-3 rounded-2xl border text-sm ${syncClass(selected.syncStatus)}`}>
              <p className="font-bold">{SYNC_LABEL[selected.syncStatus]}</p>
              <p className="mt-1">Last database update: {formatWhen(selected.updatedAt)}</p>
              <p>Last successful chip verification: {formatWhen(selected.lastVerifiedAt)}</p>
              {selected.syncStatus === 'update_required' && (
                <p className="mt-2 font-semibold">The website has newer numbers than the last verified chip. Offline taps can still show the previous numbers until you rewrite the tag.</p>
              )}
              {selected.syncStatus === 'unverified' && (
                <p className="mt-2">The physical chip has not been confirmed against this record.</p>
              )}
            </div>
          )}

          {permanentUrl && (
            <div className="p-3 rounded-2xl border border-tag-border bg-tag-bg flex flex-col gap-2">
              <span className="text-xs font-bold text-tag-brown-muted">Permanent URL</span>
              <div className="flex items-center gap-2">
                <code className="text-sm break-all flex-1">{permanentUrl}</code>
                <button type="button" onClick={() => copyText(permanentUrl, 'URL')} className="p-2 rounded-lg border border-tag-border" aria-label="Copy NFC URL">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-tag-brown-muted">This URL stays the same when either phone number changes. About {byteEstimate} bytes. Use an NTAG215 or NTAG216. {ndefIncludesJson(payload) ? 'The write includes a text record, a URL record, and a JSON record.' : 'The write includes a text record and a URL record.'}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!selected || busy === 'write'} onClick={rewrite} className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white text-sm font-bold flex items-center gap-2 disabled:opacity-50">
              <Nfc className="w-4 h-4" />
              Rewrite NFC tag
            </button>
            <button type="button" disabled={!selected || busy === 'verify'} onClick={verifyExternal} className="px-4 py-2.5 rounded-xl border border-tag-border text-sm font-bold text-tag-brown disabled:opacity-50">
              Read & verify
            </button>
          </div>
          <p className="text-sm text-tag-brown-muted leading-relaxed">
            {webNfc
              ? 'Hold an unlocked NFC chip against this Android phone. Rewrite replaces the old contact records and keeps the same ID and URL. Synced is set only after the chip is read back and matches.'
              : 'This browser cannot use Web NFC. Chrome on Android can write directly. Otherwise copy the payload into an NFC app as a Text record plus a URL record, write the same tag, then open this page in Chrome on Android and press Read & verify.'}
          </p>

          {externalPacket && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-tag-brown-muted">Payload for an external NFC tool</span>
                <button type="button" onClick={() => copyText(externalPacket, 'Payload')} className="text-xs font-bold text-tag-brown">Copy</button>
              </div>
              <pre className="text-xs whitespace-pre-wrap bg-tag-bg border border-tag-border rounded-xl p-3 max-h-48 overflow-auto">{externalPacket}</pre>
            </div>
          )}

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
