import Database from 'better-sqlite3';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { columns } from './columns';

export const setupDb = async () => {
  const TABLE_NAME = 'master';
  const INSERT_BATCH_SIZE = 10000;
  const dbColumnsJoined = columns.map((c) => c.dbColumnName).join(',');

  // Create DB and table
  const db = new Database('./app-data/data.db');
  console.log('DB creation successful!');

  db.prepare(
    `CREATE TABLE ${TABLE_NAME} (` +
      columns.map((c) => `${c.dbColumnName} ${c.type}`).join(',') +
      ');'
  ).run();
  console.log('Table creation successful!');

  const insert = (values: string[]) => {
    db.exec(
      `INSERT INTO ${TABLE_NAME} (${dbColumnsJoined}) VALUES ${values.join(
        ','
      )};`
    );
  };

  const fileStream = createReadStream('./app-data/data.csv');
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  // First line will be the header
  const headerRow: string = (await rl[Symbol.asyncIterator]().next()).value;
  const csvColumns = headerRow.split(',');

  // Fill index at which the colun is present in the CSV
  for (const col of columns) {
    const index = csvColumns.findIndex((c) => c === col.csvHeaderName);
    if (index === -1) {
      console.error('[Error] Column not present in CSV. Aborting...');
      process.exit(1);
    }
    col.csvIndex = index;
  }

  // Variables to insert values in batches
  let currentBatchValues = [];
  let currentIteration = 0;

  // Parse each line and prepare insert statement
  console.log('Starting insert...');
  for await (const line of rl) {
    const csvRowValues = line.split(',');
    const currentRowValues = [];

    // Loop over our columns variable, so that
    // each column matches with its corresponding value.
    for (const col of columns) {
      const index = col.csvIndex!;
      let value: any = csvRowValues[index];
      if (col.transformer) {
        value = col.transformer(value);
      }

      // Handling for each data type
      switch (col.type) {
        case 'INTEGER':
          value = Number(value);
          break;
        case 'REAL':
          value = Number(value);
          break;
        case 'TEXT':
          value = `'${value}'`;
        default:
          break;
      }
      currentRowValues.push(value);
    }
    currentBatchValues.push(`(${currentRowValues.join(',')})`);

    // Execute insert statement once a batch is full
    currentIteration++;
    if (currentIteration % INSERT_BATCH_SIZE === 0) {
      insert(currentBatchValues);
      currentBatchValues = [];
    }
  }
  // Fire once more for leftover values
  insert(currentBatchValues);
  console.log('Data insertion successful!');
};
