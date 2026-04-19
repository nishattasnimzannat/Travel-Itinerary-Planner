import { useState, useEffect, useCallback } from 'react';
import { ArrowRightLeft, RefreshCw, Clock, WifiOff } from 'lucide-react';

// Static exchange rates relative to USD (1 USD = X)
const BASE_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 154.5,
  BDT: 110.5,
  CAD: 1.37,
  AUD: 1.55,
  INR: 83.4,
  SGD: 1.35,
  CHF: 0.88,
  CNY: 7.24,
  MXN: 17.15,
  BRL: 4.97,
  ZAR: 18.6,
  KRW: 1330,
  THB: 35.8,
  MYR: 4.72,
  PHP: 56.2,
  IDR: 15700,
  VND: 24500,
  SEK: 10.5,
  NOK: 10.7,
  DKK: 6.88,
  PLN: 4.02,
  CZK: 23.1,
  HUF: 357,
  RUB: 91.5,
  TRY: 30.2,
  AED: 3.67,
  SAR: 3.75,
  QAR: 3.64,
  KWD: 0.31,
  BHD: 0.38,
  OMR: 0.39,
  EGP: 30.9,
  NGN: 800,
  KES: 153,
  GHS: 12.5,
  PKR: 278,
  LKR: 325,
  NPR: 133,
  MMK: 2100,
  NZD: 1.67,
  HKD: 7.82,
  TWD: 31.5,
  ILS: 3.67,
  COP: 3950,
  ARS: 365,
  CLP: 890,
  PEN: 3.72,
  UAH: 37.5,
  RON: 4.59,
  BGN: 1.80,
};

const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
  BDT: 'Bangladeshi Taka', CAD: 'Canadian Dollar', AUD: 'Australian Dollar',
  INR: 'Indian Rupee', SGD: 'Singapore Dollar', CHF: 'Swiss Franc',
  CNY: 'Chinese Yuan', MXN: 'Mexican Peso', BRL: 'Brazilian Real',
  ZAR: 'South African Rand', KRW: 'South Korean Won', THB: 'Thai Baht',
  MYR: 'Malaysian Ringgit', PHP: 'Philippine Peso', IDR: 'Indonesian Rupiah',
  VND: 'Vietnamese Dong', SEK: 'Swedish Krona', NOK: 'Norwegian Krone',
  DKK: 'Danish Krone', PLN: 'Polish Zloty', CZK: 'Czech Koruna',
  HUF: 'Hungarian Forint', RUB: 'Russian Ruble', TRY: 'Turkish Lira',
  AED: 'UAE Dirham', SAR: 'Saudi Riyal', QAR: 'Qatari Riyal',
  KWD: 'Kuwaiti Dinar', BHD: 'Bahraini Dinar', OMR: 'Omani Rial',
  EGP: 'Egyptian Pound', NGN: 'Nigerian Naira', KES: 'Kenyan Shilling',
  GHS: 'Ghanaian Cedi', PKR: 'Pakistani Rupee', LKR: 'Sri Lankan Rupee',
  NPR: 'Nepalese Rupee', MMK: 'Myanmar Kyat', NZD: 'New Zealand Dollar',
  HKD: 'Hong Kong Dollar', TWD: 'Taiwan Dollar', ILS: 'Israeli Shekel',
  COP: 'Colombian Peso', ARS: 'Argentine Peso', CLP: 'Chilean Peso',
  PEN: 'Peruvian Sol', UAH: 'Ukrainian Hryvnia', RON: 'Romanian Leu',
  BGN: 'Bulgarian Lev',
};

const CURRENCIES = Object.keys(BASE_RATES).sort();

interface CachedRates {
  rates: Record<string, number>;
  timestamp: number;
}

function getCachedRates(): CachedRates | null {
  const raw = localStorage.getItem('currency_rates_cache');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setCachedRates(rates: Record<string, number>) {
  const data: CachedRates = { rates, timestamp: Date.now() };
  localStorage.setItem('currency_rates_cache', JSON.stringify(data));
}

function getRates(): { rates: Record<string, number>; stale: boolean; age: string } {
  const cached = getCachedRates();
  if (cached) {
    const ageMs = Date.now() - cached.timestamp;
    const ageHours = Math.floor(ageMs / 3600000);
    const ageDays = Math.floor(ageHours / 24);
    let ageStr = '';
    if (ageDays > 0) ageStr = `${ageDays}d ago`;
    else if (ageHours > 0) ageStr = `${ageHours}h ago`;
    else ageStr = 'just now';
    return { rates: cached.rates, stale: ageMs > 24 * 3600000, age: ageStr };
  }
  // First time: cache the static rates
  setCachedRates(BASE_RATES);
  return { rates: BASE_RATES, stale: false, age: 'just now' };
}

function convert(amount: number, from: string, to: string, rates: Record<string, number>): number {
  if (from === to) return amount;
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;
  return (amount / fromRate) * toRate;
}

export default function CurrencyConverter() {
  const [amount, setAmount] = useState<number>(100);
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [rateData, setRateData] = useState(getRates);

  const result = convert(amount, from, to, rateData.rates);
  const rate = convert(1, from, to, rateData.rates);

  const swap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, to]);

  const refreshRates = useCallback(() => {
    setCachedRates(BASE_RATES);
    setRateData(getRates());
  }, []);

  useEffect(() => {
    setRateData(getRates());
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-white">Currency Converter</h2>
        <p className="text-sm text-neutral-400 mt-0.5">Convert between {CURRENCIES.length}+ currencies for your trip budgeting</p>
      </div>

      {/* Stale rates warning */}
      {rateData.stale && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
          <WifiOff className="w-4 h-4 shrink-0" />
          <span>Rates may be outdated (cached {rateData.age}). Refresh when online for the latest rates.</span>
        </div>
      )}

      {/* Converter card */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-5">
        {/* Amount + From */}
        <div>
          <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">Amount</label>
          <div className="flex gap-3">
            <input
              type="number"
              min="0"
              step="0.01"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-purple-500 transition-colors"
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
            />
            <select
              className="w-32 bg-neutral-800 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              value={from}
              onChange={e => setFrom(e.target.value)}
            >
              {CURRENCIES.map(c => (
                <option key={c} value={c} className="bg-neutral-900">{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap button */}
        <div className="flex justify-center">
          <button
            onClick={swap}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="Swap currencies"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Result + To */}
        <div>
          <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">Converted To</label>
          <div className="flex gap-3">
            <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-emerald-400 text-lg font-semibold">
              {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <select
              className="w-32 bg-neutral-800 border border-white/10 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              value={to}
              onChange={e => setTo(e.target.value)}
            >
              {CURRENCIES.map(c => (
                <option key={c} value={c} className="bg-neutral-900">{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Exchange rate info */}
        <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-white/5">
          <span>1 {from} = {rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {to}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Updated {rateData.age}
            </span>
            <button onClick={refreshRates} className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors" title="Refresh rates">
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Quick reference table */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <h3 className="text-sm font-semibold text-white mb-4">Quick Reference — 1 {from} equals</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CURRENCIES.filter(c => c !== from).slice(0, 12).map(c => (
            <div key={c} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 text-sm">
              <span className="text-neutral-400">{c} <span className="text-neutral-600 text-xs hidden sm:inline">({CURRENCY_NAMES[c]})</span></span>
              <span className="text-white font-medium">{convert(1, from, c, rateData.rates).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
