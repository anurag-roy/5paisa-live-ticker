import { instrument } from '@prisma/client';

type TableProps = {
  instruments: instrument[];
};

export default function Table({ instruments }: TableProps) {
  return (
    <div className="mx-8 my-12 overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr className="divide-x divide-gray-200">
            <th scope="col">Bid</th>
            <th scope="col">Ask</th>
            <th scope="col">Name</th>
            <th scope="col">Bid</th>
            <th scope="col">Ask</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {instruments.length === 0 ? (
            <tr>
              <td></td>
              <td></td>
              <td>No data to display</td>
              <td></td>
              <td></td>
            </tr>
          ) : (
            instruments.map((i) => (
              <tr key={i.scripcode} className="divide-x divide-gray-200">
                <td>
                  {i.cpType === 'CE' ? '-' : (Math.random() * 100).toFixed(2)}
                </td>
                <td>
                  {i.cpType === 'CE' ? '-' : (Math.random() * 100).toFixed(2)}
                </td>
                <td className="-px-4 font-normal text-gray-500">
                  {i.fullName}
                </td>
                <td>
                  {i.cpType === 'PE' ? '-' : (Math.random() * 100).toFixed(2)}
                </td>
                <td>
                  {i.cpType === 'PE' ? '-' : (Math.random() * 100).toFixed(2)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
