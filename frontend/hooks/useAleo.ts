"use client";

import { useCallback, useState, useEffect } from "react";
import { aleoService } from "@/lib/aleo";
import { useStore } from "@/store/useStory";
import { PROGRAMS, DEFAULT_TX_FEE } from "@/lib/constants";

interface TxResult {
  transactionId: string | null;
  status: "idle" | "building" | "signing" | "broadcasting" | "confirmed" | "error";
  error: string | null;
}

export function useAleo() {
  const [txResult, setTxResult] = useState<TxResult>({
    transactionId: null,
    status: "idle",
    error: null,
  });

  const [deploymentsVerified, setDeploymentsVerified] = useState<{
    core: boolean;
    betting: boolean;
    reputation: boolean;
    allDeployed: boolean;
  } | null>(null);

  const { address, setLoading } = useStore();

  // Verify deployments on mount
  useEffect(() => {
    const verify = async () => {
      try {
        const result = await aleoService.verifyDeployments();
        setDeploymentsVerified(result);
        console.log("Deployment verification:", result);
      } catch (error) {
        console.error("Failed to verify deployments:", error);
      }
    };
    verify();
  }, []);

  // Generic transaction executor via Leo Wallet
  const executeTransaction = useCallback(
    async (
      programId: string,
      functionName: string,
      inputs: string[],
      fee: number = DEFAULT_TX_FEE
    ): Promise<string> => {
      if (!address) {
        throw new Error("Wallet not connected");
      }

      setTxResult({ transactionId: null, status: "building", error: null });
      setLoading(true);

      try {
        // Check if Leo Wallet is available
        const wallet = (window as any).leoWallet;

        if (!wallet) {
          // Demo mode - simulate transaction
          console.log("Demo mode - simulating transaction");
          console.log(`Program: ${programId}`);
          console.log(`Function: ${functionName}`);
          console.log(`Inputs:`, inputs);
          console.log(`Fee: ${fee}`);

          // Simulate delay
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const fakeTxId = `at1_demo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

          setTxResult({
            transactionId: fakeTxId,
            status: "confirmed",
            error: null,
          });

          return fakeTxId;
        }

        // Real wallet execution
        setTxResult({ transactionId: null, status: "signing", error: null });

        const result = await wallet.requestExecution({
          programId,
          functionName,
          inputs,
          fee,
        });

        setTxResult({
          transactionId: result?.transactionId || null,
          status: "broadcasting",
          error: null,
        });

        // Wait a bit for broadcasting
        await new Promise((resolve) => setTimeout(resolve, 3000));

        setTxResult({
          transactionId: result?.transactionId || null,
          status: "confirmed",
          error: null,
        });

        return result?.transactionId || "";
      } catch (error: any) {
        const errorMsg = error.message || "Transaction failed";
        setTxResult({
          transactionId: null,
          status: "error",
          error: errorMsg,
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [address, setLoading]
  );

  // =============================================
  // CORE PROGRAM FUNCTIONS
  // =============================================

  const registerUser = useCallback(
    async (usernameHash: string) => {
      const currentTime = Math.floor(Date.now() / 1000);
      const { programId, functionName, inputs, fee } =
        aleoService.buildRegisterUserInputs(usernameHash, currentTime);
      return executeTransaction(programId, functionName, inputs, fee);
    },
    [executeTransaction]
  );

  // =============================================
  // BETTING PROGRAM FUNCTIONS
  // =============================================

  const createPoll = useCallback(
    async (pollSeed: string, deadline: number) => {
      const timestamp = Math.floor(Date.now() / 1000);
      const { programId, functionName, inputs, fee } =
        aleoService.buildCreatePollInputs(pollSeed, deadline, timestamp);
      return executeTransaction(programId, functionName, inputs, fee);
    },
    [executeTransaction]
  );

  const placeBet = useCallback(
    async (pollId: string, option: number, amount: number) => {
      const timestamp = Math.floor(Date.now() / 1000);
      const betSeed = Math.floor(Math.random() * 1000000000).toString();
      const { programId, functionName, inputs, fee } =
        aleoService.buildPlaceBetInputs(pollId, option, amount, timestamp, betSeed);
      return executeTransaction(programId, functionName, inputs, fee);
    },
    [executeTransaction]
  );

  const resolvePoll = useCallback(
    async (pollId: string, winner: number, oracleHash: string) => {
      const { programId, functionName, inputs, fee } =
        aleoService.buildResolvePollInputs(pollId, winner, oracleHash);
      return executeTransaction(programId, functionName, inputs, fee);
    },
    [executeTransaction]
  );

  // =============================================
  // REPUTATION PROGRAM FUNCTIONS
  // =============================================

  const initReputation = useCallback(async () => {
    const { programId, functionName, inputs, fee } =
      aleoService.buildInitReputationInputs();
    return executeTransaction(programId, functionName, inputs, fee);
  }, [executeTransaction]);

  // =============================================
  // READ FUNCTIONS (no wallet needed)
  // =============================================

  const fetchPollData = useCallback(async (pollId: string) => {
    return aleoService.getPollData(pollId);
  }, []);

  const fetchReputation = useCallback(async (userHash: string) => {
    return aleoService.getReputationData(userHash);
  }, []);

  const checkPollExists = useCallback(async (pollId: string) => {
    return aleoService.pollExists(pollId);
  }, []);

  const fetchPlatformTreasury = useCallback(async () => {
    return aleoService.getPlatformTreasury();
  }, []);

  // Reset transaction state
  const resetTx = useCallback(() => {
    setTxResult({ transactionId: null, status: "idle", error: null });
  }, []);

  return {
    // Transaction state
    txResult,
    resetTx,

    // Deployment status
    deploymentsVerified,

    // Write functions (need wallet)
    registerUser,
    createPoll,
    placeBet,
    resolvePoll,
    initReputation,

    // Read functions (no wallet needed)
    fetchPollData,
    fetchReputation,
    checkPollExists,
    fetchPlatformTreasury,
  };
}