import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Wallet, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface VerificationState {
  address: string;
  serviceUriConfig?: {
    nodeUrl: string;
    indexerUrl: string;
    provingServerUrl: string;
  };
}

export default function Verify() {
  const { toast } = useToast();
  const [isWalletAvailable, setIsWalletAvailable] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [walletState, setWalletState] = useState<VerificationState | null>(null);

  // Check for wallet availability
  useEffect(() => {
    const checkWallet = () => {
      const hasWallet = Boolean(window.midnight?.mnLace);
      console.log("Checking Midnight Lace wallet:", {
        windowMidnight: Boolean(window.midnight),
        mnLaceAvailable: Boolean(window.midnight?.mnLace),
        version: window.midnight?.mnLace?.apiVersion,
        name: window.midnight?.mnLace?.name
      });
      setIsWalletAvailable(hasWallet);
    };

    checkWallet();
    const interval = setInterval(checkWallet, 1000);
    const timeout = setTimeout(() => clearInterval(interval), 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const initiateVerification = async (discordId: string) => {
    try {
      const response = await fetch('/api/verify/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discordId })
      });

      if (!response.ok) {
        throw new Error('Failed to initiate verification');
      }

      return await response.json();
    } catch (error) {
      console.error('Verification initiation error:', error);
      throw error;
    }
  };

  const completeVerification = async (discordId: string, walletAddress: string) => {
    try {
      const response = await fetch('/api/verify/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discordId,
          walletAddress
        })
      });

      if (!response.ok) {
        throw new Error('Failed to complete verification');
      }

      return await response.json();
    } catch (error) {
      console.error('Verification completion error:', error);
      throw error;
    }
  };

  const connectWallet = async () => {
    if (!isWalletAvailable) {
      window.open("https://docs.midnight.network/develop/tutorial/using/chrome-ext", "_blank");
      toast({
        title: "Wallet Installation Required",
        description: "Please install Midnight Lace Wallet extension. After installation, return here to continue verification.",
        variant: "destructive",
        duration: 10000
      });
      return;
    }

    try {
      setConnectionStatus("connecting");
      console.log("Attempting to connect to Midnight Lace wallet...");

      if (!window.midnight?.mnLace) {
        throw new Error("Midnight Lace wallet not found");
      }

      // Get Discord ID from URL params
      const params = new URLSearchParams(window.location.search);
      const discordId = params.get('discordId');

      if (!discordId) {
        throw new Error("Missing Discord ID");
      }

      // Step 1: Initiate verification to get challenge
      await initiateVerification(discordId);

      // Step 2: Request wallet authorization
      console.log("Requesting wallet authorization...");
      const api = await window.midnight.mnLace.enable();

      if (!api) {
        throw new Error("Failed to enable Midnight Lace wallet");
      }

      // Step 3: Get wallet state
      console.log("Getting wallet state...");
      const state = await api.state();
      console.log("Wallet state:", state);
      setWalletState(state);
      setConnectionStatus("connected");

      // Step 4: Complete verification
      const result = await completeVerification(discordId, state.address);

      if (result.success) {
        toast({
          title: "Success!",
          description: "Your wallet has been verified and your role has been assigned!",
          duration: 10000
        });

        // Auto-close window after success
        let countdown = 10;
        const countdownInterval = setInterval(() => {
          toast({
            title: "Closing Window",
            description: `This window will close in ${countdown} seconds...`,
            duration: 3000
          });
          countdown--;
          if (countdown <= 0) {
            clearInterval(countdownInterval);
            window.close();
          }
        }, 1000);
      }

    } catch (error) {
      setConnectionStatus("error");
      console.error('Wallet connection failed:', error);
      setWalletState(null);

      const errorMessage = error instanceof Error 
        ? error.message
        : "Unable to connect to Midnight Lace Wallet. Please try again.";

      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 10000
      });
    }
  };

  const disconnectWallet = () => {
    setWalletState(null);
    setConnectionStatus("idle");

    toast({
      title: "Disconnected",
      description: "Wallet disconnected successfully.",
      duration: 4000
    });
  };

  const StatusIcon = () => {
    switch (connectionStatus) {
      case "connecting":
        return <Loader2 className="h-14 w-14 animate-spin text-zinc-400" />;
      case "connected":
        return <CheckCircle2 className="h-14 w-14 text-zinc-400" />;
      case "error":
        return <AlertCircle className="h-14 w-14 text-zinc-400" />;
      default:
        return <Wallet className="h-14 w-14 text-zinc-400" />;
    }
  };

  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#111111] to-[#0A0A0A] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4"
      >
        <Card className="backdrop-blur-lg bg-[#0A0A0A]/60 shadow-2xl border border-zinc-800/30 relative overflow-hidden">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-zinc-700/30 to-transparent" />
          <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-zinc-700/20 to-transparent" />

          <CardHeader className="space-y-6 pb-8">
            <AnimatePresence mode="wait">
              <motion.div 
                key={connectionStatus}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-center"
              >
                <div className="p-4 rounded-full bg-gradient-to-b from-[#0A0A0A] to-black/90 shadow-inner border border-zinc-800/30">
                  <StatusIcon />
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="space-y-2 text-center">
              <CardTitle className="text-3xl font-bold text-center bg-gradient-to-br from-zinc-200 via-white to-zinc-300 bg-clip-text text-transparent">
                {connectionStatus === "connected" ? "Verification Complete" : "Connect Your Wallet"}
              </CardTitle>
              <CardDescription className="text-base text-zinc-100/80">
                {connectionStatus === "connected" ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center gap-3"
                  >
                    <span className="font-medium text-zinc-400">Successfully Verified ✨</span>
                    {walletState?.address && (
                      <div className="px-3 py-1.5 bg-slate-800/40 rounded-lg border border-indigo-300/10">
                        <code className="text-sm text-slate-300/70">
                          {truncateAddress(walletState.address)}
                        </code>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  "Click the button below to connect your Midnight Lace Wallet and verify your Discord account. This will allow us to complete the verification process securely."
                )}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button 
              className={cn(
                "w-full h-12 transition-all duration-300 font-medium text-base shadow-lg",
                connectionStatus === "connected" 
                  ? "bg-zinc-900 hover:bg-zinc-800 text-white"
                  : "bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-white",
                "hover:shadow-xl hover:shadow-black/20"
              )}
              onClick={connectionStatus === "connected" ? disconnectWallet : connectWallet}
              disabled={connectionStatus === "connecting"}
            >
              {connectionStatus === "connecting" ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-center"
                >
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting...
                </motion.div>
              ) : connectionStatus === "connected" ? (
                "Disconnect Wallet"
              ) : (
                !isWalletAvailable ? "➡️ Install Midnight Lace Wallet" : "🔗 Connect Wallet"
              )}
            </Button>

            {connectionStatus === "error" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <span className="font-medium text-red-200">Connection Failed</span>
                  </div>
                  <p className="text-sm mt-1 ml-7 text-red-200/80">
                    Unable to connect to wallet. Please try again.
                  </p>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}