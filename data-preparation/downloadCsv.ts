import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';

export const downloadCsv = async () => {
  const writeStream = createWriteStream('./app-data/data.csv', {
    encoding: 'utf-8',
  });
  // Use body since it is a readable stream
  console.log('Starting CSV File download...');
  const { body } = await fetch(
    'https://images.5paisa.com/website/scripmaster-csv-format.csv'
  );
  if (body) {
    //   Pipe body to the writestream
    await finished(Readable.fromWeb(body as any).pipe(writeStream));
    console.log('CSV file download successful!');
  } else {
    throw new Error('CSV File empty!');
  }
};
