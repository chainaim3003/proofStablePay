'use client';

import { useState } from 'react';

interface DVPApprovalProps {
  request: {
    amount: number;
    tokenId: string;
    seller: string;
  };
  onApprove: (approved: boolean) => void;
}

export default function DVPApproval({ request, onApprove }: DVPApprovalProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<boolean | null>(null);

  const handleDVPCheck = async () => {
    setIsChecking(true);
    // Simulate DVP check - in real implementation, this would call your smart contract
    try {
      // Mock DVP check with 0.6 risk threshold
      const mockCheck = Math.random() > 0.4; // 60% chance of passing
      setCheckResult(mockCheck);
      if (mockCheck) {
        onApprove(true);
      }
    } catch (error) {
      console.error('DVP check failed:', error);
      setCheckResult(false);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-black">Payment Request Details</h2>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Amount (USDC)</p>
          <p className="text-lg font-semibold text-gray-600">{request.amount}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Token ID</p>
          <p className="text-lg font-semibold text-gray-600">{request.tokenId}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Seller</p>
          <p className="text-lg font-semibold text-gray-600">{request.seller}</p>
        </div>

        {checkResult === null ? (
          <button
            onClick={handleDVPCheck}
            disabled={isChecking}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isChecking ? 'Checking...' : 'Perform DVP Check'}
          </button>
        ) : (
          <div className={`p-4 rounded-md ${checkResult ? 'bg-green-100' : 'bg-red-100'}`}>
            <p className={`text-center font-medium ${checkResult ? 'text-green-800' : 'text-red-800'}`}>
              {checkResult ? 'DVP Check Passed - Payment Approved' : 'DVP Check Failed - Payment Rejected'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 