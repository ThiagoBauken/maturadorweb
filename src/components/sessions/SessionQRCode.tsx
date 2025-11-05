
import React, { useState, useEffect } from 'react';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { whatsAppApi } from '@/services/whatsapp-api';
import { useSessions } from '@/hooks/useSessions';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SessionQRCodeProps {
  sessionId: string;
}

export const SessionQRCode: React.FC<SessionQRCodeProps> = ({ sessionId }) => {
  const [status, setStatus] = useState<'loading' | 'ready' | 'connected' | 'error'>('loading');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { generateQRCode, connectSession } = useSessions();

  // Load QR code on mount
  useEffect(() => {
    fetchQRCode();

    // Poll for session status every 5 seconds
    const interval = setInterval(checkSessionStatus, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  // Fetch QR code from the API
  const fetchQRCode = async () => {
    try {
      setStatus('loading');
      setError(null);

      // Get QR code from API
      const result = await whatsAppApi.generateQRCode(sessionId);

      if (result && result.qrCode) {
        setQrCode(result.qrCode);
        setStatus('ready');
      } else {
        setError('Failed to generate QR code. Please try again.');
        setStatus('error');
      }
    } catch (err) {
      console.error('Error getting QR code:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to generate QR code: ${errorMessage}`);
      setStatus('error');
    }
  };

  // Check if session is connected
  const checkSessionStatus = async () => {
    if (status === 'connected') return;

    try {
      const session = await whatsAppApi.getSession(sessionId);

      if (session && session.status === 'connected') {
        setStatus('connected');
        toast.success('WhatsApp session connected successfully!');
      }
    } catch (err) {
      // Silently fail - we'll try again
      console.error('Error checking session status:', err);
    }
  };

  const handleRefresh = () => {
    fetchQRCode();
  };

  const handleManualConnect = async () => {
    try {
      setStatus('loading');
      await whatsAppApi.connectWithQR(sessionId);
      setStatus('connected');
      toast.success('WhatsApp session connected successfully!');
    } catch (err) {
      console.error('Error connecting session:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to connect session: ${errorMessage}`);
      setStatus('error');
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Connect WhatsApp</DialogTitle>
        <DialogDescription>
          Scan the QR code with your WhatsApp app to connect
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col items-center justify-center py-6">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Generating QR code...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center h-64">
            <Alert variant="destructive" className="mb-4 max-w-xs">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'Failed to generate QR code. Please try again.'}
              </AlertDescription>
            </Alert>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          </div>
        )}

        {status === 'ready' && qrCode && (
          <>
            <div className="border-2 border-primary/50 p-2 rounded-lg mb-4">
              {/* Display the actual QR code from the API */}
              <img
                src={`data:image/png;base64,${qrCode}`}
                alt="WhatsApp QR Code"
                width="200"
                height="200"
                className="qr-code"
              />
            </div>
            <p className="text-sm text-center max-w-xs text-muted-foreground mb-4">
              Open WhatsApp on your phone, tap Menu or Settings and select WhatsApp Web
            </p>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh QR Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={handleManualConnect}
            >
              Connect Manually
            </Button>
          </>
        )}

        {status === 'connected' && (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="rounded-full bg-green-100 p-4 mb-4">
              <Check className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">Connected Successfully!</h3>
            <p className="text-sm text-center text-muted-foreground">
              Your WhatsApp session is now connected and ready to use
            </p>
          </div>
        )}
      </div>
    </>
  );
};
