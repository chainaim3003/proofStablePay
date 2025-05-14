'use client';

import { useState } from 'react';
import DVPRequest from './components/DVPRequest';
import DVPApproval from './components/DVPApproval';

interface PaymentRequest {
  amount: number;
  tokenId: string;
  seller: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function Home() {
  const [activeRole, setActiveRole] = useState<'seller' | 'buyer'>('seller');
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);

  const handleRequestSubmit = (amount: number, tokenId: string) => {
    setPaymentRequest({
      amount,
      tokenId,
      seller: '0xSellerAddress', // In real implementation, this would be the connected wallet address
      status: 'pending'
    });
  };

  const handleApproval = (approved: boolean) => {
    if (paymentRequest) {
      setPaymentRequest({
        ...paymentRequest,
        status: approved ? 'approved' : 'rejected'
      });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-black">Proof Stable Pay</h1>

        <div className="mb-8 flex justify-center space-x-4">
          <button
            onClick={() => setActiveRole('seller')}
            className={`px-4 py-2 rounded-md ${activeRole === 'seller'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700'
              }`}
          >
            Seller View
          </button>
          <button
            onClick={() => setActiveRole('buyer')}
            className={`px-4 py-2 rounded-md ${activeRole === 'buyer'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-700'
              }`}
          >
            Buyer View
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {activeRole === 'seller' ? (
            <DVPRequest onRequestSubmit={handleRequestSubmit} />
          ) : (
            paymentRequest ? (
              <DVPApproval
                request={paymentRequest}
                onApprove={handleApproval}
              />
            ) : (
              <div className="text-center text-gray-500">
                No payment requests pending
              </div>
            )
          )}
        </div>

        {paymentRequest && (
          <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-2 text-black">Transaction Status</h3>
            <div className={`p-3 rounded-md ${paymentRequest.status === 'pending' ? 'bg-yellow-100' :
              paymentRequest.status === 'approved' ? 'bg-green-100' :
                'bg-red-100'
              }`}>
              <p className={`text-center ${paymentRequest.status === 'pending' ? 'text-yellow-800' :
                paymentRequest.status === 'approved' ? 'text-green-800' :
                  'text-red-800'
                }`}>
                {paymentRequest.status === 'pending' ? 'Pending Approval' :
                  paymentRequest.status === 'approved' ? 'Payment Approved' :
                    'Payment Rejected'}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
