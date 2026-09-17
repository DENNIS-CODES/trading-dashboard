export type Asset = 'BTC/USD' | 'ETH/USD' | 'SOL/USD'

export type SignalSide = 'BUY' | 'SELL' | 'HOLD'

export interface MarketTick {
    asset: Asset
    price: number
    timestamp: number;
}

export interface TradeSignal {
    id: number
    asset: Asset
    side: SignalSide
    confidence: number
    price: number
    timestamp: number
}

export interface WebSocketEvent {
    type: "market" | "signal"
    data: MarketTick | TradeSignal
}

export const assets: Asset[] = ["BTC/USD", "ETH/USD", "SOL/USD"];