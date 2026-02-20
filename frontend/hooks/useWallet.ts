"use client";

import { useCallback, useEffect, useState } from "react";
import { useStore } from "@/store/useStory";

export function useWallet() {
  const { connected, address, setConnected, setAddress, setProfile } = useStore();
  const [walletAvailable, setWalletAvailable] = useState(false);

  useEffect(() => {
    // Check if Leo Wallet is available
    const checkWallet = () => {
      if (typeof window !== "undefined" && (window as any).leoWallet) {
        setWalletAvailable(true);
      }
    };
    
    checkWallet();
    window.addEventListener("load", checkWallet);
    return () => window.removeEventListener("load", checkWallet);
  }, []);

  const connect = useCallback(async () => {
    try {
      if (!(window as any).leoWallet) {
        // For demo/dev: use a mock address
        const mockAddress = "aleo1" + Array.from({ length: 58 }, () => 
          "abcdefghijklmnopqrstuvwxyz0123456789"[Math.floor(Math.random() * 36)]
        ).join("");
        
        setAddress(mockAddress);
        setConnected(true);
        return mockAddress;
      }

      const result = await (window as any).leoWallet.connect();
      if (result?.address) {
        setAddress(result.address);
        setConnected(true);
        return result.address;
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      throw error;
    }
  }, [setAddress, setConnected]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setConnected(false);
    setProfile(null);
  }, [setAddress, setConnected, setProfile]);

  return {
    connected,
    address,
    walletAvailable,
    connect,
    disconnect,
  };
}