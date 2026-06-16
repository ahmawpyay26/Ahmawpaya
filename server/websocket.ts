import { Server as HTTPServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

interface AuditLogSubscriber {
  ws: WebSocket;
  adminId: number;
}

const subscribers: Set<AuditLogSubscriber> = new Set();

export function setupWebSocket(server: HTTPServer) {
  const wss = new WebSocketServer({ server, path: "/api/ws" });

  wss.on("connection", (ws: WebSocket) => {
    console.log("[WebSocket] Client connected");

    ws.on("message", (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.type === "subscribe" && data.adminId) {
          subscribers.add({ ws, adminId: data.adminId });
          ws.send(JSON.stringify({ type: "subscribed", adminId: data.adminId }));
          console.log(`[WebSocket] Admin ${data.adminId} subscribed to audit logs`);
        }
      } catch (err) {
        console.error("[WebSocket] Error parsing message:", err);
      }
    });

    ws.on("close", () => {
      subscribers.forEach((sub) => {
        if (sub.ws === ws) {
          subscribers.delete(sub);
          console.log("[WebSocket] Client disconnected");
        }
      });
    });

    ws.on("error", (err: Error) => {
      console.error("[WebSocket] Error:", err);
    });
  });

  return wss;
}

export function broadcastAuditLog(auditLog: any) {
  const message = JSON.stringify({ type: "auditLog", data: auditLog });
  subscribers.forEach((sub) => {
    if (sub.ws.readyState === WebSocket.OPEN) {
      sub.ws.send(message);
    }
  });
}
