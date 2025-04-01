"use client";

import { useState, useEffect } from "react";
import { BrowserConnectClient } from "@gala-chain/connect";

interface BalanceProps {
  walletAddress: string;
}

export default function Balance({ walletAddress }: BalanceProps) {
  const [balance, setBalance] = useState<string>("0");
  const [loading, setLoading] = useState(false);
  const [metamaskClient, setMetamaskClient] =
    useState<BrowserConnectClient | null>(null);

  useEffect(() => {
    setMetamaskClient(new BrowserConnectClient());
  }, []);

  const fetchBalance = async () => {
    try {
      setLoading(true);
      if (walletAddress) {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_TOKEN_CONTRACT}/FetchBalances`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              owner: walletAddress,
              collection: "GALA",
              category: "Unit",
              type: "none",
              additionalKey: "none",
              instance: "0",
            }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch balance");
        }

        const { Data } = await response.json();
        setBalance(Data[0].quantity.toString());
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAndFetch = async () => {
      if (walletAddress) {
        fetchBalance();
      }
    };
    checkAndFetch();
  }, [walletAddress]);

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">GALA Balance</h2>
      <div className="flex items-center gap-4">
        <p className="text-lg">{loading ? "Loading..." : `${balance} GALA`}</p>
        <button
          onClick={fetchBalance}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}
