"use client";

import React, { useEffect, useState } from "react";
import { aleoService } from "@/lib/aleo";
import { DEPLOYMENTS, getDeploymentStatus } from "@/lib/deployment";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Shield,
  AlertTriangle,
} from "lucide-react";

interface ProgramStatus {
  name: string;
  programId: string;
  deployed: boolean;
  checking: boolean;
  explorerUrl: string;
}

export default function DeploymentStatus() {
  const [programs, setPrograms] = useState<ProgramStatus[]>([
    {
      name: "Syncial Core",
      programId: DEPLOYMENTS.programs.core,
      deployed: false,
      checking: true,
      explorerUrl: DEPLOYMENTS.explorerUrls.core,
    },
    {
      name: "Syncial Betting",
      programId: DEPLOYMENTS.programs.betting,
      deployed: false,
      checking: true,
      explorerUrl: DEPLOYMENTS.explorerUrls.betting,
    },
    {
      name: "Syncial Reputation",
      programId: DEPLOYMENTS.programs.reputation,
      deployed: false,
      checking: true,
      explorerUrl: DEPLOYMENTS.explorerUrls.reputation,
    },
  ]);

  const [allDeployed, setAllDeployed] = useState(false);

  useEffect(() => {
    const checkDeployments = async () => {
      const results = await aleoService.verifyDeployments();

      setPrograms((prev) =>
        prev.map((p) => {
          let deployed = false;
          if (p.programId.includes("core")) deployed = results.core;
          if (p.programId.includes("betting")) deployed = results.betting;
          if (p.programId.includes("reputation")) deployed = results.reputation;

          return { ...p, deployed, checking: false };
        })
      );

      setAllDeployed(results.allDeployed);
    };

    checkDeployments();
  }, []);

  return (
    <div className="rounded-2xl border border-syncial-border bg-syncial-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
          <Shield className="h-5 w-5 text-syncial-primary" />
          Contract Deployment Status
        </h3>
        {allDeployed ? (
          <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
            <CheckCircle className="h-3 w-3" />
            All Deployed
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
            <AlertTriangle className="h-3 w-3" />
            Pending
          </span>
        )}
      </div>

      <div className="space-y-3">
        {programs.map((program) => (
          <div
            key={program.programId}
            className="flex items-center justify-between rounded-xl bg-syncial-bg p-4"
          >
            <div className="flex items-center gap-3">
              {program.checking ? (
                <Loader2 className="h-5 w-5 animate-spin text-syncial-muted" />
              ) : program.deployed ? (
                <CheckCircle className="h-5 w-5 text-green-400" />
              ) : (
                <XCircle className="h-5 w-5 text-red-400" />
              )}
              <div>
                <p className="text-sm font-medium text-white">{program.name}</p>
                <p className="font-mono text-xs text-syncial-muted">
                  {program.programId}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {program.deployed && (
                <a
                  href={program.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 rounded-lg bg-syncial-card px-3 py-1.5 text-xs text-syncial-primary transition-colors hover:bg-syncial-primary/10"
                >
                  Explorer
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  program.checking
                    ? "bg-syncial-border text-syncial-muted"
                    : program.deployed
                      ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                }`}
              >
                {program.checking
                  ? "Checking..."
                  : program.deployed
                    ? "Live"
                    : "Not Deployed"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {!allDeployed && !programs.some((p) => p.checking) && (
        <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <p className="text-sm text-yellow-300">
            <strong>Deploy via Aleo Playground:</strong>
          </p>
          <ol className="mt-2 space-y-1 text-xs text-yellow-300/70">
            <li>1. Go to play.leo-lang.org</li>
            <li>2. Paste each program's Leo code</li>
            <li>3. Click Build → Deploy</li>
            <li>4. Update <code>frontend/src/lib/deployments.ts</code> with tx IDs</li>
          </ol>
        </div>
      )}

      {/* Playground link */}
      <div className="mt-4 text-center">
        <a
          href="https://play.leo-lang.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-syncial-primary hover:underline"
        >
          Open Aleo Playground
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}