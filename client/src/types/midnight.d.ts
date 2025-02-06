declare interface Window {
  midnight?: {
    mnLace: {
      apiVersion: string;
      name: string;
      enable: () => Promise<{
        state: () => Promise<{
          address: string;
          balances: {
            [key: string]: number;
          };
        }>;
        isEnabled: () => Promise<boolean>;
      }>;
      isEnabled: () => Promise<boolean>;
    };
  };
}