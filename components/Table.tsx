import { useInstrumentStore } from '@/store/instrumentStore';
import { memo } from 'react';

type TableRowProps = {
  name: string | null;
  cpType: string | null;
  bid?: number;
  ask?: number;
};

const TableRow = memo(({ name, cpType, bid, ask }: TableRowProps) => {
  return (
    <tr className="divide-x divide-gray-200">
      <td>{cpType === 'PE' ? '-' : bid}</td>
      <td>{cpType === 'PE' ? '-' : ask}</td>
      <td className="-px-4 font-normal text-gray-500">{name}</td>
      <td>{cpType === 'CE' ? '-' : bid}</td>
      <td>{cpType === 'CE' ? '-' : ask}</td>
    </tr>
  );
});

export const Table = memo(() => {
  const instruments = useInstrumentStore((state) => state.instruments);
  return (
    <div className="mx-8 mt-8 mb-4 overflow-y-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg grow">
      <table className="min-w-full h-full divide-y divide-gray-300">
        <thead className="bg-gray-50 sticky top-0">
          <tr className="divide-x divide-gray-200">
            <th scope="col">Bid</th>
            <th scope="col">Ask</th>
            <th scope="col">Name</th>
            <th scope="col">Bid</th>
            <th scope="col">Ask</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white overflow-y-auto">
          {instruments?.length === 0 ? (
            <tr>
              <td></td>
              <td></td>
              <td className="text-lg">No data to display.</td>
              <td></td>
              <td></td>
            </tr>
          ) : (
            instruments?.map((i) => (
              <TableRow
                key={i.scripcode}
                name={i.name}
                cpType={i.cpType}
                ask={i.ask}
                bid={i.bid}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
});
