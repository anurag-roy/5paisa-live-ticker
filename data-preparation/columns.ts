type Column = {
  csvHeaderName: string;
  csvIndex?: number;
  dbColumnName: string;
  /**
   * https://www.sqlite.org/datatype3.html
   */
  type: 'NULL' | 'INTEGER' | 'REAL' | 'TEXT' | 'BLOB';
  transformer?: (value: string) => any;
};

export const columns: Column[] = [
  {
    csvHeaderName: 'Exch',
    dbColumnName: 'exchange',
    type: 'TEXT',
  },
  {
    csvHeaderName: 'ExchType',
    dbColumnName: 'exchangeType',
    type: 'TEXT',
  },
  {
    csvHeaderName: 'Scripcode',
    dbColumnName: 'scripcode',
    type: 'INTEGER',
  },
  {
    csvHeaderName: 'Name',
    dbColumnName: 'name',
    type: 'TEXT',
  },
  {
    csvHeaderName: 'Series',
    dbColumnName: 'series',
    type: 'TEXT',
  },
  {
    csvHeaderName: 'Expiry',
    dbColumnName: 'expiry',
    type: 'TEXT',
    transformer: (value: string) => new Date(value).getTime(),
  },
  {
    csvHeaderName: 'CpType',
    dbColumnName: 'cpType',
    type: 'TEXT',
  },
  {
    csvHeaderName: 'StrikeRate',
    dbColumnName: 'strikeRate',
    type: 'REAL',
  },
  {
    csvHeaderName: 'ISIN',
    dbColumnName: 'isin',
    type: 'TEXT',
  },
  {
    csvHeaderName: 'FullName',
    dbColumnName: 'fullName',
    type: 'TEXT',
  },
  {
    csvHeaderName: 'LotSize',
    dbColumnName: 'lotSize',
    type: 'REAL',
  },
  {
    csvHeaderName: 'AllowedToTrade',
    dbColumnName: 'allowedToTrade',
    type: 'INTEGER',
    transformer: (value: string) => (value === 'Y' ? 1 : 0),
  },
  {
    csvHeaderName: 'QtyLimit',
    dbColumnName: 'quantityLimit',
    type: 'REAL',
  },
  {
    csvHeaderName: 'Multiplier',
    dbColumnName: 'multiplier',
    type: 'REAL',
  },
  {
    csvHeaderName: 'Underlyer',
    dbColumnName: 'underlyer',
    type: 'TEXT',
  },
  {
    csvHeaderName: 'Root',
    dbColumnName: 'root',
    type: 'TEXT',
  },
];
