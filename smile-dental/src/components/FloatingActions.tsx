import React from 'react';
import { MessageSquare, Phone } from 'lucide-react';

interface FloatingActionsProps {
  onOpenChat: () => void;
  phone?: string;
  whatsappNumber?: string;
}

export const FloatingActions: React.FC<FloatingActionsProps> = ({
  onOpenChat,
  phone = '+923001234567',
  whatsappNumber = '+923001234567',
}) => {
  const cleanDigits = phone.replace(/\D/g, '');
  const dialNumber = phone.startsWith('+')
    ? `+${cleanDigits}`
    : cleanDigits.startsWith('92')
      ? `+${cleanDigits}`
      : cleanDigits.startsWith('03')
        ? `+92${cleanDigits.slice(1)}`
        : `+92${cleanDigits}`;
  const cleanWa = whatsappNumber.replace(/\D/g, '');

  return (
    <aside aria-label="Quick contact actions" className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 select-none">
      {/* Call Button */}
      <a
        href={`tel:${dialNumber}`}
        aria-label="Call clinic directly"
        className="w-12 h-12 rounded-full bg-forest-800 text-white flex items-center justify-center shadow-soft-lg hover:bg-forest-900 transition-all duration-200 transform hover:scale-110 active:scale-95 group relative"
      >
        <Phone className="w-5 h-5 text-clinic-lightGreen" />
        <span className="absolute right-14 bg-forest-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
          Call 0300-1234567
        </span>
      </a>

      {/* WhatsApp Button */}
      <a
        href={`https://wa.me/${cleanWa}?text=Assalam-o-Alaikum%20Smile%20Dental%20Clinic,%20I%20would%20like%20to%20book%20an%20appointment.`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-soft-lg hover:bg-[#1EBE5D] transition-all duration-200 transform hover:scale-110 active:scale-95 group relative"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
        <span className="absolute right-14 bg-forest-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
          WhatsApp Chat
        </span>
      </a>

      {/* Web Chatbot Launcher */}
      <button
        onClick={onOpenChat}
        aria-label="Open clinic AI assistant"
        className="w-14 h-14 rounded-full bg-clinic-primary text-white flex items-center justify-center shadow-soft-lg hover:bg-clinic-primaryHover transition-all duration-200 transform hover:scale-105 active:scale-95 group relative border-2 border-clinic-lightGreen"
      >
        <MessageSquare className="w-6 h-6 text-white" />
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        <span className="absolute right-16 bg-forest-900 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
          Ask Bot / Book Online
        </span>
      </button>
    </aside>
  );
};
