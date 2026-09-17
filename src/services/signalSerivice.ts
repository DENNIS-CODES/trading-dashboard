import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { getPrice } from "../state/marketState";
import { Asset, assets, TradeSignal } from "../types";
import { broadcast } from "./marketSimulator";

const prisma = process.env.DATABASE_URL
  ? new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    })
  : null;
const signals: TradeSignal[] = [];
const maxStoredSignals = 100;
let nextSignalId = 1;

export async function generateTradeSignal(
  requestedAsset?: Asset,
): Promise<TradeSignal> {
  const asset =
    requestedAsset ?? assets[Math.floor(Math.random() * assets.length)];

  const price = getPrice(asset);
  const random = Math.random();
  let side: "BUY" | "SELL" | "HOLD";
  if (random < 0.35) {
    side = "BUY";
  } else if (random < 0.7) {
    side = "SELL";
  } else {
    side = "HOLD";
  }
  const confidence = Math.floor(55 + Math.random() * 45);
  const timestamp = Date.now();

  if (prisma) {
    const signal = await prisma.signal.create({
      data: {
        asset,
        side,
        confidence,
        price,
        timestamp: BigInt(timestamp),
      },
    });

    const result: TradeSignal = {
      id: signal.id,
      asset: signal.asset as Asset,
      side: signal.side,
      confidence: signal.confidence,
      price: signal.price,
      timestamp: Number(signal.timestamp),
    };

    broadcast({
      type: "signal",
      data: result,
    });

    return result;
  }

  const result: TradeSignal = {
    id: nextSignalId++,
    asset,
    side,
    confidence,
    price,
    timestamp,
  };

  signals.unshift(result);
  if (signals.length > maxStoredSignals) {
    signals.pop();
  }

  broadcast({
    type: "signal",
    data: result,
  });

  return result;
}

export async function getAllTradeSignals(): Promise<TradeSignal[]> {
  if (prisma) {
    const storedSignals = await prisma.signal.findMany({
      orderBy: { timestamp: "desc" },
    });

    return storedSignals.map((signal) => ({
      id: signal.id,
      asset: signal.asset as Asset,
      side: signal.side,
      confidence: signal.confidence,
      price: signal.price,
      timestamp: Number(signal.timestamp),
    }));
  }

  return [...signals];
}
