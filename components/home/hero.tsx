import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "lucide-react";
import AnimatedShinyText from "@/components/ui/animatedShinyText";
import { Button } from "@/components/ui/button";
import { useBitcoinWallet } from '@/components/bitcoinWalletProvider';
import { toast } from 'sonner';

export const Hero = () => {
  const { wallet, connectWallet, isLoading, detectedWallet } = useBitcoinWallet();

  const handleLaunchVault = async () => {
    try {
      await connectWallet();
    } catch (error) {
      toast.error('Failed to connect Bitcoin wallet');
      console.error('Wallet connection error:', error);
    }
  };
  return (
    <div className="space-y-8 pt-24 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className={cn(
          "group rounded-full border border-[#8B7CFF]/30 bg-white/5 text-sm text-[#E6E1FF] transition-all ease-in hover:border-[#8B7CFF]/60 px-4 py-1 backdrop-blur"
        )}>
          <AnimatedShinyText className="inline-flex items-center justify-center px-3 py-0.5 transition ease-out">
            <span>✨ Join the beta</span>
            <ArrowRightIcon className="ml-1 size-2.5 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </AnimatedShinyText>
        </div>
        <h1 className="text-6xl font-bold text-white tracking-tight leading-tight">
          Secure Bitcoin Inheritance
        </h1>
      </div>
      <p className="text-xl text-[#C7C7D1] max-w-3xl mx-auto leading-relaxed">
        Modern, trust-driven inheritance rails on Bitcoin. Automate check-ins, lock assets with confidence,
        and keep beneficiaries informed—powered by Charms Protocol.
      </p>
      <div className="inline-block">
        <Button
          onClick={handleLaunchVault}
          className="bg-[#8B7CFF] hover:bg-[#7a6ce6] text-white px-9 py-4 rounded-full font-semibold text-base transition-all shadow-lg shadow-[#8B7CFF]/30"
          disabled={wallet.isConnected || isLoading}
        >
          {wallet.isConnected
            ? 'Redirecting to Dashboard...'
            : isLoading
            ? 'Connecting...'
            : detectedWallet
            ? 'Launch Bitcoin Vault'
            : 'Detecting wallet'}
        </Button>
      </div>
    </div>
  );
};
