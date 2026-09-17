import type { WebSocket } from "ws";
import type { Asset, WebSocketEvent } from "../types";
import { updatePrice } from "../state/marketState";

const assets: Asset[] = ["BTC/USD", "ETH/USD", "SOL/USD"];

const clients = new Set<WebSocket>();

export function addClient(client: WebSocket) {
  clients.add(client);

  client.on("close", () => {
    clients.delete(client);
  });
}

export function broadcast(event: WebSocketEvent): void {
  const message = JSON.stringify(event);
  for (const client of clients) {
    if (client.readyState === 1) {
      client.send(message);
    }
  }
}

export function startMarketSimulation(interval: number = 1000): void {
  setInterval(() => {
    for (const asset of assets) {
      const tick = updatePrice(asset);
      const event: WebSocketEvent = {
        type: "market",
        data: tick,
      };
      broadcast(event);
    }
  }, interval);
}
