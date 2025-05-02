import React, { useState, useEffect } from 'react';
import { coinService } from '../../lib/coinServices';
import { AdminCoinData } from '../../types/Coin';

// Custom CSS for toast animations
const toastStyles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOutDown {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(20px);
  }
}

.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out forwards;
}

.animate-fade-out-down {
  animation: fadeOutDown 0.3s ease-in forwards;
}
`;

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CoinManagement: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [coinData, setCoinData] = useState<AdminCoinData | null>(null);
  const [selectedGym, setSelectedGym] = useState<any | null>(null);
  const [isPayoutDialogOpen, setIsPayoutDialogOpen] = useState<boolean>(false);
  const [payoutAmount, setPayoutAmount] = useState<string>('0.00');
  const [isProcessingPayout, setIsProcessingPayout] = useState<boolean>(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [distributionData, setDistributionData] = useState<any[]>([]);
  
  // Create style element for toast animations
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = toastStyles;
    document.head.appendChild(styleEl);
    
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);
  
  // Fetch admin coin data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await coinService.getAdminCoinData();
        setCoinData(data);
        
        // Prepare chart data
        prepareChartData(data);
      } catch (error) {
        console.error("Error fetching coin data:", error);
        showToast("Could not load coin data. Please try again later.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Prepare chart data
  const prepareChartData = (data: AdminCoinData) => {
    if (!data || !data.gyms) return;
    
    // Distribution pie chart
    const distributionData = data.gyms.map(gym => ({
      name: gym.gymName,
      value: gym.coinBalance
    })).sort((a, b) => b.value - a.value);
    
    setDistributionData(distributionData);
    
    // Monthly statistics
    const monthlyData: Record<string, Record<string, number>> = {};
    const allMonths = new Set<string>();
    
    // Collect all months and gym data
    data.gyms.forEach(gym => {
      Object.entries(gym.monthlyStats || {}).forEach(([month, coins]) => {
        allMonths.add(month);
        
        if (!monthlyData[month]) {
          monthlyData[month] = {};
        }
        
        monthlyData[month][gym.gymName] = coins;
      });
    });
    
    // Sort months chronologically
    const sortedMonths = Array.from(allMonths).sort();
    
    // Create chart data
    const gymNames = data.gyms.map(gym => gym.gymName);
    const chartData = sortedMonths.map(month => {
      // Format month for display (e.g., "2023-04" to "Apr '23")
      const [year, monthNum] = month.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const formattedMonth = `${monthNames[parseInt(monthNum) - 1]} '${year.slice(2)}`;
      
      const dataPoint: any = { month: formattedMonth };
      
      // Add data for each gym
      gymNames.forEach(gymName => {
        dataPoint[gymName] = monthlyData[month][gymName] || 0;
      });
      
      return dataPoint;
    });
    
    setChartData(chartData);
  };
  
  // Open payout dialog
  const handleOpenPayoutDialog = (gym: any) => {
    setSelectedGym(gym);
    // Calculate suggested payout amount (0.50 per coin)
    const suggestedAmount = (gym.coinBalance * 0.5).toFixed(2);
    setPayoutAmount(suggestedAmount);
    setIsPayoutDialogOpen(true);
  };
  
  // Process payout
  const handleProcessPayout = async () => {
    if (!selectedGym) return;
    
    setIsProcessingPayout(true);
    try {
      await coinService.simulateGymPayout(
        selectedGym._id,
        parseFloat(payoutAmount),
        selectedGym.coinBalance
      );
      
      showToast(`Successfully processed payout of $${payoutAmount} to ${selectedGym.gymName}`, "success");
      
      // Refresh data
      const data = await coinService.getAdminCoinData();
      setCoinData(data);
      prepareChartData(data);
      
      // Close dialog
      setIsPayoutDialogOpen(false);
      setSelectedGym(null);
    } catch (error) {
      console.error("Error processing payout:", error);
      showToast("Could not process the payout. Please try again later.", "error");
    } finally {
      setIsProcessingPayout(false);
    }
  };
  
  // Format large numbers
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };
  
  // Calculate payout amount from coins
  const calculatePayout = (coins: number) => {
    // Example: $0.50 per coin
    const rate = 0.5;
    return (coins * rate).toFixed(2);
  };
  
  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-3 border rounded shadow">
          <p className="font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value} coins
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-up`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.replace('animate-fade-in-up', 'animate-fade-out-down');
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Coin System Management</h1>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="pb-2">
                <h2 className="text-lg font-medium">Total Coins in Circulation</h2>
                <p className="text-sm text-gray-500">Across all members</p>
              </div>
              <div>
                <div className="text-3xl font-bold">{formatNumber(coinData?.totalCoinsCirculating || 0)}</div>
                <p className="text-sm text-gray-500 mt-1">
                  Value: ${calculatePayout(coinData?.totalCoinsCirculating || 0)}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="pb-2">
                <h2 className="text-lg font-medium">Coins Held by Gyms</h2>
                <p className="text-sm text-gray-500">Ready for payout</p>
              </div>
              <div>
                <div className="text-3xl font-bold">{formatNumber(coinData?.totalCoinsHeldByGyms || 0)}</div>
                <p className="text-sm text-gray-500 mt-1">
                  Value: ${calculatePayout(coinData?.totalCoinsHeldByGyms || 0)}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="pb-2">
                <h2 className="text-lg font-medium">Active Gyms</h2>
                <p className="text-sm text-gray-500">Participating in coin system</p>
              </div>
              <div>
                <div className="text-3xl font-bold">{coinData?.gyms.length || 0}</div>
                <p className="text-sm text-gray-500 mt-1">
                  With registered coin balances
                </p>
              </div>
            </div>
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="mb-4">
                <h2 className="text-lg font-medium">Monthly Coins Distribution</h2>
                <p className="text-sm text-gray-500">Coin usage across gyms by month</p>
              </div>
              <div>
                <div className="h-96">
                  {chartData.length > 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div className="text-lg font-medium text-gray-700 mb-4">Chart Placeholder</div>
                      <div className="text-sm text-gray-500 text-center mb-4">
                        Monthly coin distribution across {coinData?.gyms.length || 0} gyms
                      </div>
                      <div className="w-full px-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {coinData?.gyms.map((gym, index) => (
                            <div key={gym._id} className="flex items-center p-2 bg-gray-50 rounded">
                              <div 
                                className="w-4 h-4 mr-2 rounded-full" 
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="text-sm truncate">{gym.gymName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 mt-4">
                        Chart visualization requires additional configuration
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-5">
              <div className="mb-4">
                <h2 className="text-lg font-medium">Coin Distribution by Gym</h2>
                <p className="text-sm text-gray-500">Current balance distribution</p>
              </div>
              <div>
                <div className="h-96">
                  {distributionData.length > 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <div className="text-lg font-medium text-gray-700 mb-4">Pie Chart Placeholder</div>
                      <div className="text-sm text-gray-500 text-center mb-4">
                        Current balance distribution across gyms
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
                        {distributionData.slice(0, 6).map((entry, index) => (
                          <div key={index} className="flex items-center">
                            <div 
                              className="w-3 h-3 mr-2 rounded-full" 
                              style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <div className="text-sm flex-1 truncate">{entry.name}</div>
                            <div className="text-sm font-medium ml-2">{entry.value} coins</div>
                          </div>
                        ))}
                      </div>
                      <div className="text-xs text-gray-400 mt-4">
                        Chart visualization requires additional configuration
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">No data available</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Gym List for Payouts */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Gym Payout Management</h2>
              <p className="text-sm text-gray-500">Process coin payouts to gyms</p>
            </div>
            
            <div className="p-6">
              {coinData?.gyms && coinData.gyms.length > 0 ? (
                <div className="rounded-md border overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gym Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coin Balance</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout Amount</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Month's Coins</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {coinData.gyms.map((gym) => {
                        // Get last month's coins
                        const now = new Date();
                        let lastMonth = now.getMonth();
                        let lastMonthYear = now.getFullYear();
                        if (lastMonth === 0) {
                          lastMonth = 12;
                          lastMonthYear -= 1;
                        }
                        const lastMonthKey = `${lastMonthYear}-${String(lastMonth).padStart(2, '0')}`;
                        const lastMonthCoins = gym.monthlyStats?.[lastMonthKey] || 0;
                        
                        return (
                          <tr key={gym._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{gym.gymName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{gym.coinBalance}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${calculatePayout(gym.coinBalance)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lastMonthCoins}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                gym.coinBalance > 0 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                              }`}>
                                {gym.coinBalance > 0 ? 'Ready for Payout' : 'No Balance'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                disabled={gym.coinBalance <= 0}
                                onClick={() => handleOpenPayoutDialog(gym)}
                                className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white ${
                                  gym.coinBalance <= 0 
                                  ? 'bg-gray-300 cursor-not-allowed' 
                                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                }`}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Process Payout
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={6} className="px-6 py-3 text-sm text-gray-500">
                          Total gyms: {coinData.gyms.length}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No gyms found with coin balances.
                </div>
              )}
            </div>
          </div>
          
          {/* Payout Dialog */}
          {isPayoutDialogOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-lg">Process Payout</h3>
                  <p className="text-sm text-gray-500">
                    Complete the payout to {selectedGym?.gymName}
                  </p>
                </div>
                
                <div className="p-6 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Gym:</span>
                      <span className="font-medium">{selectedGym?.gymName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Current Coin Balance:</span>
                      <span className="font-medium">{selectedGym?.coinBalance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Suggested Payout ($0.50/coin):</span>
                      <span className="font-medium">${(selectedGym?.coinBalance * 0.5).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="payoutAmount" className="block text-sm font-medium text-gray-700">
                      Payout Amount ($)
                    </label>
                    <input
                      id="payoutAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-md flex">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">Simulation Note</h3>
                      <div className="mt-1 text-sm text-yellow-700">
                        This is a simulated payout. In a production environment, this would
                        connect to a payment processing system.
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border-t flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsPayoutDialogOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessPayout}
                    disabled={isProcessingPayout}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
                  >
                    {isProcessingPayout ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Process Payout
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* System Information */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">System Information</h2>
              <p className="text-sm text-gray-500">About the premium coin system</p>
            </div>
            
            <div className="p-6 space-y-4">
              <p>
                The premium coin-based gym access system enables members with premium subscriptions
                to access any participating gym in the network by spending digital coins.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    How Coins Work
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Premium members purchase coins</li>
                    <li>Members spend 1 coin per visit to any participating gym</li>
                    <li>Gyms collect coins and receive cash payouts</li>
                    <li>Standard conversion rate: $0.50 per coin</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    Payout Process
                  </h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Payouts are processed at the end of each month</li>
                    <li>Admin can manually process payouts as needed</li>
                    <li>Payout amounts are calculated based on coin balance</li>
                    <li>Payment records are maintained for accounting</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-4 bg-red-50 p-4 rounded-md flex">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h3 className="text-sm font-medium text-red-800">Note</h3>
                  <div className="mt-1 text-sm text-red-700">
                    This is a simulated system for demonstration purposes. In a real implementation,
                    actual payment processing and additional security measures would be integrated.
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

export default CoinManagement; 