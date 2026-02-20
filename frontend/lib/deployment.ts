// =============================================
// DEPLOYMENT INFORMATION
// Update these after deploying via Aleo Playground
// =============================================

export const DEPLOYMENTS = {
    // Network
    network: "testnet" as const,
  
    // Program IDs (these are fixed based on our program names)
    programs: {
      core: "syncial_core_v1.aleo",
      betting: "syncial_betting_v1.aleo",
      reputation: "syncial_reputation_v1.aleo",
    },
  
    // Fill these after deploying via playground
    // You get these from the playground or Aleo Explorer
    transactionIds: {
      core: "", // e.g., "at1xxxx..."
      betting: "", // e.g., "at1xxxx..."
      reputation: "", // e.g., "at1xxxx..."
      platformInit: "", // initialize_platform tx
    },
  
    // Deployer address (your wallet address)
    deployerAddress: "", // e.g., "aleo1xxxx..."
  
    // Oracle address hash used in initialize_platform
    oracleAddressHash: "", // e.g., "12345field"
  
    // Deployment timestamps
    deployedAt: {
      core: "",
      betting: "",
      reputation: "",
    },
  
    // Explorer URLs
    explorerUrls: {
      core: "https://explorer.aleo.org/program/syncial_core_v1.aleo",
      betting: "https://explorer.aleo.org/program/syncial_betting_v1.aleo",
      reputation: "https://explorer.aleo.org/program/syncial_reputation_v1.aleo",
    },
  } as const;
  
  // Deployment status helper
  export function getDeploymentStatus(): {
    isFullyDeployed: boolean;
    deployed: string[];
    pending: string[];
  } {
    const deployed: string[] = [];
    const pending: string[] = [];
  
    if (DEPLOYMENTS.transactionIds.core) {
      deployed.push("core");
    } else {
      pending.push("core");
    }
  
    if (DEPLOYMENTS.transactionIds.betting) {
      deployed.push("betting");
    } else {
      pending.push("betting");
    }
  
    if (DEPLOYMENTS.transactionIds.reputation) {
      deployed.push("reputation");
    } else {
      pending.push("reputation");
    }
  
    return {
      isFullyDeployed: pending.length === 0,
      deployed,
      pending,
    };
  }