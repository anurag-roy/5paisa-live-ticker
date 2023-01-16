// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import config from '@/config.json';
import { encrypt } from '@/utils/encrypt';
import type { NextApiRequest, NextApiResponse } from 'next';
import { writeFileSync } from 'node:fs';

type Data = {
  data: any;
};

const url = `${config.BASE_URL}/V4/LoginRequestMobileNewbyEmail`;
const payload = {
  head: {
    appName: config.APP_NAME,
    appVer: '1.0.0',
    key: config.APP_USER_KEY,
    osName: 'WEB',
    requestCode: '5PLoginV4',
    userId: config.APP_USER_ID,
    password: config.APP_PASSWORD,
  },
  body: {
    Email_id: encrypt(config.APP_ENCRYPTION_KEY, config.CLIENT_EMAIL),
    Password: encrypt(config.APP_ENCRYPTION_KEY, config.CLIENT_PASSWORD),
    LocalIP: '192.168.1.1',
    PublicIP: '192.168.1.1',
    HDSerailNumber: '',
    MACAddress: '',
    MachineID: '039377',
    VersionNo: '1.7',
    RequestNo: '1',
    My2PIN: encrypt(config.APP_ENCRYPTION_KEY, config.CLIENT_DOB),
    ConnectionType: '1',
  },
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const loginResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (loginResponse.ok) {
      const response = await loginResponse.json();
      console.log('Login response : ', response);
      if (response?.body?.JWTToken) {
        writeFileSync('./cache/token.txt', response.body.JWTToken, 'utf-8');
        res.status(200).json({ data: response.body.JWTToken });
      }
    } else {
      console.error('Some error occured : ', res);
      res
        .status(500)
        .json({ data: { message: 'Login failed', body: loginResponse } });
    }
  } catch (error) {
    console.error('Some error occured : ', error);
    res.status(500).json({ data: { message: 'Login failed', body: error } });
  }
}
