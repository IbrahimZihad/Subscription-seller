"use client";
import { useState } from "react";
import { X, Send, MessageCircle } from "lucide-react";

interface Props {
  phone: string;
}

export default function WhatsAppWidget({ phone }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const cleanPhone = phone.replace(/\D/g, "");

  const handleSend = () => {
    const text = message.trim() || "Hello! I'm interested in a subscription.";
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
    setMessage("");
  };

  return (
    <>
      {/* Chat window */}
      <div
        className={`fixed bottom-24 right-4 sm:right-6 z-50 transition-all duration-300 origin-bottom-right ${
          open ? "scale-100 opacity-100" : "scale-75 opacity-0 pointer-events-none"
        }`}
      >
        <div className="w-80 bg-dark-800 border border-dark-600 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm font-heading">Subscriptions BD</p>
                <p className="text-green-100 text-xs font-body flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse inline-block" />
                  Online — Reply within minutes
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Chat bubble */}
          <div className="p-4 bg-dark-900/60">
            <div className="bg-dark-700 rounded-xl rounded-tl-sm p-3 max-w-[85%] mb-1">
              <p className="text-slate-200 text-sm font-body leading-relaxed">
                👋 Hi there! How can I help you today? Ask about any subscription!
              </p>
              <p className="text-slate-500 text-xs mt-1">Subscriptions BD</p>
            </div>
          </div>

          {/* Input */}
          <div className="px-3 pb-3 flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="flex-1 bg-dark-700 border border-dark-600 rounded-xl px-3 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-green-500/50 font-body"
            />
            <button
              onClick={handleSend}
              className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center wa-glow transition-all duration-200 hover:scale-110 active:scale-95"
        aria-label="Chat on WhatsApp"
      >
        {open ? (
          <X size={24} className="text-white" />
        ) : (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        )}
      </button>
    </>
  );
}
