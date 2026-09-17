import fastify from "fastify";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import { signalRoutes } from "./routes/signals";
import { addClient, startMarketSimulation } from "./services/marketSimulator";
import { getMarketSnapShot } from "./state/marketState";
import config from "./config";

const app = fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:HH:MM:ss",
        ignore: "pid,hostname",
        singleLine: true,
      },
    },
  },
});

const paint = (text: string, color: string): string =>
  `${color}${text}\u001b[0m`;
const cyan = "\u001b[36m";
const green = "\u001b[32m";
const yellow = "\u001b[33m";
const dim = "\u001b[2m";

function printStartupPanel(): void {
  const httpUrl = `http://${config.host}:${config.port}`;
  const websocketUrl = `ws://${config.host}:${config.port}/ws`;

  console.log(`
${paint("╭──────────────────────────────────────────────╮", cyan)}
${paint("│", cyan)}  ${paint("◆", green)} ${paint("TRADING CORE", cyan)} ${paint("/ online", green)}              ${paint("│", cyan)}
${paint("├──────────────────────────────────────────────┤", cyan)}
${paint("│", cyan)}  ${paint("◉", green)} HTTP       ${httpUrl.padEnd(31)}${paint("│", cyan)}
${paint("│", cyan)}  ${paint("◈", green)} WEBSOCKET  ${websocketUrl.padEnd(31)}${paint("│", cyan)}
${paint("│", cyan)}  ${paint("↯", yellow)} MARKET     ${"streaming every 1s".padEnd(31)}${paint("│", cyan)}
${paint("│", cyan)}  ${paint("⌁", yellow)} WATCH      ${"hot reload armed".padEnd(31)}${paint("│", cyan)}
${paint("╰──────────────────────────────────────────────╯", cyan)}
${paint("  secure channel established · awaiting traffic", dim)}
`);
}

await app.register(cors, {
  origin: "true",
});

await app.register(websocket);

await app.register(signalRoutes);
app.get("/health", async (request, reply) => {
  return { status: "Server up and running🔥🔥", timeStamp: Date.now() };
});

app.get("/market-snapshot", async (request, reply) => {
  return { type: "market_snapshot", data: getMarketSnapShot() };
});
app.get("/ws", { websocket: true }, (socket) => {
  addClient(socket);

  socket.send(
    JSON.stringify({ type: "market_snapshot", data: getMarketSnapShot() }),
  );
});

await app.listen({ port: Number(config.port), host: config.host });
startMarketSimulation();
printStartupPanel();
