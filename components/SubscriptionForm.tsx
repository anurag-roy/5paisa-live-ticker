import { stockNames } from '@/stockNames';
import { FormEvent, useEffect, useState } from 'react';
import { ComboBoxInput } from './ComboBoxInput';

type SubscriptionFormParams = {
  rootToExpiryMap: Record<string, string[]>;
};

export function SubscriptionForm({ rootToExpiryMap }: SubscriptionFormParams) {
  const [selectedStock, setSelectedStock] = useState(stockNames[0]);
  const [expiryOptions, setExpiryOptions] = useState<string[]>(
    rootToExpiryMap[stockNames[0]]
  );

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
    const scripCodes = await res.json();
    console.log('Scripcodes are : ', scripCodes);
  };

  return (
    <form className="flex items-end justify-between" onSubmit={getScripCodes}>
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
  );
}
