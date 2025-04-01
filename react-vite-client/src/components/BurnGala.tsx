"use client";

import { useState, useEffect } from "react";
import { BrowserConnectClient } from "@gala-chain/connect";

interface BurnGalaProps {
  walletAddress: string;
}

export default function BurnGala({ walletAddress }: BurnGalaProps) {
  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [metamaskClient, setMetamaskClient] =
    useState<BrowserConnectClient | null>(null);

  useEffect(() => {
    setMetamaskClient(new BrowserConnectClient());
  }, []);

  const handleBurn = async () => {
    try {
      setLoading(true);
      setStatus("");

      if (!walletAddress) {
        throw new Error("No wallet connected");
      }

      const burnAmount = parseFloat(amount);
      if (isNaN(burnAmount) || burnAmount <= 0) {
        throw new Error("Invalid amount");
      }

      if (!metamaskClient) {
        throw new Error("Client not initialized");
      }

      const burnTokensDto = {
        owner: walletAddress,
        tokenInstances: [
          {
            quantity: amount,
            tokenInstanceKey: {
              collection: "GALA",
              category: "Unit",
              type: "none",
              additionalKey: "none",
              instance: "0",
            },
          },
        ],
        uniqueKey: `burn-${Date.now()}`,
      };

      const signature = await metamaskClient.sign(burnTokensDto);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/burn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signature),
      });

      if (!response.ok) {
        throw new Error("Failed to burn tokens");
      }

      const result = await response.json();
      setStatus(
        `Successfully burned ${amount} GALA. Transaction: ${result.transactionId}`,
      );
      setAmount("");
    } catch (error) {
      console.error("Failed to burn GALA:", error);
      setStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">Burn GALA</h2>
      <div className="flex flex-col gap-4">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount to burn"
          className="border p-2 rounded"
          min="0"
          step="0.000001"
        />
        <button
          onClick={handleBurn}
          disabled={loading || !amount}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:bg-gray-400"
        >
          {loading ? "Processing..." : "Burn GALA"}
        </button>
        {status && (
          <p
            className={`mt-2 ${status.startsWith("Error") ? "text-red-500" : "text-green-500"}`}
          >
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
