import { BrowserConnectClient } from "@gala-chain/connect";

export async function checkRegistration(walletAddress: string) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_PUBLIC_KEY_CONTRACT}/GetPublicKey`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: walletAddress }),
    },
  );
  if (!response.ok) throw new Error("User not registered");
}

export async function registerUser(metamaskClient: BrowserConnectClient) {
  const publicKey = await metamaskClient.getPublicKey();
  const response = await fetch(
    `${import.meta.env.VITE_GALASWAP_API}/CreateHeadlessWallet`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicKey: publicKey.publicKey }),
    },
  );
  if (!response.ok) throw new Error("Failed to register user");
}
