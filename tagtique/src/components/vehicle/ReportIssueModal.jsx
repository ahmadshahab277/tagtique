import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle2, Car, Lightbulb, ShieldAlert, AlertTriangle, HelpCircle, Send, RefreshCw } from 'lucide-react';
import { tagCommunicationService } from '../../services/tagCommunicationService';

const ISSUE_CATEGORIES = [
  { id: 'parking', label: 'Parking issue', icon: Car, desc: 'Blocking driveway, double parked, yellow line' },
  { id: 'lights', label: 'Vehicle lights left on', icon: Lightbulb, desc: 'Headlights or cabin interior light running' },
  { id: 'damage', label: 'Vehicle damage', icon: ShieldAlert, desc: 'Flat tire, window open, scratch, physical impact' },
  { id: 'accident', label: 'Accident', icon: AlertTriangle, desc: 'Collision, minor scrape, or hit while parked' },
  { id: 'other', label: 'Other problem', icon: HelpCircle, desc: 'General issue not listed above' }
];

export default function ReportIssueModal({
  isOpen,
  onClose,
  vehicle
}) {
  const [selectedIssue, setSelectedIssue] = useState('parking');
  const [description, setDescription] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketData, setTicketData] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const activeObj = ISSUE_CATEGORIES.find((c) => c.id === selectedIssue);
      const res = await tagCommunicationService.reportIssue({
        tagId: vehicle?.tagId || 'TAG-001',
        issueType: activeObj?.label || 'General Issue',
        description: description.trim(),
        senderPhone: senderContact.trim()
      });

      if (res.success) {
        setTicketData(res.data);
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error || 'Failed to submit report. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Unexpected report submission error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSelectedIssue('parking');
    setDescription('');
    setSenderContact('');
    setErrorMessage('');
    setIsSuccess(false);
    setTicketData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1C120C]/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl border border-[#EAE3D6] max-w-md w-full p-6 flex flex-col gap-4 shadow-warm-lg animate-slideUp max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F2ECE1] pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] flex items-center justify-center text-[#8C7A6B]">
              <AlertCircle className="w-4.5 h-4.5" />
            </div>
            <div className="flex flex-col">
              <h3 className="font-baloo font-extrabold text-lg text-[#1C120C] leading-tight">
                Report an Issue
              </h3>
              <span className="text-[11px] text-[#8C7A6B] font-medium">
                Notify Owner of Vehicle Concern
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
                Issue Reported Successfully
              </h4>
              <p className="text-xs text-[#8C7A6B] max-w-xs leading-relaxed">
                Thank you for being a responsible community member. The owner of{' '}
                <strong className="text-[#1C120C] font-mono">
                  {vehicle?.registrationNumber || 'ABC-123'}
                </strong>{' '}
                has been alerted.
              </p>
            </div>

            <div className="w-full p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE3D6] text-xs flex flex-col gap-1.5 text-left font-mono">
              <div className="flex items-center justify-between text-[#8C7A6B]">
                <span>Category:</span>
                <span className="font-bold text-[#1C120C]">{ticketData?.issueType}</span>
              </div>
              <div className="flex items-center justify-between text-[#8C7A6B]">
                <span>Ticket ID:</span>
                <span className="font-bold text-[#1C120C]">{ticketData?.ticketId}</span>
              </div>
              <div className="flex items-center justify-between text-[#8C7A6B]">
                <span>Status:</span>
                <span className="text-emerald-700 font-bold">DISPATCHED TO DRIVER</span>
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
          /* FORM STATE */
          /* ======================================================== */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            
            {/* Category selection */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#1C120C]">
                Select Issue Category:
              </label>

              <div className="flex flex-col gap-2">
                {ISSUE_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedIssue === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedIssue(cat.id)}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        isSelected
                          ? 'bg-[#1C120C] text-[#FDF7EC] border-[#1C120C] shadow-2xs'
                          : 'bg-[#FAF7F2] text-[#1C120C] border-[#EAE3D6] hover:bg-white'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/10 text-[#E6AF2E]' : 'bg-white border border-[#EAE3D6] text-[#8C7A6B]'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs">
                          {cat.label}
                        </span>
                        <span className={`text-[10.5px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-[#8C7A6B]'}`}>
                          {cat.desc}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional message input */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[#1C120C]">
                Additional Details (Optional)
              </label>
              <textarea
                rows={2}
                maxLength={250}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any helpful context (e.g. Right headlight is on, driver door slightly open)..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#EAE3D6] bg-[#FAF7F2] focus:bg-white text-xs text-[#1C120C] outline-none focus:border-[#E6AF2E] resize-none"
              />
            </div>

            {/* Optional sender contact */}
            <div>
              <label className="text-[11px] font-bold text-[#8C7A6B] block mb-1">
                Your Contact Number (Optional)
              </label>
              <input
                type="text"
                value={senderContact}
                onChange={(e) => setSenderContact(e.target.value)}
                placeholder="0300-XXXXXXX (only if you want owner to follow up)"
                className="w-full px-3 py-2 rounded-xl border border-[#EAE3D6] bg-[#FAF7F2] focus:bg-white text-xs text-[#1C120C] font-mono outline-none focus:border-[#E6AF2E]"
              />
            </div>

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-1/3 py-3 rounded-2xl border border-[#EAE3D6] text-xs font-bold text-[#1C120C] hover:bg-[#FAF7F2]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-2xl bg-[#1C120C] hover:bg-[#2B1B10] active:scale-[0.99] text-[#FDF7EC] font-extrabold text-xs flex items-center justify-center gap-2 shadow-warm-sm transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-[#E6AF2E]" />
                    <span>Submitting Issue...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-[#E6AF2E]" />
                    <span>Submit Report</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
