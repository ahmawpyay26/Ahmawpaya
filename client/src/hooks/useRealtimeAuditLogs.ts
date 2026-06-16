import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function useRealtimeAuditLogs(onNewLog?: (log: any) => void) {
  const { data: logs, refetch } = trpc.auditLogs.list.useQuery();
  const previousLogsRef = useRef<any[]>([]);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Set up polling to check for new audit logs every 3 seconds
    pollIntervalRef.current = setInterval(async () => {
      await refetch();
    }, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [refetch]);

  useEffect(() => {
    if (logs && logs.length > 0) {
      // Check if there are new logs compared to previous state
      const previousCount = previousLogsRef.current.length;
      const currentCount = logs.length;

      if (currentCount > previousCount) {
        const newLogs = logs.slice(0, currentCount - previousCount);
        newLogs.forEach((log) => {
          const actionText = {
            create: "ဖန်တီးခြင်း",
            update: "ပြင်ဆင်ခြင်း",
            delete: "ဖျက်ခြင်း",
          }[log.action] || log.action;

          toast.info(
            `📋 ${log.staffName} ${actionText} ${log.entityLabel}`,
            { duration: 5000 }
          );

          if (onNewLog) {
            onNewLog(log);
          }
        });
      }

      previousLogsRef.current = logs;
    }
  }, [logs, onNewLog]);

  return { logs, refetch };
}
