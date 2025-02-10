import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { mainnet } from "thirdweb/chains";

// Initialize thirdweb client
const client = createThirdwebClient({
  clientId: "20ea3a0d7e580e8017d0c96835765a01",
});

const WalletConnection = () => {
  return (
    <div style={{ display: 'none' }}>
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
  );
};

export default WalletConnection; 