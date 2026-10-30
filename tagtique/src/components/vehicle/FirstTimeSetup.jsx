import React, { useState } from 'react';
import { orderBackendService } from '../../services/orderBackendService';
import { ShieldCheck, Sparkles } from 'lucide-react';

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
    <form onSubmit={handleSubmit} className="w-full bg-[#12131A] rounded-[28px] border border-white/10 p-6 shadow-2xl flex flex-col gap-4 text-left backdrop-blur-xl">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>First-Time Tag Setup</span>
        </div>
        <h2 className="font-extrabold text-2xl text-white leading-tight font-manrope">
          Register This Vehicle Tag
        </h2>
        <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
          This smart sticker is not linked to a vehicle yet. Enter your details once. The next scan will open your live contact page.
        </p>
      </div>

      <label className="flex flex-col gap-1.5 text-xs font-bold text-white/70 uppercase tracking-wider">
        Your Name
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-semibold outline-none focus:border-amber-400 normal-case"
          placeholder="e.g. Ali Khan"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-bold text-white/70 uppercase tracking-wider">
        Phone Number
        <input
          required
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-semibold outline-none focus:border-amber-400 normal-case"
          placeholder="03xx xxxxxxx"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-bold text-white/70 uppercase tracking-wider">
        Vehicle Plate Number
        <input
          required
          value={plate}
          onChange={(e) => setPlate(e.target.value.toUpperCase())}
          className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-mono font-bold outline-none focus:border-amber-400"
          placeholder="LEA-1234"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-bold text-white/70 uppercase tracking-wider">
        Vehicle Type
        <select
          value={vehicleType}
          onChange={(e) => setVehicleType(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-[#181920] border border-white/10 text-white font-semibold outline-none focus:border-amber-400 normal-case"
        >
          <option value="Car">Car</option>
          <option value="Bike">Motorcycle / Bike</option>
          <option value="Van">Van / Commercial</option>
          <option value="Other">Other</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-xs font-bold text-white/70 uppercase tracking-wider">
        Emergency Guardian Number (Optional)
        <input
          type="tel"
          value={guardian}
          onChange={(e) => setGuardian(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-white font-semibold outline-none focus:border-amber-400 normal-case"
          placeholder="Backup contact in case you don't answer"
        />
      </label>

      {error && (
        <p className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.99] text-black font-extrabold text-sm shadow-[0_4px_25px_rgba(245,158,11,0.25)] transition-all cursor-pointer disabled:opacity-60"
      >
        {saving ? 'Registering Tag...' : 'Activate & Assign Tag'}
      </button>
    </form>
  );
}
