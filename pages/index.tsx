import { Header } from '@/components/Header';
import { SubscriptionForm } from '@/components/SubscriptionForm';
import config from '@/config';
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
    i.root in (${Prisma.join(config.stockNames)})
    and i.exchange = ${config.exchange}
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

type HomeProps = {
  data: Record<string, string[]>;
};

export default function Home({ data }: HomeProps) {
  return (
    <>
      <Header />
      <main className="mt-6 rounded-lg py-6 bg-gray-100 grow overflow-y-auto flex flex-col">
        <SubscriptionForm rootToExpiryMap={data} />
      </main>
    </>
  );
}
