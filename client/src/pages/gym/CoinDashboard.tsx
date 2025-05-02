import React, { useState, useEffect } from 'react';
import { coinService } from '../../lib/coinServices';
import { Loader2, QrCode, Download, AlertCircle, Info } from 'lucide-react';
import { GymCoinData } from '../../types/Coin';
import { toast } from 'react-toastify';

const CoinDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [gymId, setGymId] = useState<string | null>(null);
  const [gymName, setGymName] = useState<string>('');
  const [coinData, setCoinData] = useState<GymCoinData | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState<boolean>(false);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Get gym data and coin history
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get current user data
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Check if user has a gym
        if (user.gym?._id) {
          setGymId(user.gym._id);
          setGymName(user.gym.gymName || 'Your Gym');
          
          // Fetch coin data
          const data = await coinService.getGymCoinHistory(user.gym._id);
          setCoinData(data);
          
          // Generate QR code
          generateQrCode(user.gym._id);
          
          // Prepare chart data
          prepareChartData(data.monthlyTotals);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Could not load coin data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [toast]);
  
  // Generate QR code for gym
  const generateQrCode = async (id: string) => {
    try {
      const response = await coinService.getGymQR(id);
      setQrCode(response.qrCode);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Could not generate QR code. Please try again later.");
    }
  };
  
  // Prepare chart data
  const prepareChartData = (monthlyTotals: Record<string, number>) => {
    const data = Object.entries(monthlyTotals || {}).map(([month, coins]) => {
      // Format month for display (e.g., "2023-04" to "Apr 2023")
      const [year, monthNum] = month.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedMonth = monthNames[parseInt(monthNum) - 1];
      
      return {
        month: `${formattedMonth} ${year}`,
        coins,
        value: coins // For Recharts
      };
    }).sort((a, b) => {
      // Sort by date (newest first)
      const dateA = new Date(a.month);
      const dateB = new Date(b.month);
      return dateA.getTime() - dateB.getTime();
    });
    
    setChartData(data);
  };
  
  // Format date for display
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };
  
  // Download QR code
  const downloadQrCode = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `${gymName.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Calculate estimated payout amount
  const calculatePayout = (coins: number) => {
    // Example: $0.50 per coin
    const rate = 0.5;
    return (coins * rate).toFixed(2);
  };
  
  if (!gymId) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="font-bold">Error</span>
          </div>
          <span className="block sm:inline mt-1">No gym associated with your account. Please set up your gym profile first.</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">QR Code Scanner</h1>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* QR Code Card */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-lg">Your Gym QR Code</h2>
              <p className="text-sm text-gray-500">Members can scan this code to pay with coins</p>
            </div>
            <div className="p-6 flex flex-col md:flex-row items-center gap-6">
              <div className="mb-4 md:mb-0">
                {qrCode ? (
                  <img
                    src={qrCode}
                    alt="Gym QR Code"
                    className="w-48 h-48 border rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                    <QrCode className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button 
                    className="px-4 py-2 border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-50"
                    onClick={() => setIsQrDialogOpen(true)}
                  >
                    <QrCode className="h-4 w-4" />
                    <span>View Full Size</span>
                  </button>
                  <button 
                    className={`px-4 py-2 border rounded-md flex items-center gap-2 ${!qrCode ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'border-gray-300 hover:bg-gray-50'}`}
                    onClick={downloadQrCode}
                    disabled={!qrCode}
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-sm">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Tip</p>
                      <p className="mt-1">Print this QR code and place it at your reception desk for easy access by premium members.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* QR Code Dialog */}
          {isQrDialogOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-lg w-full">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Your Gym QR Code</h3>
                    <button onClick={() => setIsQrDialogOpen(false)} className="text-gray-500 hover:text-gray-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">Members can scan this to use their coins at your gym</p>
                </div>
                
                <div className="p-6 flex justify-center">
                  {qrCode ? (
                    <img src={qrCode} alt="QR Code" className="max-w-full h-auto" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                      <span className="mt-2">Generating QR Code...</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t flex flex-col-reverse sm:flex-row sm:justify-between">
                  <button
                    className="mt-3 sm:mt-0 px-4 py-2 border border-gray-300 rounded-md"
                    onClick={() => setIsQrDialogOpen(false)}
                  >
                    Close
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md flex items-center justify-center gap-2 ${!qrCode ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                    onClick={downloadQrCode}
                    disabled={!qrCode}
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* How It Works */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mt-8">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-lg">How Coin Payouts Work</h2>
              <p className="text-sm text-gray-500">Understanding the coin system</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <p>
                  The premium coin system allows members to visit any participating gym
                  using digital coins. Here's how it works for you as a gym owner:
                </p>
                <ul className="list-disc list-inside space-y-2 pl-4">
                  <li>Members pay 1 coin per visit to your gym</li>
                  <li>Coins are automatically credited to your gym's account</li>
                  <li>At the end of each month, coins are converted to cash at a rate of $0.50 per coin</li>
                  <li>Payouts are processed automatically to your registered bank account</li>
                  <li>You can track all transactions and expected payouts in this dashboard</li>
                </ul>
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 text-sm">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Note</p>
                      <p className="mt-1">This is a simulated system for demonstration purposes. In a real implementation, actual payment processing would be integrated.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoinDashboard; 