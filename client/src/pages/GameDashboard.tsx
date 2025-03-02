import { ReactNode, useEffect, useRef } from 'react';
import { createThirdwebClient } from "thirdweb";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { mainnet } from "thirdweb/chains";
import { NeumorphicButton } from "@/components/ui/neumorphic-button";
import { Users, ChartNetwork, MessagesSquare, Wallet, X } from "lucide-react";
import { motion } from "framer-motion";
import TopBar from "@/components/layout/TopBar";
import LeftMenu from "@/components/layout/LeftMenu";
import RightPanel from "@/components/layout/RightPanel";
import GameContainer from "@/components/game/GameContainer";
import { ThirdwebProvider } from "thirdweb/react";

// Initialize thirdweb client
const client = createThirdwebClient({
  clientId: "20ea3a0d7e580e8017d0c96835765a01",
});

interface DashboardSectionProps {
  children: ReactNode;
  className?: string;
}

const DashboardSection = ({ children, className = "" }: DashboardSectionProps) => (
  <div className={`bg-black/40 backdrop-blur-sm border border-cyan-500/20 ${className}`}>
    {children}
  </div>
);

interface DashboardSectionProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

function GameDashboardContent() {
  const connectButtonRef = useRef<HTMLButtonElement>(null);
  const account = useActiveAccount();

  useEffect(() => {
    if (account) {
      console.log('React: Account connected:', account.address);
      // Send wallet info to game iframe
      const gameIframe = document.querySelector('iframe');
      if (gameIframe && gameIframe.contentWindow) {
        gameIframe.contentWindow.postMessage({
          type: 'wallet:connected',
          address: account.address,
          chainId: account.chainId,
          timestamp: Date.now()
        }, '*');
      }
    }
  }, [account]);

  useEffect(() => {
    console.log('React: Setting up message listener');
    
    const handleMessage = (event: MessageEvent) => {
      console.log('React: Message received', {
        data: event.data,
        origin: event.origin,
        source: event.source
      });
      
      if (event.data.type === 'mw:connectWallet') {
        console.log('React: Connect wallet message received');
        // Try finding the button by its class name
        const connectButton = document.querySelector('.tw-connect-wallet');
        if (connectButton) {
          console.log('React: Found connect button, clicking');
          (connectButton as HTMLElement).click();
        } else {
          console.error('React: Could not find connect button');
          // Log all buttons for debugging
          console.log('React: Available buttons:', document.querySelectorAll('button'));
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Hidden connect button */}
      <div id="wallet-connect-wrapper" style={{ position: 'absolute', top: 0, left: 0, opacity: 0, pointerEvents: 'none' }}>
        <ConnectButton
          client={client}
          wallets={[
            createWallet("io.metamask"),
            createWallet("com.coinbase.wallet"),
            createWallet("me.rainbow")
          ]}
          chain={mainnet}
        />
      </div>
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Stats Display with Icons Above */}
        <div className="w-full max-w-6xl mx-auto">
          {/* Navigation Icons */}
          <div className="flex justify-end gap-2 mb-4">
            {[
              { icon: Users, label: "Profile", color: "text-blue-400" },
              { icon: ChartNetwork, label: "Network", color: "text-yellow-400" },
              { icon: MessagesSquare, label: "Messages", color: "text-emerald-400" },
              { icon: Wallet, label: "Wallet", color: "text-purple-400" }
            ].map((item) => (
              <motion.div
                key={item.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NeumorphicButton
                  variant="raised"
                  className="p-3"
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    whileHover={{ rotate: 5 }}
                  >
                    <item.icon className={`w-5 h-5 ${item.color}`} />
                  </motion.div>
                </NeumorphicButton>
              </motion.div>
            ))}
          </div>

          {/* Stats Container */}
          <div className="md:p-12 rounded-2xl bg-surface shadow-neumorphic min-h-[700px] w-full mb-8">
            <div className="flex items-center justify-center h-full relative">
              {/* Game Container */}
              <div className="fixed inset-0 z-50">
                <iframe 
                  src="/mw/index.html"
                  className="w-full h-full"
                  style={{ 
                    border: 'none',
                    background: '#000'
                  }}
                  allow="clipboard-write"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              </div>

              {/* Optional: Add a close/minimize button */}
              <button 
                className="fixed top-4 right-4 z-50 p-2 bg-black/80 rounded-full hover:bg-black/60 transition-colors"
                onClick={() => {/* Add minimize handler */}}
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Number Controls - Centered */}
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <NeumorphicButton
                  variant="switch"
                  isActive={false}
                  className="w-12 h-12 flex items-center justify-center text-accent-muted"
                >
                  <motion.span
                    initial={{ y: 0 }}
                    whileHover={{ y: -2 }}
                  >
                    {i + 1}
                  </motion.span>
                </NeumorphicButton>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GameDashboard() {
  return (
    <ThirdwebProvider client={client}>
      <GameDashboardContent />
    </ThirdwebProvider>
  );
}