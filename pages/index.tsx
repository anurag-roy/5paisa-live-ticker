import { Auth } from '@/components/Auth';
import { SubscriptionForm } from '@/components/SubscriptionForm';
import { stockNames } from '@/stockNames';
import { PrismaClient } from '@prisma/client';
import { GetServerSidePropsContext } from 'next';

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const prisma = new PrismaClient();
  const result = await prisma.instrument.groupBy({
    by: ['root', 'underlyer'],
    where: {
      root: {
        in: stockNames,
      },
      exchangeType: 'D',
    },
  });

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
      <header className="flex items-center justify-between">
        <span className="p-1 rounded-md bg-blue-100 text-blue-600">
          <svg className="w-7 h-7" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M21 8c-1.5 0-2.3 1.4-1.9 2.5l-3.6 3.6c-.3-.1-.7-.1-1 0l-2.6-2.6c.4-1.1-.4-2.5-1.9-2.5c-1.4 0-2.3 1.4-1.9 2.5L3.5 16c-1.1-.3-2.5.5-2.5 2c0 1.1.9 2 2 2c1.4 0 2.3-1.4 1.9-2.5l4.5-4.6c.3.1.7.1 1 0l2.6 2.6c-.3 1 .5 2.5 2 2.5s2.3-1.4 1.9-2.5l3.6-3.6c1.1.3 2.5-.5 2.5-1.9c0-1.1-.9-2-2-2m-6 1l.9-2.1L18 6l-2.1-.9L15 3l-.9 2.1L12 6l2.1.9L15 9M3.5 11L4 9l2-.5L4 8l-.5-2L3 8l-2 .5L3 9l.5 2Z"
            />
          </svg>
        </span>
        <Auth />
      </header>
      <main className="mt-8 rounded-lg py-6 px-4 bg-gray-100">
        <SubscriptionForm rootToExpiryMap={data} />
      </main>
    </>
  );
}
