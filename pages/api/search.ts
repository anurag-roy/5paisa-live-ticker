import { instrument, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  data: instrument[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { root, expiry } = req.query as { root: string; expiry: string };
  const prisma = new PrismaClient();
  const instruments = await prisma.instrument.findMany({
    where: {
      exchange: 'N', // NSE
      exchangeType: 'D', // Derivative
      root: root,
      underlyer: expiry,
    },
    // TODO: Remove LIMIT later
    take: 10,
  });
  res.status(200).json({ data: instruments });
}
