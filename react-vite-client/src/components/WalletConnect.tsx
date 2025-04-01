"use client";

import { useState, useEffect } from "react";
import { BrowserConnectClient } from "@gala-chain/connect";
import { checkRegistration, registerUser } from "../utils/connect";

interface WalletConnectProps {
  onAddressChange: (address: string) => void;
}

export default function WalletConnect({ onAddressChange }: WalletConnectProps) {
  const [account, setAccount] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [metamaskClient, setMetamaskClient] =
    useState<BrowserConnectClient | null>(null);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    setMetamaskClient(new BrowserConnectClient());
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      if (!metamaskClient) return;

      try {
        const connected = await metamaskClient.connect();
        if (connected) {
          const address = metamaskClient.galaChainAddress;
          setAccount(address);
          onAddressChange(address);

          // Check registration
          try {
            await checkRegistration(address);
          } catch (e) {
            console.log(
              `Registration check failed: ${e}. Attempting to register user: ${address}`,
            );
            await registerUser(metamaskClient);
          }
        }
      } catch (error) {
        console.error("Failed to check connection:", error);
        setStatus("Failed to connect wallet");
      }
    };
    checkConnection();
  }, [metamaskClient, onAddressChange]);

  const connectWallet = async () => {
    if (!metamaskClient) return;

    try {
      setIsConnecting(true);
      setStatus("");

      await metamaskClient.connect();
      const address = metamaskClient.galaChainAddress;
      setAccount(address);
      onAddressChange(address);

      // Check registration
      try {
        await checkRegistration(address);
      } catch (e) {
        console.log(
          `Registration check failed: ${e}. Attempting to register user: ${address}`,
        );
        await registerUser(metamaskClient);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setStatus("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (!metamaskClient) return;

    try {
      await metamaskClient.disconnect();
      setAccount("");
      onAddressChange("");
      setStatus("");
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      setStatus("Failed to disconnect wallet");
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Wallet Connection</h2>
      {account ? (
        <div>
          <p className="mb-2">Connected Account: {account}</p>
          <button
            onClick={disconnectWallet}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {isConnecting ? "Connecting..." : "Connect Wallet"}
        </button>
      )}
      {status && <p className="mt-2 text-sm text-red-600">{status}</p>}
    </div>
  );
}
