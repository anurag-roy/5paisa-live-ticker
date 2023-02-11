import config from '@/config';
import env from '@/env.json';
import { pick } from '@/utils/ui';
import { instrument, PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

type Data = {
  data?: any;
  error?: {
    message: string;
    body?: any;
  };
};

const getLTP = async (i: instrument): Promise<number> => {
  const marketUrl = `${env.BASE_URL}/MarketFeed`;

  const request = [
    {
      Exch: i.exchange,
      ExchType: i.exchangeType,
      Symbol: i.name,
      Expiry: new Date(Number(i.expiry))
        .toISOString()
        .slice(0, 10)
        .replaceAll('-', ''),
      StrikePrice: i.strikeRate,
      OptionType: i.cpType,
    },
  ];

  const marketPayLoad = {
    head: {
      appName: env.APP_NAME,
      appVer: '1.0.0',
      key: env.APP_USER_KEY,
      osName: 'WEB',
      requestCode: '5PMF',
      userId: env.APP_USER_ID,
      password: env.APP_PASSWORD,
    },
    body: {
      Count: 1,
      MarketFeedData: request,
      ClientLoginType: 0,
      LastRequestTime: `/Date(${0})/`,
      RefreshRate: 'H',
    },
  };

  const res = await fetch(marketUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(marketPayLoad),
  });

  if (res.ok) {
    const response = await res.json();
    return response.body.Data[0].LastRate;
  } else {
    throw new Error('Error while getting LTP', { cause: await res.text() });
  }
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { root, expiry } = req.query as { root: string; expiry: string };
  const expiryExcludingDate = expiry.split(' ').slice(1).join(' ');
  const prisma = new PrismaClient();
  const instruments = await prisma.instrument.findMany({
    where: {
      exchange: config.exchange, // 'N' for NSE, 'M' for MCX
      exchangeType: 'D', // Derivative
      root: root,
      underlyer: {
        endsWith: expiryExcludingDate,
      },
    },
  });

  const masterInstrument = instruments.find(
    (i) => i.strikeRate === 0 && i.cpType === 'XX'
  );
  if (masterInstrument) {
    try {
      const ltp = await getLTP(masterInstrument);
      const trimmedInstruments = instruments
        .filter((i) => i.strikeRate)
        .map((i) =>
          pick(i, [
            'fullName',
            'name',
            'root',
            'underlyer',
            'exchange',
            'exchangeType',
            'scripcode',
            'strikeRate',
            'cpType',
          ])
        )
        .sort((i1, i2) => i1.strikeRate! - i2.strikeRate!);

      res.json({
        data: {
          ltp,
          instruments: trimmedInstruments,
        },
      });
    } catch (error) {
      res
        .status(500)
        .json({ error: { message: 'Failed to fetch LTP', body: error } });
    }
  } else {
    res.status(404).json({ error: { message: 'Master instrument not found' } });
  }
}
