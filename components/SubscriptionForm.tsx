import { stockNames } from '@/stockNames';
import { instrument } from '@prisma/client';
import { FormEvent, useEffect, useState } from 'react';
import { ComboBoxInput } from './ComboBoxInput';
import Table from './Table';

type SubscriptionFormParams = {
  rootToExpiryMap: Record<string, string[]>;
};

export function SubscriptionForm({ rootToExpiryMap }: SubscriptionFormParams) {
  const [selectedStock, setSelectedStock] = useState(stockNames[0]);
  const [expiryOptions, setExpiryOptions] = useState<string[]>(
    rootToExpiryMap[stockNames[0]]
  );

  const [instruments, setInstruments] = useState<instrument[]>([]);

  useEffect(() => {
    if (selectedStock) {
      setExpiryOptions(rootToExpiryMap[selectedStock]);
    }
  }, [selectedStock]);

  const getScripCodes = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    for (let [name, value] of Array.from(formData.entries())) {
      if (value === '') formData.delete(name);
    }
    const searchParams = new URLSearchParams(formData as any).toString();

    const res = await fetch('/api/getScripCodes?' + searchParams);
    const { data } = (await res.json()) as {
      data: { ltp: number; instruments: instrument[] };
    };
    console.log('Data is : ', data);
    const lowerBound = 0.9 * data.ltp;
    const upperBound = 1.1 * data.ltp;
    const filteredInstruments = data.instruments.filter(
      (i) =>
        i.strikeRate &&
        ((i.strikeRate > upperBound && i.cpType === 'CE') ||
          (i.strikeRate < lowerBound && i.cpType === 'PE'))
    );
    setInstruments(filteredInstruments);
    console.log('Filterd instrumenst are :', filteredInstruments);
  };

  return (
    <>
      <form
        className="flex items-end justify-between px-4 sm:px-6 lg:px-8"
        onSubmit={getScripCodes}
      >
        <ComboBoxInput
          name="root"
          items={stockNames}
          selectedItem={selectedStock}
          setSelectedItem={setSelectedStock}
        />
        <ComboBoxInput name="expiry" items={expiryOptions} />
        <button
          type="submit"
          className="px-4 py-2 text-base font-medium rounded-full text-white animated-button focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Get Scrip Codes
        </button>
      </form>
      <Table instruments={instruments} />
    </>
  );
}
