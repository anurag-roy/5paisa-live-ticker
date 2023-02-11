import env from '@/env.json';
import { readFileSync, writeFileSync } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

const token = readFileSync('./app-data/token.txt', 'utf-8');

type Data = {
  data: any;
};

const url = 'https://openfeed.5paisa.com/Feeds/api/UserActivity/LoginCheck';
const payload = {
  head: {
    requestCode: '5PLoginCheck',
    key: env.APP_USER_KEY,
    appVer: '1.0.0',
    appName: env.APP_NAME,
    osName: 'WEB',
    LoginId: env.CLIENT_ID,
  },
  body: {
    RegistrationID: token,
  },
};

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const loginCheckResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
    });

    if (loginCheckResponse.ok) {
      const cookie = loginCheckResponse.headers.get('Set-Cookie');
      console.log('Login Check response : ', await loginCheckResponse.json());
      if (cookie) {
        writeFileSync('./app-data/cookie.txt', cookie, 'utf-8');
        res.status(200).json({ data: cookie });
      }
    } else {
      console.error('Some error occured : ', res);
      res.status(500).json({
        data: { message: 'Login check failed', body: loginCheckResponse },
      });
    }
  } catch (error) {
    console.error('Some error occured : ', error);
    res
      .status(500)
      .json({ data: { message: 'Login check failed', body: error } });
  }
}
