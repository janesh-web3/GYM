import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { createSubscription } from '../services/subscriptionService';
import { getGymSubscriptionPlans } from '../services/gymService';

interface SubscriptionPlan {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: {
    value: number;
    unit: string;
  };
  features: string[];
  services: Array<{
    name: string;
    description?: string;
    included: boolean;
  }>;
}

interface SubscriptionSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
  branchId?: string;
  branchName?: string;
}

const SubscriptionSelector: React.FC<SubscriptionSelectorProps> = ({
  isOpen,
  onClose,
  gymId,
  branchId,
  branchName
}) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [subscribing, setSubscribing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [autoRenew, setAutoRenew] = useState(false);
  
  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setLoading(true);
        const plansData = await getGymSubscriptionPlans(gymId, branchId);
        setPlans(plansData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching subscription plans:', err);
        setError('Failed to load subscription plans. Please try again later.');
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchSubscriptionPlans();
    }
  }, [isOpen, gymId, branchId]);

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast.error('Please select a subscription plan');
      return;
    }

    try {
      setSubscribing(true);
      
      // Call API to create subscription
      await createSubscription({
        planId: selectedPlan,
        branchId,
        paymentMethod,
        autoRenew
      });
      
      toast.success('Subscription successful! You have joined the branch.');
      setSubscribing(false);
      onClose(); // Close the modal after successful subscription
    } catch (err: any) {
      console.error('Error subscribing:', err);
      toast.error(err.response?.data?.message || 'Failed to subscribe. Please try again.');
      setSubscribing(false);
    }
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  // Format duration for display
  const formatDuration = (value: number, unit: string) => {
    return `${value} ${value === 1 ? unit : unit + 's'}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-900">
            Choose a Subscription Plan
            {branchName && <span className="ml-1 text-gray-600">for {branchName}</span>}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner size={32} className="animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-primary-600 hover:text-primary-800"
              >
                Try Again
              </button>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No subscription plans available for this {branchId ? 'branch' : 'gym'}.
              </p>
            </div>
          ) : (
            <>
              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {plans.map((plan) => (
                  <div
                    key={plan._id}
                    className={`border rounded-lg overflow-hidden cursor-pointer transition-all hover:shadow-lg ${
                      selectedPlan === plan._id
                        ? 'border-primary-500 ring-2 ring-primary-200'
                        : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedPlan(plan._id)}
                  >
                    <div className="p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h4>
                      <div className="text-3xl font-bold text-primary-600 mb-2">
                        {formatPrice(plan.price)}
                        <span className="text-sm font-normal text-gray-500 ml-1">
                          / {formatDuration(plan.duration.value, plan.duration.unit)}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Features:</h5>
                        <ul className="space-y-2">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                              <FaCheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-sm text-gray-600">{feature}</span>
                            </li>
                          ))}
                          {plan.services
                            .filter((service) => service.included)
                            .map((service, index) => (
                              <li key={`service-${index}`} className="flex items-start">
                                <FaCheckCircle size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{service.name}</span>
                              </li>
                            ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        {plan.duration.value} {plan.duration.unit}
                        {plan.duration.value !== 1 && 's'} plan
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border ${
                          selectedPlan === plan._id
                            ? 'bg-primary-600 border-primary-600'
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedPlan === plan._id && (
                          <div className="h-full w-full flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-white"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Section */}
              {selectedPlan && (
                <div className="border border-gray-200 rounded-lg p-6 mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment Method</h4>

                  <div className="space-y-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="payment-method"
                        value="credit_card"
                        checked={paymentMethod === 'credit_card'}
                        onChange={() => setPaymentMethod('credit_card')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Credit Card</span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="payment-method"
                        value="paypal"
                        checked={paymentMethod === 'paypal'}
                        onChange={() => setPaymentMethod('paypal')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">PayPal</span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="payment-method"
                        value="bank_transfer"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => setPaymentMethod('bank_transfer')}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <span className="ml-2 text-gray-700">Bank Transfer</span>
                    </label>
                  </div>

                  <div className="mt-6">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoRenew}
                        onChange={() => setAutoRenew(!autoRenew)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">
                        Auto-renew my subscription when it expires
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md mr-2 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubscribe}
            disabled={!selectedPlan || subscribing || loading}
            className={`px-4 py-2 text-white rounded-md flex items-center ${
              !selectedPlan || subscribing || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 transition-colors'
            }`}
          >
            {subscribing ? (
              <>
                <FaSpinner size={16} className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Subscribe & Join'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSelector; 