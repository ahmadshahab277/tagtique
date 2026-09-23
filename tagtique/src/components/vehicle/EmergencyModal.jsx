import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, ShieldAlert, CheckCircle2, AlertCircle, PhoneCall, Clock, ArrowRight, RefreshCw, BellRing } from 'lucide-react';
import { tagCommunicationService } from '../../services/tagCommunicationService';

export default function EmergencyModal({
  isOpen,
  onClose,
  vehicle
}) {
  const [step, setStep] = useState('compose'); // 'compose' | 'confirm' | 'success'
  const [emergencyNote, setEmergencyNote] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState('high'); // 'high' | 'critical'
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [alertData, setAlertData] = useState(null);

  // Escalation timer countdown state
  const [secondsRemaining, setSecondsRemaining] = useState(180);
  const [guardianEscalated, setGuardianEscalated] = useState(false);
  const [isEscalatingManual, setIsEscalatingManual] = useState(false);

  useEffect(() => {
    let interval = null;
    if (step === 'success' && secondsRemaining > 0 && !guardianEscalated) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            triggerGuardianEscalation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, secondsRemaining, guardianEscalated]);

  if (!isOpen) return null;

  const triggerGuardianEscalation = async () => {
    setIsEscalatingManual(true);
    try {
      await tagCommunicationService.notifyGuardian(
        vehicle?.tagId || 'TAG-001',
        emergencyNote || 'Urgent vehicle emergency escalation'
      );
      setGuardianEscalated(true);
    } catch (_) {}
    setIsEscalatingManual(false);
  };

  const handleProceedToConfirm = (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setStep('confirm');
  };

  const handleSendConfirmed = async () => {
    setIsSending(true);
    setErrorMessage('');

    try {
      const res = await tagCommunicationService.sendEmergencyAlert({
        tagId: vehicle?.tagId || 'TAG-001',
        note: emergencyNote.trim(),
        urgencyLevel
      });

      if (res.success) {
        setAlertData(res.data);
        setSecondsRemaining(res.data.escalationTimeRemaining || 180);
        setStep('success');
      } else {
        setErrorMessage(res.error || 'Failed to dispatch emergency alert.');
        setStep('compose');
      }
    } catch (err) {
      setErrorMessage('Unexpected emergency dispatch error.');
      setStep('compose');
    } finally {
      setIsSending(false);
    }
  };

  const handleResetAndClose = () => {
    setStep('compose');
    setEmergencyNote('');
    setErrorMessage('');
    setGuardianEscalated(false);
    setSecondsRemaining(180);
    onClose();
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C120C]/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl border-2 border-red-300 max-w-md w-full p-6 flex flex-col gap-4 shadow-warm-lg animate-slideUp max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-red-100 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-warm-sm">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-baloo font-extrabold text-lg sm:text-xl text-red-950 leading-tight">
                Emergency Alert
              </h3>
              <span className="text-[11px] text-red-700 font-bold uppercase tracking-wider">
                Priority Notification Relay
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full text-red-800 hover:bg-red-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* STEP 1: COMPOSE URGENT ALERT */}
        {/* ======================================================== */}
        {step === 'compose' && (
          <form onSubmit={handleProceedToConfirm} className="flex flex-col gap-4">
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-950 flex flex-col gap-1.5">
              <span className="font-extrabold text-sm text-red-900 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Urgent Vehicle Alert</span>
              </span>
              <p className="text-[11.5px] leading-relaxed text-red-900/90">
                Use this only when you need urgent assistance regarding this vehicle (e.g. hazard, hit and run, child/pet locked inside, open door, rolling vehicle).
              </p>
            </div>

            {/* Quick emergency templates */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider">
                Select Emergency Type (Optional):
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  'Vehicle window broken',
                  'Vehicle rolling / hazard',
                  'Smoke or fluid leaking',
                  'Pet / Child inside car'
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setEmergencyNote(preset)}
                    className={`p-2 rounded-xl text-xs font-semibold text-left border transition-all ${
                      emergencyNote === preset
                        ? 'bg-red-600 text-white border-red-600 shadow-2xs'
                        : 'bg-[#FAF7F2] text-[#1C120C] border-[#EAE3D6] hover:bg-red-50 hover:border-red-300'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Short emergency details */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#1C120C]">
                Emergency Details (Optional note)
              </label>
              <textarea
                rows={2}
                maxLength={200}
                value={emergencyNote}
                onChange={(e) => setEmergencyNote(e.target.value)}
                placeholder="Briefly describe what is happening..."
                className="w-full px-3.5 py-2 rounded-xl border border-red-200 bg-[#FAF7F2] focus:bg-white text-xs text-[#1C120C] outline-none focus:border-red-500 resize-none"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Continue Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-warm-md transition-all cursor-pointer"
            >
              <span>Continue to Confirmation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ======================================================== */}
        {/* STEP 2: CONFIRMATION SCREEN (Mandatory confirmation) */}
        {/* ======================================================== */}
        {step === 'confirm' && (
          <div className="flex flex-col gap-4 animate-fadeIn">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-red-50 to-rose-50 border-2 border-red-300 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-warm-md animate-pulse">
                <BellRing className="w-7 h-7" />
              </div>

              <div className="flex flex-col gap-1">
                <h4 className="font-baloo font-extrabold text-xl text-red-950">
                  Are you sure you want to send an emergency alert?
                </h4>
                <p className="text-xs text-red-900/80 leading-relaxed max-w-xs">
                  This will immediately trigger loud audible ringers and high-priority SMS alerts on the registered driver's phone.
                </p>
              </div>

              {emergencyNote && (
                <div className="w-full p-2.5 rounded-xl bg-white/80 border border-red-200 text-xs font-semibold text-red-950 text-left">
                  <span className="text-[10px] text-red-700 uppercase block font-bold">Attached Note:</span>
                  <span>"{emergencyNote}"</span>
                </div>
              )}
            </div>

            {/* Confirmation Buttons */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep('compose')}
                className="w-1/3 py-3 rounded-2xl border border-[#EAE3D6] text-xs font-bold text-[#1C120C] hover:bg-[#FAF7F2] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isSending}
                onClick={handleSendConfirmed}
                className="flex-1 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.99] text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-warm-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Send Emergency Alert</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: SUCCESS STATE & GUARDIAN ESCALATION TIMER */}
        {/* ======================================================== */}
        {step === 'success' && (
          <div className="flex flex-col items-center text-center p-2 gap-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 flex items-center justify-center text-emerald-600 shadow-warm-sm">
              <CheckCircle2 className="w-9 h-9 animate-scaleIn" />
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="font-baloo font-extrabold text-2xl text-[#1C120C]">
                Emergency alert sent.
              </h4>
              <p className="text-xs text-[#8C7A6B] max-w-xs leading-relaxed">
                An urgent notification has been sent to the registered contact for vehicle{' '}
                <strong className="text-[#1C120C] font-mono">
                  {vehicle?.registrationNumber || 'ABC-123'}
                </strong>.
              </p>
            </div>

            {/* Escalation Status & Countdown Card */}
            <div className="w-full p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-2 border-amber-300 text-left flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-xs text-amber-950">
                  <Clock className="w-4 h-4 text-[#D49A1F]" />
                  <span>Automatic Guardian Escalation</span>
                </div>
                {secondsRemaining > 0 && !guardianEscalated ? (
                  <span className="font-mono font-black text-sm text-[#975A16] px-2 py-0.5 rounded-lg bg-white border border-amber-300 shadow-2xs">
                    {formatTimer(secondsRemaining)}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white">
                    ESCALATED
                  </span>
                )}
              </div>

              {guardianEscalated ? (
                <div className="p-3 rounded-xl bg-white/90 border border-emerald-300 text-xs text-emerald-950 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Guardian Notified</span>
                  </div>
                  <p className="text-[11px] text-emerald-900/80 leading-tight">
                    The secondary registered emergency guardian has been called and notified with high-priority dispatch.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <p className="text-[11.5px] text-amber-950/90 leading-relaxed">
                    If the primary vehicle owner does not acknowledge this alert within <strong className="font-mono font-bold">3 minutes</strong>, Tagtique will automatically escalate and ring the registered emergency guardian.
                  </p>
                  <button
                    type="button"
                    disabled={isEscalatingManual}
                    onClick={triggerGuardianEscalation}
                    className="mt-2 py-2 px-3 rounded-xl bg-[#1C120C] hover:bg-[#2B1B10] text-[#FDF7EC] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-[#E6AF2E]" />
                    <span>{isEscalatingManual ? 'Escalating...' : 'Escalate to Guardian Now'}</span>
                  </button>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-3 rounded-2xl bg-[#1C120C] text-[#FDF7EC] font-bold text-xs shadow-warm-sm hover:bg-[#2B1B10] transition-colors mt-1"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
