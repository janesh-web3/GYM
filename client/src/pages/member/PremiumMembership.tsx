import React, { useState, useEffect } from 'react';
import { coinService } from '../../lib/coinServices';
import { toast } from 'react-toastify';
import { DEFAULT_COIN_PACKAGES, PREMIUM_FEATURES } from '../../types/Coin';

const PremiumMembership: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>(null);
  const [coinData, setCoinData] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isPurchasing, setIsPurchasing] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState<boolean>(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('usage');
  
  // Fetch user data and coin history
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setUserData(user);
        
        if (user._id) {
          const coinHistory = await coinService.getUserCoinHistory(user._id);
          setCoinData(coinHistory);
          
          if (user.subscriptionType === 'premium' && user.member?._id) {
            generateQrCode(user.member._id);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Could not load membership data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Generate QR code for member
  const generateQrCode = async (memberId: string) => {
    try {
      const response = await coinService.getMemberQR(memberId);
      setQrCode(response.qrCode);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Could not generate QR code. Please try again later.");
    }
  };
  
  // Purchase coins
  const handlePurchaseCoins = async () => {
    if (!selectedPackage || !userData?._id) return;
    
    setIsPurchasing(true);
    try {
      await coinService.purchaseCoins(
        userData._id,
        selectedPackage.coins,
        selectedPackage.price
      );
      
      // Refresh coin data
      const updatedCoinData = await coinService.getUserCoinHistory(userData._id);
      setCoinData(updatedCoinData);
      
      toast.success(`Added ${selectedPackage.coins} coins to your balance.`);
      
      // Close dialog and reset
      setSelectedPackage(null);
    } catch (error) {
      console.error("Error purchasing coins:", error);
      toast.error("Could not complete the purchase. Please try again later.");
    } finally {
      setIsPurchasing(false);
    }
  };
  
  // Upgrade to premium
  const handleUpgradeToPremium = async () => {
    if (!userData?._id) return;
    
    setIsLoading(true);
    try {
      const response = await coinService.updateSubscriptionType(userData._id, 'premium');
      
      // Update local storage user data
      const updatedUser = (response as { user: any }).user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserData(updatedUser);
      
      // Generate QR code if member exists
      if (updatedUser.member?._id) {
        generateQrCode(updatedUser.member._id);
      }
      
      toast.success("Your account has been upgraded to premium!");
      
      setIsUpgradeDialogOpen(false);
    } catch (error) {
      console.error("Error upgrading to premium:", error);
      toast.error("Could not upgrade your account. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };
  
  return (
    <div className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Premium Membership</h1>
      
      {isLoading ? (
        <div className="flex justify-center p-12">
          <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-1">Membership Status</h2>
              <p className="text-gray-500 mb-4">Your current membership details</p>
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Current Plan</div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      userData?.subscriptionType === 'premium' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {userData?.subscriptionType === 'premium' ? 'Premium' : 'Basic'}
                    </span>
                    <span className="text-lg font-semibold">
                      {userData?.subscriptionType === 'premium' ? 'Premium Access' : 'Limited Access'}
                    </span>
                  </div>
                </div>
                
                {userData?.subscriptionType === 'premium' ? (
                  <div className="flex flex-col items-center md:items-end">
                    <div className="text-sm text-gray-500 mb-1">Your Coin Balance</div>
                    <div className="text-2xl font-bold">{coinData?.coinBalance || 0} Coins</div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setIsUpgradeDialogOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Upgrade to Premium
                  </button>
                )}
              </div>
              
              {userData?.subscriptionType === 'premium' && (
                <div className="mt-6">
                  <button
                    onClick={() => setIsQrDialogOpen(true)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center w-full md:w-auto justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3h6v6H3z"></path>
                      <path d="M15 3h6v6h-6z"></path>
                      <path d="M3 15h6v6H3z"></path>
                      <path d="M15 15h6v6h-6z"></path>
                    </svg>
                    Show My QR Code
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* QR Code Dialog */}
          {isQrDialogOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Your Gym Access QR Code</h3>
                    <button 
                      onClick={() => setIsQrDialogOpen(false)} 
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">Show this QR code at any participating gym for premium access.</p>
                </div>
                
                <div className="p-6 flex items-center justify-center">
                  {qrCode ? (
                    <img src={qrCode} alt="QR Code" className="max-w-full h-auto" />
                  ) : (
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="mt-2">Generating QR Code...</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t flex justify-center">
                  <button
                    onClick={() => setIsQrDialogOpen(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Upgrade Dialog */}
          {isUpgradeDialogOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-lg">Upgrade to Premium</h3>
                  <p className="text-sm text-gray-500">Unlock cross-gym access and premium features</p>
                </div>
                
                <div className="p-6">
                  <h4 className="font-semibold mb-3">Premium Benefits:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Access any registered gym in the network</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Pay-per-visit with digital coins</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Quick entry with QR code</span>
                    </li>
                    <li className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Exclusive member perks and discounts</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 border-t flex justify-end space-x-2">
                  <button 
                    onClick={() => setIsUpgradeDialogOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpgradeToPremium}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Upgrade Now'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Features Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Premium Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PREMIUM_FEATURES.map((feature) => (
                <div key={feature.name} className="bg-white p-6 rounded-lg shadow-md h-full">
                  <div className="flex items-center justify-center mb-4">
                    {feature.icon === 'building' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    )}
                    {feature.icon === 'qrcode' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    )}
                    {feature.icon === 'calendar' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                    {feature.icon === 'gift' && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-center">{feature.name}</h3>
                  <p className="text-sm text-gray-500 text-center mt-2">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Coin Packages */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Buy Coins</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {DEFAULT_COIN_PACKAGES.map((pkg) => (
                <div key={pkg.id} className={`bg-white p-6 rounded-lg shadow-md relative ${pkg.bestValue ? 'border-2 border-blue-500' : ''}`}>
                  {pkg.bestValue && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                        Best Value
                      </span>
                    </div>
                  )}
                  <h3 className="text-lg font-semibold">{pkg.name}</h3>
                  <p className="text-gray-500 text-sm">{pkg.coins} Coins</p>
                  <div className="text-2xl font-bold my-4">${pkg.price.toFixed(2)}</div>
                  <button 
                    className={`w-full py-2 px-4 rounded-md font-medium ${
                      userData?.subscriptionType !== 'premium'
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    }`}
                    onClick={() => {
                      if (userData?.subscriptionType === 'premium') {
                        setSelectedPackage(pkg);
                      }
                    }}
                    disabled={userData?.subscriptionType !== 'premium'}
                  >
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
            {userData?.subscriptionType !== 'premium' && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <p className="text-center">
                  You need to upgrade to Premium to purchase coins.{' '}
                  <button 
                    className="text-blue-600 font-semibold hover:underline focus:outline-none"
                    onClick={() => setIsUpgradeDialogOpen(true)}
                  >
                    Upgrade now
                  </button>
                </p>
              </div>
            )}
          </div>
          
          {/* Purchase Dialog */}
          {selectedPackage && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-md w-full">
                <div className="p-4 border-b">
                  <h3 className="font-semibold text-lg">Purchase Coins</h3>
                  <p className="text-sm text-gray-500">Confirm your coin purchase</p>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-col items-center justify-center mb-4">
                    <div className="text-lg font-semibold mb-1">{selectedPackage.name}</div>
                    <div className="text-3xl font-bold mb-2">{selectedPackage.coins} Coins</div>
                    <div className="text-xl">${selectedPackage.price.toFixed(2)}</div>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-md text-sm">
                    <p className="text-center">
                      This is a simulated purchase for demonstration purposes.
                      No actual payment will be processed.
                    </p>
                  </div>
                </div>
                
                <div className="p-4 border-t flex justify-end space-x-2">
                  <button 
                    onClick={() => setSelectedPackage(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handlePurchaseCoins}
                    disabled={isPurchasing}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center"
                  >
                    {isPurchasing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      'Confirm Purchase'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Transactions */}
          <div>
            <h2 className="text-2xl font-bold mb-4">Transaction History</h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('usage')}
                    className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'usage'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Coin Usage
                  </button>
                  <button
                    onClick={() => setActiveTab('purchases')}
                    className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                      activeTab === 'purchases'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Purchases
                  </button>
                </nav>
              </div>
              
              <div className="p-6">
                {activeTab === 'usage' && (
                  <div className="h-[400px] overflow-auto">
                    {coinData?.transactions && coinData.transactions.filter((tx: { transactionType: string; }) => tx.transactionType === 'usage').length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gym</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coins</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {coinData.transactions
                            .filter((tx: { transactionType: string; }) => tx.transactionType === 'usage')
                            .map((tx: { _id: React.Key | null | undefined; date: Date; gymId: { gymName: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; }; coins: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; status: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined; }) => (
                              <tr key={tx._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatDate(tx.date)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.gymId ? tx.gymId.gymName : 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.coins}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    tx.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {tx.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-8 text-gray-500">No gym visits found. Use your coins to access premium gyms.</div>
                    )}
                  </div>
                )}
                {activeTab === 'purchases' && (
                  <div className="h-[400px] overflow-auto">
                    {coinData?.purchaseHistory && coinData.purchaseHistory.length > 0 ? (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coins</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {coinData.purchaseHistory.map((purchase: { _id: any; date: Date; coins: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; amount: number; transactionId: string; }, index: any) => (
                            <tr key={purchase._id || index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatDate(purchase.date)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{purchase.coins}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${purchase.amount.toFixed(2)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="text-xs font-mono text-gray-500">
                                  {purchase.transactionId.substring(0, 8)}...
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-8 text-gray-500">No purchase history found. Buy coins to access premium gyms.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumMembership; 