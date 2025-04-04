import WalletConnect from "@/components/WalletConnect";
import Balance from "@/components/Balance";
import BurnGala from "@/components/BurnGala";

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">GalaChain React Example</h1>
      <div className="space-y-6">
        <WalletConnect />
        <Balance />
        <BurnGala />
      </div>
    </div>
  );
}
