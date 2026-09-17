import { FastifyInstance } from "fastify";
import { z } from "zod";
import { generateTradeSignal, getAllTradeSignals } from "../services/signalSerivice";

const assetSchema = z.enum(["BTC/USD", "ETH/USD", "SOL/USD"]);

export async function signalRoutes(app: FastifyInstance): Promise<void> {
  app.post("/signals/generate", async (request, reply) => {
    const body = z
      .object({
        asset: assetSchema.optional(),
      })
      .parse(request.body);

    const signal = await generateTradeSignal(body.asset);
    return reply.send(signal);
  });

  app.get("/signals", async () => {
    
    const signals = await getAllTradeSignals();

    return signals.map((signal) => ({
        id: signal.id,
        asset: signal.asset,
        side: signal.side,
        price: signal.price,
        confidence: signal.confidence,
        timestamp: signal.timestamp
    }));
  });
}

