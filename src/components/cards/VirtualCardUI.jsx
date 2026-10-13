import React from 'react';
import { Shield, Lock } from 'lucide-react';

const formatCardNumberGroup = (num) => {
  if (!num) return '••••  ••••  ••••  ****';
  const clean = num.replace(/\s+/g, '');
  return clean.replace(/(.{4})/g, '$1 ').trim();
};

const renderNetworkLogo = (network) => {
  const net = (network || 'visa').toLowerCase();
  if (net === 'mastercard') {
    return (
      <div className="flex items-center -space-x-2" title="MasterCard">
        <div className="w-6 h-6 rounded-full bg-red-500/90 shadow-sm"></div>
        <div className="w-6 h-6 rounded-full bg-amber-400/90 shadow-sm"></div>
      </div>
    );
  } else if (net === 'american_express' || net === 'amex') {
    return (
      <div className="bg-blue-600 px-2 py-0.5 rounded font-black text-[10px] tracking-tighter text-white border border-white/40">
        AMEX
      </div>
    );
  } else if (net === 'discover') {
    return (
      <div className="flex items-center font-extrabold text-xs tracking-tight text-orange-400">
        DISCOVER
      </div>
    );
  } else {
    return (
      <div className="font-black italic text-lg tracking-wider text-white drop-shadow-sm">
        VISA
      </div>
    );
  }
};

const VirtualCardUI = ({ card, revealed, onReveal, onFreeze }) => {
  const isFrozen = card?.status === 'frozen';

  return (
    <div className={`relative w-full max-w-sm h-56 rounded-2xl p-6 text-white shadow-2xl transition-all overflow-hidden ${
      isFrozen ? 'grayscale opacity-80' : 'bg-gradient-to-br from-chase-navy via-chase-mid to-chase-blue'
    }`}>
      {/* Abstract Shapes */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-chase-blue/20 rounded-full blur-2xl"></div>

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="font-serif font-bold text-lg tracking-tight text-amber-200">CitiGate Bank <span className="font-sans font-normal opacity-70 text-xs">Virtual</span></div>
          <div className="flex flex-col items-end gap-1">
            <p className="text-[10px] uppercase font-bold opacity-50">Card Network</p>
            {renderNetworkLogo(card?.network)}
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold opacity-50 tracking-widest">Card Number</p>
          <p className="text-xl font-mono tracking-[0.15em] font-bold">
            {revealed ? formatCardNumberGroup(card?.card_number) : '••••  ••••  ••••  ' + (card?.card_number_last4 || '****')}
          </p>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] uppercase font-bold opacity-50">Expiry</p>
            <p className="font-bold">{revealed ? card?.expiry : '••/••'}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold opacity-50">CVV</p>
            <p className="font-bold">{revealed ? card?.cvv : '•••'}</p>
          </div>
          <Shield size={24} className="opacity-50" />
        </div>
      </div>

      {isFrozen && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-20 rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <Lock size={32} />
            <span className="font-black uppercase tracking-widest text-sm">Card Frozen</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualCardUI;
