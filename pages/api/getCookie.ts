import config from '@/config.json';
import { readFileSync, writeFileSync } from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';

const token = readFileSync('./cache/token.txt', 'utf-8');

type Data = {
  data: any;
};

const url = 'https://openfeed.5paisa.com/Feeds/api/UserActivity/LoginCheck';
const payload = {
  head: {
    requestCode: '5PLoginCheck',
    key: config.APP_USER_KEY,
    appVer: '1.0.0',
    appName: config.APP_NAME,
    osName: 'WEB',
    LoginId: config.CLIENT_ID,
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
        writeFileSync('./cache/cookie.txt', cookie, 'utf-8');
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