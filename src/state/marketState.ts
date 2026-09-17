import { Asset, MarketTick } from "../types";

const initialPrices: Record<Asset, number> = {
  "BTC/USD": 105000,
  "ETH/USD": 3000,
  "SOL/USD": 220,
};

const prices = new Map<Asset, number>(
  Object.entries(initialPrices) as [Asset, number][],
);

export function getPrice(asset: Asset): number {
  return prices.get(asset) ?? 0;
}

export function updatePrice(asset: Asset): MarketTick {
  const current = getPrice(asset);
  const volatility = current * 0.0015;
  const movement = (Math.random() - 0.5) * volatility;
  const newPrice = current + movement;
  prices.set(asset, newPrice);
  return {
    asset,
    price: newPrice,
    timestamp: Date.now(),
  };
}

export function getMarketSnapShot(): MarketTick[] {
  return Array.from(prices.keys()).map((asset) => ({
    asset,
    price: getPrice(asset),
    timestamp: Date.now(),
  }));
}
