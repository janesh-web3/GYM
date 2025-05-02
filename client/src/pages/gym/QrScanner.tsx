import React, { useState, useEffect } from 'react';
import { Scanner as QrScanner } from '@yudiel/react-qr-scanner';
import { coinService } from '../../lib/coinServices';
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/Card';
// import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { AlertCircle, CheckCircle, XCircle, QrCode } from 'lucide-react';
// import { useToast } from '../../components/ui/use-toast';
import { Button, Card, CardHeader } from '../../components/ui';
import { useToast } from '../../components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert';

type ScanResult = {
  success: boolean;
  message: string;
  memberName?: string;
  coinBalance?: number;
};

const GymQrScanner: React.FC = () => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [gymId, setGymId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Get gym data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    // Check if user has a gym
    if (user.gym?._id) {
      setGymId(user.gym._id);
    }
  }, []);
  
  const handleScan = async (data: string) => {
    if (!data || !gymId) return;
    
    setIsScanning(false);
    setErrorMessage(null);
    
    try {
      // Parse QR data
      const qrData = JSON.parse(data);
      
      // Validate QR data format
      if (!qrData.memberId || qrData.type !== 'member') {
        throw new Error('Invalid QR code format');
      }
      
      // Process the scan
      const result = await coinService.useCoin(qrData.memberId, gymId);
      
      setScanResult({
        success: true,
        message: typeof result === 'object' && result !== null ? (result as any).message || 'Access granted' : 'Access granted',
        memberName: typeof result === 'object' && result !== null ? (result as any).memberName || 'Member' : 'Member',
        coinBalance: typeof result === 'object' && result !== null ? (result as any).coinBalance || 0 : 0
      });
      toast({
        title: "Access Granted",
        description: "Member has been granted access to the gym.",
        variant: "success"
      });
    } catch (error: any) {
      console.error('QR Scan error:', error);
      
      setScanResult({
        success: false,
        message: error.message || 'Failed to process QR code'
      });
      
      toast({
        variant: "destructive",
        title: "Scan Failed",
        description: error.message || 'Could not process the QR code'
      });
    }
  };
  
  const handleError = (error: any) => {
    console.error('QR Scanner error:', error);
    setErrorMessage('Could not access camera. Please check permissions and try again.');
    setIsScanning(false);
  };
  
  const resetScan = () => {
    setScanResult(null);
    setErrorMessage(null);
    setIsScanning(true);
  };
  
  if (!gymId) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <title>QR Scanner</title>
            <p>Scan member QR codes to grant gym access</p>
          </CardHeader>
          <div>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                No gym associated with your account. Please set up your gym profile first.
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <h2>QR Scanner</h2>
          <p>Scan member QR codes to grant gym access</p>
        </CardHeader>
        <div>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          
          {scanResult && (
            <div className={`p-4 mb-6 rounded-lg border ${scanResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-3">
                {scanResult.success ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                <div>
                  <h3 className="font-semibold">
                    {scanResult.success ? 'Access Granted' : 'Access Denied'}
                  </h3>
                  <p className="text-sm">{scanResult.message}</p>
                  {scanResult.success && scanResult.memberName && (
                    <p className="text-sm mt-1">
                      <span className="font-medium">Member:</span> {scanResult.memberName}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {isScanning ? (
            <div className="mb-4">
              <QrScanner
                onResult={handleScan}
                onError={handleError}
                constraints={{ facingMode: 'environment' }}
                containerStyle={{ borderRadius: '0.5rem', overflow: 'hidden' }}
              />
              <p className="text-center mt-2 text-sm text-muted-foreground">
                Center the QR code within the scanner area
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg mb-4">
              <QrCode className="h-12 w-12 text-muted-foreground mb-3" />
              <p className="text-center text-muted-foreground">
                {scanResult ? 'Ready to scan another code' : 'Start scanning to check in members'}
              </p>
            </div>
          )}
        </div>
        <div className="flex justify-center">
          <Button 
            size="lg"
            onClick={isScanning ? () => setIsScanning(false) : resetScan}
          >
            {isScanning ? 'Cancel Scan' : 'Start Scanning'}
          </Button>
        </div>
      </Card>
      
      <Card className="mt-8">
        <CardHeader>
          <h2>How it Works</h2>
          <p>Premium Coin-Based Gym Access</p>
        </CardHeader>
        <div>
          <ol className="list-decimal list-inside space-y-3">
            <li>Premium members scan your gym's QR code or you scan their member QR code</li>
            <li>1 coin is deducted from the member's account</li>
            <li>The coin is credited to your gym's balance</li>
            <li>Each member can only use 1 coin per day at your gym</li>
            <li>Coins are converted to real currency in monthly payouts</li>
          </ol>
        </div>
      </Card>
    </div>
  );
};

export default GymQrScanner; 