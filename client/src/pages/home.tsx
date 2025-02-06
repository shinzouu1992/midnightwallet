import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#111111] to-[#0A0A0A]">
      <Card className="w-full max-w-md mx-4 backdrop-blur-lg bg-black/80 shadow-2xl border border-zinc-800/30">
        <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-zinc-700/30 to-transparent" />
        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-zinc-700/20 to-transparent" />
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-br from-zinc-200 via-white to-zinc-300 bg-clip-text text-transparent">
            Midnight Wallet Required
          </CardTitle>
          <CardDescription className="text-center text-zinc-400 mt-2">
            To proceed with verification, please install the Midnight Lace Wallet browser extension. This wallet ensures secure connections and enables the verification process.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Link href="https://docs.midnight.network/develop/tutorial/using/chrome-ext" target="_blank">
            <Button 
              className="w-full h-12 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 text-white font-medium text-lg shadow-lg transition-all duration-200 hover:shadow-xl hover:shadow-black/20"
              size="lg"
            >
              ➡️ Install Midnight Lace Wallet
            </Button>
          </Link>
          <p className="text-center text-zinc-500 text-sm">
            Once installed, reload this page to continue.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}