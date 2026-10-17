import React, { useState } from 'react';
import { orderBackendService } from '../../services/orderBackendService';

export default function FirstTimeSetup({ vehicle, onRegistered }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [plate, setPlate] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [guardian, setGuardian] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      const result = await orderBackendService.claimTagSetup({
        tagId: vehicle?.tagId,
        qrToken: vehicle?.qrToken || vehicle?.tagId,
        vehicleId: vehicle?.vehicleId,
        customerId: vehicle?.customerId,
        customerName: name,
        phoneNumber: phone,
        vehicleNumber: plate,
        vehicleType,
        guardianNumber: guardian
      });
      if (!result?.success) {
        setError(result?.error || 'Setup could not be saved.');
        return;
      }
      if (onRegistered) await onRegistered();
    } catch (err) {
      setError(err?.message || 'Setup could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-3xl border border-[#EAE3D6] p-5 sm:p-6 shadow-sm flex flex-col gap-4 text-left">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">First-time setup</p>
        <h2 className="font-baloo font-extrabold text-2xl text-[#1C120C] leading-tight mt-1">
          Register this sticker
        </h2>
        <p className="text-xs text-[#8C7A6B] mt-1 leading-relaxed">
          This sticker is not linked to a vehicle yet. Enter your details once. The next scan will open your contact page.
        </p>
      </div>

      <label className="flex flex-col gap-1 text-xs font-bold text-[#1C120C]">
        Your name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-[#EAE3D6] font-semibold outline-none focus:border-amber-500"
          placeholder="Full name"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-bold text-[#1C120C]">
        Phone number
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-[#EAE3D6] font-semibold outline-none focus:border-amber-500"
          placeholder="03xx xxxxxxx"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-bold text-[#1C120C]">
        Vehicle number
        <input
          required
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase())}
          className="px-3 py-2.5 rounded-xl border border-[#EAE3D6] font-mono font-bold outline-none focus:border-amber-500"
          placeholder="LEA-1234"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-bold text-[#1C120C]">
        Vehicle type
        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-[#EAE3D6] font-semibold outline-none focus:border-amber-500 bg-white"
        >
          <option>Car</option>
          <option>Bike</option>
          <option>Other</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs font-bold text-[#1C120C]">
        Guardian number (optional)
        <input
          type="tel"
          value={guardian}
          onChange={(e) => setGuardian(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-[#EAE3D6] font-semibold outline-none focus:border-amber-500"
          placeholder="Only if you want a second contact"
        />
      </label>

      {error && (
        <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full py-3.5 rounded-2xl bg-[#1C120C] text-[#FDF7EC] font-extrabold disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Assign'}
      </button>
    </form>
  );
}
