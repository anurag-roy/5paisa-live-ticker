import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ data: string[] }>
) {
  const { root } = req.query as { root: string };
  const prisma = new PrismaClient();
  const expirationRows = await prisma.$queryRaw<
    { underlyer: string }[]
  >`SELECT DISTINCT i.underlyer from instrument i where i.root = ${root};`;
  res
    .setHeader('Cache-Control', 's-maxage=86400')
    .status(200)
    .json({
      data: expirationRows.filter((e) => e.underlyer).map((e) => e.underlyer),
    });
}
