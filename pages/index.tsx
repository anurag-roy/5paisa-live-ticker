import { Header } from '@/components/Header';
import { SubscriptionForm } from '@/components/SubscriptionForm';
import { stockNames } from '@/stockNames';
import { Prisma, PrismaClient } from '@prisma/client';
import { GetServerSidePropsContext } from 'next';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const prisma = new PrismaClient();

  const result: (Prisma.PickArray<
    Prisma.InstrumentGroupByOutputType,
    ('underlyer' | 'root')[]
  > & {})[] = await prisma.$queryRaw`
  SELECT
    i.root,
    i.underlyer
  from
    instrument i
  where
    i.root in (${Prisma.join(stockNames)})
    and i.exchange = 'N'
    and i.exchangeType = 'D'
  group by
    i.root,
    i.underlyer
  order by
    i.root,
    i.expiry;
  `;

  let data = result.reduce<Record<string, string[]>>((acc, row) => {
    const { root, underlyer } = row;
    if (root && underlyer) {
      if (!Array.isArray(acc[root])) {
        acc[root] = [];
      }
      acc[root].push(underlyer);
    }
    return acc;
  }, {});

  return {
    props: {
      data,
    },
  };
}

type HomeParams = {
  data: Record<string, string[]>;
};

export default function Home({ data }: HomeParams) {
  return (
    <>
      <Header />
      <main className="mt-8 rounded-lg py-6 px-4 bg-gray-100">
        <SubscriptionForm rootToExpiryMap={data} />
      </main>
    </>
  );
}
