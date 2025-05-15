"use client";
import { useEffect, useState } from 'react';
import { useWallet } from '@/context/WalletContext';
import Link from 'next/link';
import axios from 'axios';
import ZkappWorkerClient from './zkAppWorkerClient';
const ZKAPP_ADDRESS = 'B62qrruUWbPuShFKJ6K1gex6VThsq6K5za5PHVsYPSPkCA9hvzNKf3P';

export default function DemoPage() {
  const { walletAddress, isConnected } = useWallet();
  const [zkappWorkerClient, setZkappWorkerClient] = useState<ZkappWorkerClient | null>(null);
  const [hasBeenSetup, setHasBeenSetup] = useState(false);
  const [processData, setProcessData] = useState('');
  const [proofStatus, setProofStatus] = useState<'idle' | 'generating' | 'verifying' | 'verified' | 'failed'>('idle');
  const [proofResult, setProofResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionLink, setTransactionLink] = useState('');
  const [creatingTransaction, setCreatingTransaction] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [transJson, setTransjson] = useState<null | { companyID: string, companyName: string }>(null);

  const displayStep = (step: string) => {
    setStatusMessage(step);
    console.log(step);
  };

  useEffect(() => {
    const setup = async () => {
      try {
        if (!hasBeenSetup) {
          displayStep('Loading web worker...');
          const zkappWorkerClient = new ZkappWorkerClient();
          // let zkappWorkerClient: ZkappWorkerClient | null = null;
          setZkappWorkerClient(zkappWorkerClient);
          await new Promise((resolve) => setTimeout(resolve, 5000));
          displayStep('Done loading web worker');

          await zkappWorkerClient!.setActiveInstanceToDevnet();

          if (!isConnected) {
            displayStep('Wallet not connected.');
            return;
          }
          setHasBeenSetup(true);
          setStatusMessage('');
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        displayStep(`Error during setup: ${errorMessage}`);
      }
    };

    setup();
  }, [isConnected, walletAddress, hasBeenSetup]);

  const handleProcessDataChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setProcessData(e.target.value);
  };

  const fetchComplianceData = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('https://0f4aef00-9db0-4057-949e-df6937e3449b.mock.pstmn.io/zenova_mca');
      setProcessData(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Error fetching compliance data:', error);
      alert('Failed to fetch compliance data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const generateProof = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!processData.trim()) {
      alert('Please enter process data');
      return;
    }



    try {
      displayStep('Checking if fee payer account exists...');
      const res = await zkappWorkerClient!.fetchAccount(walletAddress);
      const accountExists = res.error === null;
      console.log('Account exists:', accountExists);

      await zkappWorkerClient!.loadContract();
      displayStep('Compiling zkApp...');
      setProofStatus('generating');
      await zkappWorkerClient!.compileContract();
      displayStep('zkApp compiled');

      await zkappWorkerClient!.initZkappInstance(ZKAPP_ADDRESS);
      displayStep('Getting zkApp state...');
      await zkappWorkerClient!.fetchAccount(ZKAPP_ADDRESS);

      setCreatingTransaction(true);
      // setProofStatus('generating');
      displayStep('Creating a transaction...');

      await zkappWorkerClient!.fetchAccount(walletAddress);

      const proof = await zkappWorkerClient!.createUpdateTransaction();

      displayStep('Creating proof...');
      setProofStatus('verifying');
      await zkappWorkerClient!.proveUpdateTransaction();

      displayStep('Requesting send transaction...');
      const transactionJSON = await zkappWorkerClient!.getTransactionJSON();
      // setTransjson({
      //   companyName: proof.publicOutput.companyName.toString(),
      //   companyID: proof.publicOutput.companyID.toString()
      // });

      console.log("Transaction JSON PROOF:", transactionJSON);

      displayStep('Getting transaction JSON...');
      const { hash } = await (window as unknown as { mina: { sendTransaction: (params: { transaction: unknown }) => Promise<{ hash: string }> } }).mina.sendTransaction({
        transaction: transactionJSON,
      });

      console.log("Hash:", { hash });
      const transactionLink = `https://custom.minascan.io/custom/tx/${hash}`;
      setTransactionLink(transactionLink);
      setStatusMessage(transactionLink);

      setProofStatus('verified');
      setProofResult('Proof verified successfully! Your business process is compliant.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setProofStatus('failed');
      setProofResult(`Error: ${errorMessage}`);
      displayStep(`Error during transaction: ${errorMessage}`);
    } finally {
      setCreatingTransaction(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] pt-24 pb-16 px-4 max-xl:px-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-serif mb-6 text-gray-900"> Deep Composition Demo</h1>

        {!isConnected ? (
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-8">
            <h2 className="text-xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="mb-6 text-gray-600">
              Please connect your Aura wallet to use the demo. This will allow you to sign transactions and interact with the Mina blockchain.
            </p>
            <Link
              href="/"
              className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        ) : (
          <>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-600">Connected Wallet</h2>
              <p className="text-gray-600 mb-2">
                Address: <span className="font-mono">{walletAddress}</span>
              </p>
              <p className="text-sm text-gray-500">
                This demo uses the Mina Protocol and Aura wallet to generate and verify ZK proofs of business processes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-600">Enter Process Data</h2>
              <p className="text-gray-600 mb-4">
                Enter your business process data below or fetch sample compliance data. This will be used to generate a zero knowledge proof.
              </p>
              <div className="flex gap-4 mb-4">
                <button
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={fetchComplianceData}
                  disabled={isLoading}
                >
                  {isLoading ? 'Fetching...' : 'Fetch Sample Data'}
                </button>
              </div>
              <textarea
                className="w-full h-70 p-4 border border-gray-300 rounded-md mb-4 font-mono text-sm text-gray-600"
                placeholder="Enter your business process data in JSON format..."
                value={processData}
                onChange={handleProcessDataChange}
              />
              <button
                className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={generateProof}
                disabled={proofStatus === 'generating' || proofStatus === 'verifying' || creatingTransaction}
              >
                {proofStatus === 'idle' && 'Generate Proof'}
                {proofStatus === 'generating' && 'Generating Proof...'}
                {proofStatus === 'verifying' && 'Verifying Proof...'}
              </button>
            </div>

            {proofStatus !== 'idle' && (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 transform transition-all duration-500 ease-in-out hover:shadow-md">
                <h2 className="text-xl font-semibold mb-6 text-gray-600 flex items-center">
                  <span className="mr-2">Proof Status</span>
                  {proofStatus === 'verified' && (
                    <span className="text-green-500 text-sm font-normal animate-fade-in">
                      ✓ Completed
                    </span>
                  )}
                </h2>

                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="relative pl-8">
                      <div className="flex items-center mb-4">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 transition-all duration-500 ${proofStatus === 'generating'
                          ? 'bg-yellow-500 animate-pulse'
                          : proofStatus === 'verifying' || proofStatus === 'verified'
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                          }`}>
                          {proofStatus === 'generating' && (
                            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                          )}
                          {proofStatus === 'verifying' && (
                            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                          )}
                          {proofStatus === 'verified' && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-700">Generate Proof</h3>
                          <p className="text-sm text-gray-500">Creating zero knowledge proof from your process data</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                    <div className="relative pl-8">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 transition-all duration-500 ${proofStatus === 'verifying'
                          ? 'bg-yellow-500 animate-pulse'
                          : proofStatus === 'verified'
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                          }`}>
                          {proofStatus === 'verifying' && (
                            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                          )}
                          {proofStatus === 'verified' && (
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-700">Verify Proof</h3>
                          <p className="text-sm text-gray-500">Validating proof on the Mina blockchain</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {proofResult && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md transform transition-all duration-500 ease-in-out animate-fade-in">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="text-green-800 font-medium">{proofResult}</p>
                    </div>
                  </div>
                )}

                {transJson && (
                  <div className='w-full mt-6 p-4 border border-green-200 rounded-md transform transition-all duration-500 ease-in-out animate-fade-in left-4 top-0 bottom-0 overflow-scroll bg-gray-200 text-black'>
                    {JSON.stringify(transJson)}
                  </div>
                )}

                {transactionLink && (
                  <div className="mt-4">
                    <a
                      href={transactionLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View Transaction →
                    </a>
                  </div>
                )}

                {statusMessage && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md">
                    <p className="text-gray-700 font-mono text-sm">{statusMessage}</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
} 