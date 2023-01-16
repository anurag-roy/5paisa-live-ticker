import { downloadCsv } from './downloadCsv';
import { setupDb } from './setupDb';

async function main() {
  try {
    await downloadCsv();
  } catch (error) {
    console.error('Download CSV failed : ', error);
    process.exit(1);
  }
  try {
    await setupDb();
  } catch (error) {
    console.error('Db Setup failed : ', error);
    process.exit(1);
  }
}

main();
