import { useMemo } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

interface TableQRCodeProps {
  tableNumber: number;
  qrCodeUrl: string; // The actual menu URL to encode (e.g., http://localhost:5173/menu?restaurant=slug&table=id)
  baseUrlOverride?: string;
}

export function TableQRCode({ tableNumber, qrCodeUrl, baseUrlOverride }: TableQRCodeProps) {
  // If override is provided, swap the host portion while keeping the path + query params
  const finalQrUrl = useMemo(() => {
    if (!baseUrlOverride || !baseUrlOverride.trim()) return qrCodeUrl;
    try {
      const original = new URL(qrCodeUrl);
      const override = new URL(baseUrlOverride.trim());
      // Replace origin but keep path and search params
      return `${override.origin}${original.pathname}${original.search}`;
    } catch {
      // If URLs can't be parsed, just return original
      return qrCodeUrl;
    }
  }, [qrCodeUrl, baseUrlOverride]);

  const downloadQR = () => {
    const canvas = document.getElementById(`qr-table-${tableNumber}`) as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `table-${tableNumber}-qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="flex flex-col items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 hover:scale-[1.02] transition-transform duration-300">
      <div className="mb-4 text-center">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-600 mb-1">DineSmart Online</h4>
        <div className="h-0.5 w-8 bg-brand-500 mx-auto rounded-full" />
      </div>
      
      <div className="relative p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-4">
        <QRCodeCanvas
          id={`qr-table-${tableNumber}`}
          value={finalQrUrl}
          size={180}
          level="H"
          includeMargin={true}
          fgColor="#0f172a"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <span className="text-4xl">🍽️</span>
        </div>
      </div>

      <div className="w-full text-center space-y-3">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Table Number</p>
          <p className="text-3xl font-black text-slate-900 leading-none">{tableNumber}</p>
        </div>
        
        <p className="text-[9px] font-medium text-slate-400 max-w-[180px] break-all border-t border-slate-100 pt-3" title={finalQrUrl}>
          {finalQrUrl}
        </p>

        <div className="flex gap-2 pt-2">
          <button 
            onClick={downloadQR}
            className="flex-1 py-3 bg-slate-900 text-white rounded-2xl text-[11px] font-bold hover:bg-black transition-all active:scale-95 shadow-lg shadow-black/10"
          >
            Download Print
          </button>
          <button 
            onClick={() => {
              navigator.clipboard.writeText(finalQrUrl);
              alert('Link copied to clipboard!');
            }}
            className="p-3 bg-slate-100 text-slate-600 rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
            title="Copy URL"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
