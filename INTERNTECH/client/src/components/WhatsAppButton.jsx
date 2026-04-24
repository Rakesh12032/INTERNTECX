import React from "react";
import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/917667844210"
      target="_blank"
      rel="noreferrer"
      className="group fixed bottom-6 left-6 z-40 flex items-center gap-3"
      aria-label="Chat with us on WhatsApp"
    >
      <span className="hidden rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white shadow-lg group-hover:block">
        Chat with us on WhatsApp
      </span>
      <span className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-2xl">
        <span className="absolute inset-0 animate-ping rounded-full bg-green-400/40" />
        <MessageCircle className="relative h-6 w-6" />
      </span>
    </a>
  );
}
