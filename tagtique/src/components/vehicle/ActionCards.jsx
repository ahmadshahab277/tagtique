import React from 'react';
import { Phone, MessageSquare, AlertTriangle, AlertCircle, ChevronRight } from 'lucide-react';

export default function ActionCards({
  onContactDriver,
  onSendMessage,
  onEmergencyAlert,
  onReportIssue
}) {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Main Message Heading */}
      <div className="flex flex-col text-left px-1">
        <h1 className="font-baloo font-extrabold text-2xl sm:text-3xl text-[#1C120C] tracking-tight leading-tight">
          How can we help?
        </h1>
        <p className="text-xs sm:text-sm text-[#8C7A6B] font-medium mt-0.5">
          Choose an option below to contact the vehicle owner or report an issue.
        </p>
      </div>

      {/* The 4 Action Cards */}
      <div className="grid grid-cols-1 gap-3 sm:gap-3.5">
        
        {/* CARD A: CONTACT DRIVER */}
        <button
          type="button"
          onClick={onContactDriver}
          className="w-full min-h-[72px] p-4 sm:p-4.5 rounded-2xl bg-white border border-[#EAE3D6] hover:border-[#1C120C]/30 hover:bg-[#FAF7F2] active:scale-[0.99] transition-all flex items-center justify-between text-left group shadow-xs cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] flex items-center justify-center text-[#1C120C] group-hover:bg-[#1C120C] group-hover:text-[#E6AF2E] transition-colors shrink-0 shadow-2xs">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-[#1C120C]">
                Contact Driver
              </span>
              <span className="text-xs text-[#8C7A6B] font-medium leading-relaxed mt-0.5">
                Call the driver from your phone SIM.
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#A89889] group-hover:text-[#1C120C] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </button>

        {/* CARD B: SEND MESSAGE */}
        <button
          type="button"
          onClick={onSendMessage}
          className="w-full min-h-[72px] p-4 sm:p-4.5 rounded-2xl bg-white border border-[#EAE3D6] hover:border-[#1C120C]/30 hover:bg-[#FAF7F2] active:scale-[0.99] transition-all flex items-center justify-between text-left group shadow-xs cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-center text-[#975A16] group-hover:bg-[#975A16] group-hover:text-white transition-colors shrink-0 shadow-2xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-[#1C120C]">
                Send a Message
              </span>
              <span className="text-xs text-[#8C7A6B] font-medium leading-relaxed mt-0.5">
                Send a text or a WhatsApp message to the driver.
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#A89889] group-hover:text-[#1C120C] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </button>

        {/* CARD C: EMERGENCY ALERT (Distinct Urgency Styling) */}
        <button
          type="button"
          onClick={onEmergencyAlert}
          className="w-full min-h-[76px] p-4 sm:p-4.5 rounded-2xl bg-gradient-to-r from-red-500/5 via-rose-500/10 to-red-500/5 border-2 border-red-400 hover:border-red-500 hover:bg-red-50 active:scale-[0.99] transition-all flex items-center justify-between text-left group shadow-xs cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-warm-sm group-hover:scale-105 transition-transform shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-red-950">
                  Emergency Alert
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold tracking-wide uppercase shadow-2xs">
                  Urgent
                </span>
              </div>
              <span className="text-xs text-red-900/80 font-medium leading-relaxed mt-0.5">
                Send an urgent alert to the registered vehicle owner.
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-red-500 group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
        </button>

        {/* CARD D: REPORT AN ISSUE */}
        <button
          type="button"
          onClick={onReportIssue}
          className="w-full min-h-[72px] p-4 sm:p-4.5 rounded-2xl bg-white border border-[#EAE3D6] hover:border-[#1C120C]/30 hover:bg-[#FAF7F2] active:scale-[0.99] transition-all flex items-center justify-between text-left group shadow-xs cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#FAF7F2] border border-[#EAE3D6] flex items-center justify-center text-[#8C7A6B] group-hover:bg-[#8C7A6B] group-hover:text-white transition-colors shrink-0 shadow-2xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base text-[#1C120C]">
                Report an Issue
              </span>
              <span className="text-xs text-[#8C7A6B] font-medium leading-relaxed mt-0.5">
                Let the vehicle owner know about a problem.
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#A89889] group-hover:text-[#1C120C] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
        </button>

      </div>
    </div>
  );
}
