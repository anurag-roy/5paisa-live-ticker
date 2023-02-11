import config from '@/config';
import env from '@/env.json';
import { useInstrumentStore } from '@/store/instrumentStore';
import { instrument } from '@prisma/client';
import { FormEvent, useEffect, useState } from 'react';
import { ComboBoxInput } from './ComboBoxInput';
import { Table } from './Table';

type TickData = {
  Exch: string;
  ExchType: string;
  Token: number;
  TBidQ: number;
  TOffQ: number;
  Details: {
    Quantity: number;
    Price: number;
    NumberOfOrders: number;
    BbBuySellFlag: 66 | 83;
  }[];
  TimeStamp: number;
  Time: string;
};

export interface UiInstrument extends instrument {
  bid?: number;
  ask?: number;
}

const subscriptionItemMapper = (i: UiInstrument) => {
  return {
    Exch: i.exchange!,
    ExchType: i.exchangeType!,
    ScripCode: i.scripcode!,
  };
};

type SubscriptionItem = ReturnType<typeof subscriptionItemMapper>;

type SubscriptionFormProps = {
  rootToExpiryMap: Record<string, string[]>;
};

export function SubscriptionForm({ rootToExpiryMap }: SubscriptionFormProps) {
  const [selectedStock, setSelectedStock] = useState(config.stockNames[0]);
  const [expiryOptions, setExpiryOptions] = useState<string[]>(
    rootToExpiryMap[config.stockNames[0]]
  );
  const [subscribedStocks, setSubscribedStocks] = useState<SubscriptionItem[]>(
    []
  );
  const setStore = useInstrumentStore((state) => state.setStore);
  const updateInstrument = useInstrumentStore(
    (state) => state.updateInstrument
  );

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const wssUrl = `wss://openfeed.5paisa.com/Feeds/api/chat?Value1=${token}|${env.CLIENT_ID}`;
    const ws = new WebSocket(wssUrl);

    ws.onopen = (_event) => {
      console.log('Connected successfully to 5paisa Live Market!');
    };

    setSocket(ws);
  }, []);

  useEffect(() => {
    if (selectedStock) {
      setExpiryOptions(rootToExpiryMap[selectedStock]);
    }
  }, [selectedStock]);

  const subscribeToLiveFeed = (subscriptionList: SubscriptionItem[]) => {
    console.log(`Subscribing to ${subscriptionList.length} items`);
    const data = {
      Method: 'MarketDepthService',
      Operation: 'Subscribe',
      ClientCode: env.CLIENT_ID,
      MarketFeedData: subscriptionList,
    };
    socket!.send(JSON.stringify(data));

    socket!.onmessage = (eventData) => {
      const tickData = JSON.parse(eventData.data) as TickData;
      updateInstrument(
        tickData.Token,
        tickData.Details[0].Price,
        tickData.Details[5].Price
      );
    };

    setSubscribedStocks(subscriptionList);
    setIsSubscribed(true);
  };

  const unsubscribeFromLiveFeed = (subscriptionList: SubscriptionItem[]) => {
    console.log(`Unsubscribing from ${subscriptionList.length} items`);
    const data = {
      Method: 'MarketDepthService',
      Operation: 'Unsubscribe',
      ClientCode: env.CLIENT_ID,
      MarketFeedData: subscriptionList,
    };
    socket!.send(JSON.stringify(data));
    socket!.onmessage = () => {};

    setStore([]);
    setSubscribedStocks([]);
    setIsSubscribed(false);
  };

  const getScripCodes = async (searchParams: string) => {
    const res = await fetch('/api/getScripCodes?' + searchParams);
    const { data } = (await res.json()) as {
      data: { ltp: number; instruments: instrument[] };
    };
    const lowerBound = 0.9 * data.ltp;
    const upperBound = 1.1 * data.ltp;
    const filteredInstruments = data.instruments.filter(
      (i) =>
        i.strikeRate &&
        ((i.strikeRate > upperBound && i.cpType === 'CE') ||
          (i.strikeRate < lowerBound && i.cpType === 'PE'))
    );
    return filteredInstruments;
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubscribed) {
      unsubscribeFromLiveFeed(subscribedStocks);
    } else {
      const formData = new FormData(event.currentTarget);
      for (let [name, value] of Array.from(formData.entries())) {
        if (value === '') formData.delete(name);
      }
      const searchParams = new URLSearchParams(formData as any).toString();

      const filteredInstruments = await getScripCodes(searchParams);
      setStore(filteredInstruments);
      subscribeToLiveFeed(filteredInstruments.map(subscriptionItemMapper));
    }
  };

  return (
    <>
      <form
        className="flex items-end justify-between px-4 sm:px-6 lg:px-8"
        onSubmit={handleFormSubmit}
      >
        <ComboBoxInput
          name="root"
          items={config.stockNames}
          selectedItem={selectedStock}
          setSelectedItem={setSelectedStock}
        />
        <ComboBoxInput name="expiry" items={expiryOptions} />
        <button
          type="submit"
          className="px-4 py-2 text-base font-medium rounded-full text-white animated-button focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
        </button>
      </form>
      <Table />
    </>
  );
}
