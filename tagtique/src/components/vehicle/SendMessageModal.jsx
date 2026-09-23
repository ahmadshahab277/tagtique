import React, { useState } from 'react';
import { X, MessageSquare, Send, CheckCircle2, AlertCircle, Sparkles, Shield, RefreshCw } from 'lucide-react';
import { smsUrl, whatsappUrl } from '../../utils/contactLinks';

const SUGGESTED_QUICK_MESSAGES = [
  'Your vehicle is blocking my way',
  'Your lights are on',
  'I need to speak with you',
  'Please move your vehicle'
];

export default function SendMessageModal({
  isOpen,
  onClose,
  vehicle
}) {
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState(null);

  if (!isOpen) return null;

  const handleSelectQuickMessage = (text) => {
    setMessage(text);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!message.trim()) {
      setErrorMessage('Please enter a message or choose a quick option.');
    }
  };

  const handleResetAndClose = () => {
    setMessage('');
    setSenderName('');
    setSenderPhone('');
    setErrorMessage('');
    setIsSuccess(false);
    setReceiptData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C120C]/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-[#EAE3D6] max-w-md w-full p-6 flex flex-col gap-4 shadow-warm-lg animate-slideUp max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#975A16]">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-baloo font-extrabold text-lg text-[#1C120C] leading-tight">
                Send a Message
              </h3>
              <span className="text-[11px] text-[#8C7A6B] font-medium">
                Text on SIM or send on WhatsApp
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 rounded-full text-[#8C7A6B] hover:text-[#1C120C] hover:bg-[#FAF7F2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          /* ======================================================== */
          /* SUCCESS STATE */
          /* ======================================================== */
          <div className="flex flex-col items-center text-center p-4 gap-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 shadow-warm-sm">
              <CheckCircle2 className="w-9 h-9 animate-scaleIn" />
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="font-baloo font-extrabold text-xl text-[#1C120C]">
                Message sent successfully.
              </h4>
              <p className="text-xs text-[#8C7A6B] max-w-xs leading-relaxed">
                An instant notification has been dispatched to the driver of{' '}
                <strong className="text-[#1C120C] font-mono">
                  {vehicle?.registrationNumber || 'ABC-123'}
                </strong>.
              </p>
            </div>

            {/* Receipt Box */}
            <div className="w-full p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-xs flex flex-col gap-1.5 text-left font-mono">
              <div className="flex items-center justify-between text-[#8C7A6B]">
                <span>Status:</span>
                <span className="text-emerald-700 font-bold">DISPATCHED (SMS + PUSH)</span>
              </div>
              <div className="flex items-center justify-between text-[#8C7A6B]">
                <span>Receipt:</span>
                <span className="font-bold text-[#1C120C]">{receiptData?.receiptId || 'MSG-VERIFIED'}</span>
              </div>
              <div className="flex items-center justify-between text-[#8C7A6B]">
                <span>Time:</span>
                <span className="text-[#1C120C]">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full py-3 rounded-2xl bg-[#1C120C] hover:bg-[#2B1B10] text-[#FDF7EC] font-bold text-xs shadow-warm-sm transition-colors mt-2"
            >
              Done
            </button>
          </div>
        ) : (
          /* ======================================================== */
          /* FORM INPUT STATE */
          /* ======================================================== */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Suggested Quick Messages */}
            <div className="flex flex-col gap-2">
              <span className="text-[11px] font-bold text-[#8C7A6B] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E6AF2E]" />
                <span>Suggested Quick Messages:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {SUGGESTED_QUICK_MESSAGES.map((text) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => handleSelectQuickMessage(text)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition-all border ${
                      message === text
                        ? 'bg-[#1C120C] text-[#FDF7EC] border-[#1C120C] shadow-2xs'
                        : 'bg-[#FAF7F2] text-[#1C120C] border-[#EAE3D6] hover:bg-white hover:border-[#1C120C]/30'
                    }`}
                  >
                    "{text}"
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message Textarea */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1C120C]">
                  Your Message to Driver <span className="text-red-500">*</span>
                </label>
                <span className="text-[10px] text-[#A89889] font-mono">
                  {message.length}/300
                </span>
              </div>
              <textarea
                required
                maxLength={300}
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here (e.g. Please move your car, I am parked behind you)..."
                className="w-full px-3.5 py-2.5 rounded-2xl border border-[#EAE3D6] bg-[#FAF7F2] focus:bg-white text-xs text-[#1C120C] font-medium outline-none focus:border-[#E6AF2E] transition-all resize-none shadow-2xs leading-relaxed"
              />
            </div>

            {/* Optional Sender Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="text-[11px] font-bold text-[#8C7A6B] block mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Neighbor / Driver"
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE3D6] bg-[#FAF7F2] focus:bg-white text-xs text-[#1C120C] outline-none focus:border-[#E6AF2E]"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-[#8C7A6B] block mb-1">
                  Your Phone # (Optional for reply)
                </label>
                <input
                  type="text"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="0300-XXXXXXX"
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE3D6] bg-[#FAF7F2] focus:bg-white text-xs text-[#1C120C] font-mono outline-none focus:border-[#E6AF2E]"
                />
              </div>
            </div>

            {/* Error Message if any */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              {!vehicle?.phoneNumber && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs">
                  This vehicle does not have a phone number saved yet.
                </div>
              )}
              <button
                type="button"
                disabled={!message.trim() || !smsUrl(vehicle?.phoneNumber)}
                onClick={() => { window.location.href = smsUrl(vehicle?.phoneNumber, message.trim()); }}
                className="w-full py-3 rounded-2xl bg-[#1C120C] hover:bg-[#2B1B10] active:scale-[0.99] text-[#FDF7EC] font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-warm-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-[#E6AF2E]" />
                <span>Text on SIM</span>
              </button>
              <button
                type="button"
                disabled={!message.trim() || !whatsappUrl(vehicle?.phoneNumber)}
                onClick={() => { window.location.href = whatsappUrl(vehicle?.phoneNumber, message.trim()); }}
                className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:scale-[0.99] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-warm-sm disabled:opacity-50"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Send on WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-2.5 rounded-full border border-[#EAE3D6] text-xs font-bold text-[#1C120C] hover:bg-[#FAF7F2]"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
