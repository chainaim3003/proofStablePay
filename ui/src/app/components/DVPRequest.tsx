'use client';

import { useState } from 'react';

interface DVPRequestProps {
  onRequestSubmit: (amount: number, tokenId: string) => void;
}

export default function DVPRequest({ onRequestSubmit }: DVPRequestProps) {
  const [amount, setAmount] = useState<number>(0);
  const [tokenId, setTokenId] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestSubmit(amount, tokenId);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-black">Request Payment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount (USDC)
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
            required
          />
        </div>
        <div>
          <label htmlFor="tokenId" className="block text-sm font-medium text-gray-700">
            Token ID
          </label>
          <input
            type="text"
            id="tokenId"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-black"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Request Payment
        </button>
      </form>
    </div>
  );
} 