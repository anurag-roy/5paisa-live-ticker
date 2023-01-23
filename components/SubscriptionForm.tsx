import config from '@/config.json';
import { stockNames } from '@/stockNames';
import { instrument } from '@prisma/client';
import { FormEvent, useEffect, useReducer, useState } from 'react';
import { ComboBoxInput } from './ComboBoxInput';
import Table from './Table';

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

type UpdateAction = {
  type: 'update';
  payload: {
    token: number;
    bid: number;
    ask: number;
  };
};

type AddAction = {
  type: 'add';
  payload: UiInstrument[];
};

const reducer = (state: UiInstrument[], action: AddAction | UpdateAction) => {
  const { type, payload } = action;
  switch (type) {
    case 'add':
      return payload;
    case 'update':
      const foundInstrument = state.find((i) => payload.token === i.scripcode);
      if (foundInstrument) {
        foundInstrument.bid = payload.bid;
        foundInstrument.ask = payload.ask;
      }
      return [...state];
    default:
      return state;
  }
};

type SubscriptionFormParams = {
  rootToExpiryMap: Record<string, string[]>;
};

export function SubscriptionForm({ rootToExpiryMap }: SubscriptionFormParams) {
  const [selectedStock, setSelectedStock] = useState(stockNames[0]);
  const [expiryOptions, setExpiryOptions] = useState<string[]>(
    rootToExpiryMap[stockNames[0]]
  );

  const [instrumentState, dispatch] = useReducer(reducer, []);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const wssUrl = `wss://openfeed.5paisa.com/Feeds/api/chat?Value1=${token}|${config.CLIENT_ID}`;
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

  const subscribeToLiveFeed = (
    subscriptionList: { Exch: string; ExchType: string; ScripCode: number }[]
  ) => {
    console.log(`Subscribing to ${subscriptionList.length} items`);
    const data = {
      Method: 'MarketDepthService',
      Operation: 'Subscribe',
      ClientCode: config.CLIENT_ID,
      MarketFeedData: subscriptionList,
    };
    socket!.send(JSON.stringify(data));

    socket!.onmessage = (eventData) => {
      const tickData = JSON.parse(eventData.data) as TickData;
      dispatch({
        type: 'update',
        payload: {
          token: tickData.Token,
          bid: tickData.Details[0].Price,
          ask: tickData.Details[5].Price,
        },
      });
    };

    setIsSubscribed(true);
  };

  const unsubscribeFromLiveFeed = (
    subscriptionList: { Exch: string; ExchType: string; ScripCode: number }[]
  ) => {
    console.log(`Unsubscribing from ${subscriptionList.length} items`);
    const data = {
      Method: 'MarketDepthService',
      Operation: 'Unsubscribe',
      ClientCode: config.CLIENT_ID,
      MarketFeedData: subscriptionList,
    };
    socket!.send(JSON.stringify(data));
    socket!.onmessage = () => {};

    dispatch({
      type: 'add',
      payload: [],
    });
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
      unsubscribeFromLiveFeed(instrumentState.map(subscriptionItemMapper));
    } else {
      const formData = new FormData(event.currentTarget);
      for (let [name, value] of Array.from(formData.entries())) {
        if (value === '') formData.delete(name);
      }
      const searchParams = new URLSearchParams(formData as any).toString();

      const filteredInstruments = await getScripCodes(searchParams);
      dispatch({
        type: 'add',
        payload: filteredInstruments,
      });
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
          items={stockNames}
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
      <Table instruments={instrumentState} />
    </>
  );
}
