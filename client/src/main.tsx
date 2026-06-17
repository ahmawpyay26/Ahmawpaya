import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import "./index.css";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  window.location.href = getLoginUrl();
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    console.error("[API Mutation Error]", error);
  }
});

// Determine API endpoint based on environment
const getApiUrl = () => {
  // Check if running in Cordova/Capacitor/APK environment
  const isCordova = typeof window !== 'undefined' && !!(window as any).cordova;
  const isCapacitor = typeof window !== 'undefined' && !!(window as any).Capacitor;
  const isNative = isCordova || isCapacitor;
  
  console.log('[API Config] isCordova:', isCordova, 'isCapacitor:', isCapacitor, 'isNative:', isNative);
  console.log('[API Config] User Agent:', navigator.userAgent);
  
  if (isNative) {
    // For APK: use the deployed web server URL
    const deployedUrl = import.meta.env.VITE_API_URL || 'https://waterdash-95vzqj2j.manus.space';
    const apiUrl = `${deployedUrl}/api/trpc`;
    console.log('[API Config] Using native endpoint:', apiUrl);
    return apiUrl;
  }
  
  // For web browser: use relative path
  console.log('[API Config] Using relative endpoint: /api/trpc');
  return '/api/trpc';
};

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: getApiUrl(),
      transformer: superjson,
      fetch(input, init) {
        console.log('[API Request] URL:', input);
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        }).catch(err => {
          console.error('[API Request Error]', err);
          throw err;
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </trpc.Provider>
);
