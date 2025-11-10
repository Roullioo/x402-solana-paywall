/**
 * Agent policy: décide si un paiement est autorisé
 * - Budget max par tâche
 * - Whitelist de hosts
 */

export interface PolicyConfig {
  maxLamportsPerTask: number;
  whitelistHosts: string[];
}

export interface PaymentDecision {
  allow: boolean;
  reason: string;
}

export function shouldPay(
  host: string,
  amountLamports: number,
  config: PolicyConfig
): PaymentDecision {
  // Vérifier budget
  if (amountLamports > config.maxLamportsPerTask) {
    return {
      allow: false,
      reason: `Amount ${amountLamports} exceeds max budget ${config.maxLamportsPerTask}`,
    };
  }

  // Vérifier whitelist
  const isWhitelisted = config.whitelistHosts.some((whiteHost) => {
    return host === whiteHost || host.endsWith(`.${whiteHost}`);
  });

  if (!isWhitelisted) {
    return {
      allow: false,
      reason: `Host ${host} not in whitelist: ${config.whitelistHosts.join(', ')}`,
    };
  }

  return {
    allow: true,
    reason: 'Payment authorized by policy',
  };
}

export function loadPolicyConfig(): PolicyConfig {
  const maxLamportsPerTask = parseInt(
    process.env.AGENT_MAX_LAMPORTS_PER_TASK || '500000',
    10
  );

  const whitelistHosts = (process.env.AGENT_WHITELIST_HOSTS || 'localhost:3000')
    .split(',')
    .map((h) => h.trim())
    .filter(Boolean);

  return {
    maxLamportsPerTask,
    whitelistHosts,
  };
}

