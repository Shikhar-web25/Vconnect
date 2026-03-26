import { supabase } from '../../supabaseClient';

type ErrorSource = 'app' | 'auth' | 'network' | 'screen';

export const logClientError = async (
  source: ErrorSource,
  error: unknown,
  metadata: Record<string, unknown> = {},
) => {
  const normalized = error instanceof Error ? error : new Error(String(error));
  const payload = {
    source,
    message: normalized.message,
    stack: normalized.stack ?? null,
    metadata,
    created_at: new Date().toISOString(),
  };

  console.warn(`[${source}]`, normalized.message);
  try {
    const { error: insertError } = await supabase.from('client_errors').insert(payload);
    if (insertError) {
      // Keep silent when table is not present; this logger should never break runtime behavior.
    }
  } catch {
    // Ignore monitoring transport failures.
  }
};

export const installGlobalErrorHandler = () => {
  const g = global as any;
  const errorUtils = g?.ErrorUtils;
  if (!errorUtils?.getGlobalHandler || !errorUtils?.setGlobalHandler) {
    return () => {};
  }

  const originalHandler = errorUtils.getGlobalHandler();
  const nextHandler = (error: Error, isFatal?: boolean) => {
    logClientError('app', error, { isFatal: !!isFatal });
    if (originalHandler) {
      originalHandler(error, isFatal);
    }
  };

  errorUtils.setGlobalHandler(nextHandler);
  return () => {
    if (originalHandler) {
      errorUtils.setGlobalHandler(originalHandler);
    }
  };
};
