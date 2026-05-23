import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { checkInApi } from '../api/attendance.api';
import { useAuth } from '../store/authContext';
import { QrCode, Keyboard, CheckCircle2, XCircle, Send } from 'lucide-react';

export default function AttendanceCheckIn() {
  const { user } = useAuth();
  const [mode, setMode] = useState('manual'); // 'qr' | 'manual'
  const [manualInput, setManualInput] = useState('');
  const [result, setResult] = useState(null); // { success, member, error }
  const scannerRef = useRef(null);
  const clearTimer = useRef(null);

  const mutation = useMutation({
    mutationFn: checkInApi,
    onSuccess: (res) => {
      const member = res.data.data;
      setResult({ success: true, member });
      setManualInput('');
      // Auto-clear after 4 seconds
      clearTimer.current = setTimeout(() => setResult(null), 4000);
    },
    onError: (err) => {
      const msg = err.response?.data?.error || 'Check-in failed. Member not found or invalid code.';
      setResult({ success: false, error: msg });
      clearTimer.current = setTimeout(() => setResult(null), 4000);
    },
  });

  // QR Scanner setup
  useEffect(() => {
    if (mode !== 'qr') return;

    let scanner;

    const initScanner = async () => {
      try {
        const { Html5QrcodeScanner } = await import('html5-qrcode');
        scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: 250 }, false);

        scanner.render(
          (decodedText) => {
            scanner.clear().catch(() => {});
            handleCheckIn(decodedText);
          },
          () => {
            // Ignore scan errors
          }
        );
        scannerRef.current = scanner;
      } catch (err) {
        console.error('Failed to load QR scanner:', err);
        toast.error('Camera access failed. Please use manual input.');
        setMode('manual');
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    };
  }, [mode]);

  useEffect(() => {
    return () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
    };
  }, []);

  const handleCheckIn = (code) => {
    if (!code?.trim() || mutation.isPending) return;
    const gymId = user?.gymId;
    if (!gymId) return toast.error('No gym associated with your account');

    // Try to determine if it's a QR code (starts with GYM-) or barcode (numeric)
    const isQr = /^GYM-/.test(code.trim());
    const payload = isQr
      ? { qrCode: code.trim(), gymId }
      : { barcodeValue: code.trim(), gymId };

    mutation.mutate(payload);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    handleCheckIn(manualInput);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Attendance Check-In</h1>
        <p className="text-sm text-gray-400 mt-1">Scan QR code or enter member ID manually</p>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-gray-900/60 border border-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setMode('manual')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'manual' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <Keyboard size={16} />Manual
        </button>
        <button
          onClick={() => setMode('qr')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'qr' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
        >
          <QrCode size={16} />QR Scanner
        </button>
      </div>

      {/* Result Card */}
      {result && (
        <div className={`rounded-2xl border p-5 flex items-center gap-4 transition-all ${
          result.success
            ? 'bg-emerald-900/30 border-emerald-500/30'
            : 'bg-red-900/30 border-red-500/30'
        }`}>
          {result.success ? (
            <CheckCircle2 size={36} className="text-emerald-400 shrink-0" />
          ) : (
            <XCircle size={36} className="text-red-400 shrink-0" />
          )}
          <div>
            {result.success ? (
              <>
                <p className="font-semibold text-white text-lg">{result.member?.member?.fullName || 'Member'}</p>
                <p className="text-sm text-emerald-400 mt-0.5">
                  Check-in successful at {new Date(result.member?.checkInAt || Date.now()).toLocaleTimeString()}
                </p>
                {result.member?.memberMembership?.status && (
                  <p className="text-xs text-gray-400 mt-1">Membership: {result.member.memberMembership.status}</p>
                )}
              </>
            ) : (
              <>
                <p className="font-semibold text-red-300">Check-in Failed</p>
                <p className="text-sm text-red-400 mt-0.5">{result.error}</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Manual Input */}
      {mode === 'manual' && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Keyboard size={18} className="text-indigo-400" />
            Manual Check-In
          </h2>
          <form onSubmit={handleManualSubmit} className="flex gap-3">
            <input
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Enter QR code, barcode value, or member ID..."
              autoFocus
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-colors"
            />
            <button
              type="submit"
              disabled={!manualInput.trim() || mutation.isPending}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
              {mutation.isPending ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Check In
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-3">
            Tip: Scan barcode with USB scanner or type the QR/barcode value above.
          </p>
        </div>
      )}

      {/* QR Scanner */}
      {mode === 'qr' && (
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <QrCode size={18} className="text-indigo-400" />
            QR Code Scanner
          </h2>
          <div id="qr-reader" className="w-full rounded-xl overflow-hidden" />
          <p className="text-xs text-gray-500 mt-3 text-center">
            Point the camera at the member's QR code to check in automatically.
          </p>
        </div>
      )}
    </div>
  );
}
