import React, { useState } from 'react';
import {
  ArrowLeftRight,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Save,
  CheckCircle,
  Coins,
  Globe,
} from 'lucide-react';
import { useLoanContext } from '../context/LoanContext';

export const ExchangeRateConfig: React.FC = () => {
  const {
    exchangeRate,
    updateExchangeRate,
    totalActiveCapital,
    totalOverdueCapital,
    formatMoney,
  } = useLoanContext();

  const [usdBuy, setUsdBuy] = useState(exchangeRate.usdBuy);
  const [usdSell, setUsdSell] = useState(exchangeRate.usdSell);
  const [eurBuy, setEurBuy] = useState(exchangeRate.eurBuy);
  const [eurSell, setEurSell] = useState(exchangeRate.eurSell);
  const [symbol, setSymbol] = useState(exchangeRate.symbol);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Converter state
  const [calcAmount, setCalcAmount] = useState<number>(1000);
  const [calcDirection, setCalcDirection] = useState<'USD_TO_LOCAL' | 'LOCAL_TO_USD'>('USD_TO_LOCAL');

  const [rateType, setRateType] = useState<'PARALELO' | 'OFICIAL'>(exchangeRate.rateType || 'PARALELO');
  const [rateName, setRateName] = useState<string>(exchangeRate.rateName || 'Mercado Paralelo Bolivia (Dólar Blue / Libre)');

  // Official BCB constants for comparison
  const officialBcbBuy = 6.86;
  const officialBcbSell = 6.96;

  // Spread calculation over official BCB sell rate
  const spreadPercent = usdSell > officialBcbSell
    ? (((usdSell - officialBcbSell) / officialBcbSell) * 100).toFixed(1)
    : '0.0';

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    updateExchangeRate({
      baseCurrency: 'USD',
      rateType,
      rateName,
      usdBuy: Number(usdBuy),
      usdSell: Number(usdSell),
      officialBuy: officialBcbBuy,
      officialSell: officialBcbSell,
      eurBuy: Number(eurBuy),
      eurSell: Number(eurSell),
      symbol,
      lastUpdated: new Date().toLocaleString('es-BO') + ` (${rateType === 'PARALELO' ? 'T.C. Paralelo' : 'T.C. Oficial'})`,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const convertedResult =
    calcDirection === 'USD_TO_LOCAL'
      ? calcAmount * usdSell
      : calcAmount / (usdBuy || 1);

  const convertedResultOfficial =
    calcDirection === 'USD_TO_LOCAL'
      ? calcAmount * officialBcbSell
      : calcAmount / officialBcbBuy;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-400 text-slate-950 flex items-center justify-center font-black shadow-xs">
            <ArrowLeftRight className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Tipo de Cambio en Moneda Boliviana (Dólar Paralelo / Blue)
              </h2>
              <span className="text-[10px] font-black bg-yellow-400 text-slate-950 px-2 py-0.5 rounded shadow-xs uppercase tracking-wide">
                Régimen Paralelo Activo
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Configuración ajustada al <strong>mercado paralelo de Bolivia</strong> para operaciones de crédito, desembolsos, cobros de mora y equivalencias en Bolivianos (Bs).
            </p>
          </div>
        </div>

        <div className="text-right text-xs">
          <span className="text-slate-400 block text-[10px]">Última Actualización</span>
          <span className="font-semibold text-slate-700">{exchangeRate.lastUpdated}</span>
        </div>
      </div>

      {/* Comparison Cards: Paralelo vs Oficial */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-900 text-white p-4 rounded-xl border border-blue-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-yellow-300 uppercase tracking-wide">
              T.C. Paralelo Activo (Venta)
            </span>
            <span className="text-[10px] font-black bg-yellow-400 text-slate-950 px-1.5 py-0.2 rounded">
              EN USO
            </span>
          </div>
          <div className="text-2xl font-black mt-2 text-white">
            {symbol} {Number(usdSell).toFixed(2)}
          </div>
          <div className="text-[11px] text-blue-200 mt-1">
            Compra: {symbol} {Number(usdBuy).toFixed(2)} · Cotización real del mercado
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Oficial BCB Congelado
            </span>
            <span className="text-[10px] font-semibold bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded">
              REFERENCIAL
            </span>
          </div>
          <div className="text-2xl font-black mt-2 text-slate-700">
            {symbol} {officialBcbSell.toFixed(2)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Compra: {symbol} {officialBcbBuy.toFixed(2)} · Tasa congelada por el BCB
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-300 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">
              Brecha Cambiaria Mercado
            </span>
            <TrendingUp className="w-4 h-4 text-amber-700" />
          </div>
          <div className="text-2xl font-black mt-2 text-amber-900">
            +{spreadPercent}%
          </div>
          <div className="text-[11px] text-amber-800 mt-1">
            Diferencial paralelo vs tipo oficial regulado
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form: Configurar Tasas */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Coins className="w-4 h-4 text-blue-700" />
              Tasas de Cotización del Dólar y Euro
            </h3>
            <span className="text-[10px] font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
              Bolivia (BOB / Bs)
            </span>
          </div>

          {/* Quick Preset Buttons */}
          <div className="bg-blue-50/70 p-3 rounded-lg border border-blue-200 text-xs">
            <span className="font-bold text-blue-950 block mb-1.5">Presintonías Rápidas de Bolivia:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setUsdBuy(12.80);
                  setUsdSell(13.20);
                  setEurBuy(13.80);
                  setEurSell(14.30);
                  setSymbol('Bs');
                  setRateType('PARALELO');
                  setRateName('Mercado Paralelo Bolivia (Estándar)');
                }}
                className={`px-2.5 py-1.5 rounded font-bold text-[11px] transition-colors cursor-pointer border ${
                  usdSell === 13.20
                    ? 'bg-yellow-400 text-slate-950 border-yellow-500 shadow-xs'
                    : 'bg-white hover:bg-blue-100 text-blue-900 border-blue-300'
                }`}
              >
                ⭐ Paralelo Estándar (12.80 / 13.20 Bs)
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsdBuy(13.50);
                  setUsdSell(14.10);
                  setEurBuy(14.50);
                  setEurSell(15.20);
                  setSymbol('Bs');
                  setRateType('PARALELO');
                  setRateName('Mercado Paralelo Alto / Cripto P2P');
                }}
                className={`px-2.5 py-1.5 rounded font-bold text-[11px] transition-colors cursor-pointer border ${
                  usdSell === 14.10
                    ? 'bg-yellow-400 text-slate-950 border-yellow-500 shadow-xs'
                    : 'bg-white hover:bg-blue-100 text-blue-900 border-blue-300'
                }`}
              >
                Paralelo Alto / P2P (13.50 / 14.10 Bs)
              </button>
              <button
                type="button"
                onClick={() => {
                  setUsdBuy(6.86);
                  setUsdSell(6.96);
                  setEurBuy(7.45);
                  setEurSell(7.60);
                  setSymbol('Bs');
                  setRateType('OFICIAL');
                  setRateName('Oficial BCB Congelado');
                }}
                className={`px-2.5 py-1.5 rounded font-semibold text-[11px] transition-colors cursor-pointer border ${
                  usdSell === 6.96
                    ? 'bg-slate-700 text-white border-slate-800 shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                }`}
              >
                Oficial BCB (6.86 / 6.96 Bs)
              </button>
            </div>
          </div>

          <form onSubmit={handleSaveRates} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Símbolo Moneda Local
                </label>
                <input
                  type="text"
                  value={symbol}
                  onChange={e => setSymbol(e.target.value)}
                  placeholder="Ej: Bs"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Régimen de Cotización
                </label>
                <select
                  value={rateType}
                  onChange={e => setRateType(e.target.value as 'PARALELO' | 'OFICIAL')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold bg-white"
                >
                  <option value="PARALELO">Tipo de Cambio Paralelo (Mercado Libre)</option>
                  <option value="OFICIAL">Tipo de Cambio Oficial (BCB)</option>
                </select>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-xs">
                  Dólar Estadounidense (USD) · {rateType === 'PARALELO' ? 'Cotización Paralela' : 'Oficial'}
                </h4>
                <span className="text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  {rateType}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tipo de Cambio COMPRA
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={usdBuy}
                    onChange={e => setUsdBuy(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Tipo de Cambio VENTA
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={usdSell}
                    onChange={e => setUsdSell(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-black text-amber-700"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs">
                Euro (EUR) - Referencial
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    EUR Compra
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={eurBuy}
                    onChange={e => setEurBuy(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    EUR Venta
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    value={eurSell}
                    onChange={e => setEurSell(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-yellow-400 hover:bg-yellow-300 text-slate-950 rounded-lg font-black text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm shadow-yellow-500/20"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-slate-950" />
                  <span>¡Tasas Actualizadas Exitosamente!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-slate-950" />
                  <span>Guardar y Aplicar en Todo el Sistema</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Interactive Converter & Portfolio Valuation */}
        <div className="space-y-6">
          {/* Interactive Converter */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
              <RefreshCw className="w-4 h-4 text-blue-600" />
              Calculadora Rápida de Conversión
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCalcDirection('USD_TO_LOCAL')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    calcDirection === 'USD_TO_LOCAL'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  $ USD ➔ {symbol} Bolivianos
                </button>
                <button
                  type="button"
                  onClick={() => setCalcDirection('LOCAL_TO_USD')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-colors cursor-pointer ${
                    calcDirection === 'LOCAL_TO_USD'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {symbol} Bolivianos ➔ $ USD
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Monto a Convertir:
                </label>
                <input
                  type="number"
                  min="0"
                  value={calcAmount}
                  onChange={e => setCalcAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900 text-sm"
                />
              </div>

              {/* Converted Box */}
              <div className="bg-yellow-50/70 border border-yellow-300 p-4 rounded-xl text-center space-y-2">
                <span className="text-[11px] text-slate-800 font-bold uppercase tracking-wider block">
                  Resultado al T.C. Paralelo (Venta {usdSell.toFixed(2)} Bs)
                </span>
                <span className="text-3xl font-black text-slate-950 block">
                  {calcDirection === 'USD_TO_LOCAL'
                    ? `${symbol} ${convertedResult.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : `$ ${convertedResult.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                </span>
                <div className="pt-2 border-t border-yellow-200/80 flex items-center justify-between text-[11px] text-slate-600 px-2">
                  <span>Al T.C. Oficial BCB ({officialBcbSell.toFixed(2)} Bs):</span>
                  <span className="font-bold text-slate-800">
                    {calcDirection === 'USD_TO_LOCAL'
                      ? `${symbol} ${convertedResultOfficial.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                      : `$ ${convertedResultOfficial.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                  </span>
                </div>
                {calcDirection === 'USD_TO_LOCAL' && (
                  <div className="text-[10px] text-amber-800 font-bold bg-amber-100 py-1 px-2 rounded">
                    Diferencia de Mercado Paralelo: +{symbol} {(convertedResult - convertedResultOfficial).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Portfolio Impact in Local Currency */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-800 text-xs uppercase flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-700" />
                Impacto en Cartera en Moneda Boliviana
              </h4>
              <span className="text-[10px] font-black bg-yellow-400 text-slate-950 px-1.5 py-0.5 rounded">
                T.C. Paralelo {usdSell.toFixed(2)} Bs
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Capital Activo en USD:</span>
                <span className="font-bold text-slate-800">$ {totalActiveCapital.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Equivalente al T.C. Paralelo ({symbol}):</span>
                <span className="font-black text-blue-900">
                  {symbol} {(totalActiveCapital * usdSell).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-500">
                <span>Al T.C. Oficial BCB ({officialBcbSell.toFixed(2)} Bs):</span>
                <span className="font-semibold text-slate-600">
                  {symbol} {(totalActiveCapital * officialBcbSell).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between py-1.5 bg-red-50/70 p-2 rounded border border-red-200">
                <span className="text-red-900 font-bold">Cartera Vencida (Mora Crítica) al T.C. Paralelo:</span>
                <span className="font-black text-red-700">
                  {symbol} {(totalOverdueCapital * usdSell).toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
