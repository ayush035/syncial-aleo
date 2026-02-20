"use client";

import React from "react";
import DeploymentStatus from "@/components/DeploymentStatus";
import PlaygroundTester from "@/components/PlaygroundTester";
import { DEPLOYMENTS } from "@/lib/deployment";
import {
  Shield,
  Code,
  ExternalLink,
  Database,
  Settings,
} from "lucide-react";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-white">
          Developer Dashboard
        </h1>
        <p className="text-syncial-muted">
          Manage deployments, test contracts, and monitor the platform.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink
          href="https://play.leo-lang.org/"
          icon={<Code className="h-5 w-5" />}
          label="Aleo Playground"
          description="Deploy & test contracts"
        />
        <QuickLink
          href="https://explorer.aleo.org/"
          icon={<Database className="h-5 w-5" />}
          label="Aleo Explorer"
          description="View on-chain data"
        />
        <QuickLink
          href="https://faucet.aleo.org/"
          icon={<Shield className="h-5 w-5" />}
          label="Testnet Faucet"
          description="Get test credits"
        />
      </div>

      {/* Deployment Status */}
      <DeploymentStatus />

      {/* Contract Tester */}
      <PlaygroundTester />

      {/* Deployment Config */}
      <div className="rounded-2xl border border-syncial-border bg-syncial-card p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
          <Settings className="h-5 w-5" />
          Current Configuration
        </h3>
        <pre className="overflow-x-auto rounded-xl bg-syncial-bg p-4 font-mono text-xs text-syncial-muted">
          {JSON.stringify(DEPLOYMENTS, null, 2)}
        </pre>
        <p className="mt-3 text-xs text-syncial-muted">
          Edit{" "}
          <code className="rounded bg-syncial-bg px-1 py-0.5 text-syncial-primary">
            frontend/src/lib/deployments.ts
          </code>{" "}
          to update deployment info after deploying via playground.
        </p>
      </div>

      {/* Deployment Checklist */}
      <div className="rounded-2xl border border-syncial-border bg-syncial-card p-6">
        <h3 className="mb-4 text-lg font-semibold text-white">
          📋 Deployment Checklist
        </h3>
        <div className="space-y-3">
          <ChecklistItem
            step={1}
            title="Get testnet credits"
            description="Visit faucet.aleo.org and claim credits to your Leo Wallet"
            link="https://faucet.aleo.org/"
          />
          <ChecklistItem
            step={2}
            title="Deploy syncial_core_v1.aleo"
            description="Copy programs/syncial_core/src/main.leo → Playground → Build → Deploy"
            link="https://play.leo-lang.org/"
          />
          <ChecklistItem
            step={3}
            title="Deploy syncial_betting_v1.aleo"
            description="Copy programs/syncial_betting/src/main.leo → Playground → Build → Deploy"
            link="https://play.leo-lang.org/"
          />
          <ChecklistItem
            step={4}
            title="Deploy syncial_reputation_v1.aleo"
            description="Copy programs/syncial_reputation/src/main.leo → Playground → Build → Deploy"
            link="https://play.leo-lang.org/"
          />
          <ChecklistItem
            step={5}
            title="Initialize platform"
            description="Call initialize_platform on syncial_betting_v1 with your oracle hash"
            link="https://play.leo-lang.org/"
          />
          <ChecklistItem
            step={6}
            title="Update deployments.ts"
            description="Add transaction IDs and deployer address to frontend/src/lib/deployments.ts"
          />
          <ChecklistItem
            step={7}
            title="Test functions"
            description="Use the Contract Tester above to verify all functions work"
          />
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-3 rounded-xl border border-syncial-border bg-syncial-card p-4 transition-all hover:border-syncial-primary/50 hover:bg-syncial-card/80"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-syncial-bg text-syncial-primary transition-colors group-hover:bg-syncial-primary/10">
        {icon}
      </div>
      <div>
        <p className="flex items-center gap-1 text-sm font-medium text-white">
          {label}
          <ExternalLink className="h-3 w-3 text-syncial-muted" />
        </p>
        <p className="text-xs text-syncial-muted">{description}</p>
      </div>
    </a>
  );
}

function ChecklistItem({
  step,
  title,
  description,
  link,
}: {
  step: number;
  title: string;
  description: string;
  link?: string;
}) {
  return (
    <div className="flex gap-3 rounded-xl bg-syncial-bg p-4">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-syncial-primary/10 text-xs font-bold text-syncial-primary">
        {step}
      </span>
      <div>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="mt-0.5 text-xs text-syncial-muted">{description}</p>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-xs text-syncial-primary hover:underline"
          >
            Open <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}