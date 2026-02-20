"use client";

import React, { useState } from "react";
import { useAleo } from "@/hooks/useAleo";
import { useWallet } from "@/hooks/useWallet";
import { PROGRAMS } from "@/lib/constants";
import {
  Play,
  Terminal,
  CheckCircle,
  XCircle,
  Loader2,
  Copy,
  Shield,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface TestCase {
  id: string;
  name: string;
  program: string;
  function: string;
  description: string;
  inputs: { name: string; type: string; placeholder: string; default: string }[];
}

const TEST_CASES: TestCase[] = [
  {
    id: "register",
    name: "Register User",
    program: PROGRAMS.CORE,
    function: "register_user",
    description: "Register a new user with a private profile",
    inputs: [
      {
        name: "username_hash",
        type: "field",
        placeholder: "e.g., 123456789",
        default: Math.floor(Math.random() * 1000000000).toString(),
      },
      {
        name: "current_time",
        type: "u64",
        placeholder: "Unix timestamp",
        default: Math.floor(Date.now() / 1000).toString(),
      },
    ],
  },
  {
    id: "create_poll",
    name: "Create Poll",
    program: PROGRAMS.BETTING,
    function: "create_poll",
    description: "Create a new prediction poll",
    inputs: [
      {
        name: "poll_seed",
        type: "field",
        placeholder: "Random seed",
        default: Math.floor(Math.random() * 1000000000).toString(),
      },
      {
        name: "deadline",
        type: "u64",
        placeholder: "Deadline timestamp",
        default: Math.floor((Date.now() + 86400000 * 7) / 1000).toString(),
      },
      {
        name: "timestamp",
        type: "u64",
        placeholder: "Current timestamp",
        default: Math.floor(Date.now() / 1000).toString(),
      },
    ],
  },
  {
    id: "place_bet",
    name: "Place Bet",
    program: PROGRAMS.BETTING,
    function: "place_bet",
    description: "Place a private bet on a poll",
    inputs: [
      {
        name: "poll_id",
        type: "field",
        placeholder: "Poll ID from create_poll",
        default: "",
      },
      { name: "option", type: "u8", placeholder: "1 or 2", default: "1" },
      {
        name: "amount",
        type: "u64",
        placeholder: "Amount in microcredits",
        default: "5000000",
      },
      {
        name: "timestamp",
        type: "u64",
        placeholder: "Current timestamp",
        default: Math.floor(Date.now() / 1000).toString(),
      },
      {
        name: "bet_seed",
        type: "field",
        placeholder: "Random seed",
        default: Math.floor(Math.random() * 1000000000).toString(),
      },
    ],
  },
  {
    id: "init_rep",
    name: "Initialize Reputation",
    program: PROGRAMS.REPUTATION,
    function: "init_reputation",
    description: "Initialize your reputation tracking",
    inputs: [],
  },
  {
    id: "read_poll",
    name: "Read Poll Data (Free)",
    program: PROGRAMS.BETTING,
    function: "READ_ONLY",
    description: "Read poll data from on-chain mappings (no transaction needed)",
    inputs: [
      {
        name: "poll_id",
        type: "field",
        placeholder: "Poll ID to query",
        default: "",
      },
    ],
  },
];

export default function PlaygroundTester() {
  const [expandedTest, setExpandedTest] = useState<string | null>(null);
  const [inputValues, setInputValues] = useState<Record<string, Record<string, string>>>({});
  const [results, setResults] = useState<Record<string, { success: boolean; data: string }>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const { executeTransaction, fetchPollData } = useAleo();
  const { connected } = useWallet();

  const getInputValue = (testId: string, inputName: string, defaultVal: string) => {
    return inputValues[testId]?.[inputName] ?? defaultVal;
  };

  const setInputValue = (testId: string, inputName: string, value: string) => {
    setInputValues((prev) => ({
      ...prev,
      [testId]: { ...(prev[testId] || {}), [inputName]: value },
    }));
  };

  const runTest = async (test: TestCase) => {
    setLoading((prev) => ({ ...prev, [test.id]: true }));

    try {
      if (test.function === "READ_ONLY") {
        // Read-only operation
        const pollId = getInputValue(test.id, "poll_id", "");
        if (!pollId) throw new Error("Poll ID is required");

        const data = await fetchPollData(pollId);
        setResults((prev) => ({
          ...prev,
          [test.id]: {
            success: true,
            data: JSON.stringify(data, null, 2),
          },
        }));
      } else {
        // Transaction execution
        if (!connected) throw new Error("Connect wallet first");

        const inputs = test.inputs.map((input) => {
          const value = getInputValue(test.id, input.name, input.default);
          return `${value}${input.type}`;
        });

        const txId = await executeTransaction(
          test.program,
          test.function,
          inputs
        );

        setResults((prev) => ({
          ...prev,
          [test.id]: {
            success: true,
            data: `Transaction ID: ${txId}`,
          },
        }));
      }
    } catch (error: any) {
      setResults((prev) => ({
        ...prev,
        [test.id]: {
          success: false,
          data: error.message || "Test failed",
        },
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [test.id]: false }));
    }
  };

  const copyPlaygroundInputs = (test: TestCase) => {
    const inputs = test.inputs
      .map((input) => {
        const value = getInputValue(test.id, input.name, input.default);
        return `${input.name}: ${value}${input.type}`;
      })
      .join("\n");

    const text = `Program: ${test.program}\nFunction: ${test.function}\n\nInputs:\n${inputs}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="rounded-2xl border border-syncial-border bg-syncial-card">
      <div className="border-b border-syncial-border p-5">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Terminal className="h-5 w-5 text-syncial-accent" />
          Contract Tester
        </h3>
        <p className="mt-1 text-sm text-syncial-muted">
          Test deployed contracts directly or copy inputs for Aleo Playground
        </p>
      </div>

      <div className="divide-y divide-syncial-border">
        {TEST_CASES.map((test) => (
          <div key={test.id} className="p-5">
            {/* Test header */}
            <button
              onClick={() =>
                setExpandedTest(expandedTest === test.id ? null : test.id)
              }
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    test.function === "READ_ONLY"
                      ? "bg-cyan-500/10 text-cyan-400"
                      : "bg-indigo-500/10 text-indigo-400"
                  }`}
                >
                  <Play className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-white">{test.name}</p>
                  <p className="text-xs text-syncial-muted">
                    {test.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {results[test.id] && (
                  <span>
                    {results[test.id].success ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                  </span>
                )}
                {expandedTest === test.id ? (
                  <ChevronUp className="h-4 w-4 text-syncial-muted" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-syncial-muted" />
                )}
              </div>
            </button>

            {/* Expanded content */}
            {expandedTest === test.id && (
              <div className="mt-4 space-y-3">
                {/* Program info */}
                <div className="rounded-lg bg-syncial-bg p-3">
                  <p className="font-mono text-xs text-syncial-muted">
                    <span className="text-syncial-primary">program:</span>{" "}
                    {test.program}
                  </p>
                  <p className="font-mono text-xs text-syncial-muted">
                    <span className="text-syncial-primary">function:</span>{" "}
                    {test.function}
                  </p>
                </div>

                {/* Inputs */}
                {test.inputs.length > 0 && (
                  <div className="space-y-2">
                    {test.inputs.map((input) => (
                      <div key={input.name}>
                        <label className="mb-1 block text-xs font-medium text-syncial-muted">
                          {input.name}{" "}
                          <span className="text-syncial-primary">
                            ({input.type})
                          </span>
                        </label>
                        <input
                          type="text"
                          value={getInputValue(
                            test.id,
                            input.name,
                            input.default
                          )}
                          onChange={(e) =>
                            setInputValue(test.id, input.name, e.target.value)
                          }
                          placeholder={input.placeholder}
                          className="w-full rounded-lg border border-syncial-border bg-syncial-bg px-3 py-2 font-mono text-sm text-white placeholder-syncial-muted outline-none focus:border-syncial-primary"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => runTest(test)}
                    disabled={
                      loading[test.id] ||
                      (test.function !== "READ_ONLY" && !connected)
                    }
                    className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading[test.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    {test.function === "READ_ONLY" ? "Query" : "Execute"}
                  </button>

                  {test.function !== "READ_ONLY" && (
                    <button
                      onClick={() => copyPlaygroundInputs(test)}
                      className="flex items-center gap-2 rounded-lg border border-syncial-border px-4 py-2 text-sm text-syncial-muted transition-colors hover:border-syncial-primary hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                      Copy for Playground
                    </button>
                  )}
                </div>

                {/* Result */}
                {results[test.id] && (
                  <div
                    className={`rounded-lg p-3 ${
                      results[test.id].success
                        ? "bg-green-500/10 text-green-300"
                        : "bg-red-500/10 text-red-300"
                    }`}
                  >
                    <pre className="whitespace-pre-wrap font-mono text-xs">
                      {results[test.id].data}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}