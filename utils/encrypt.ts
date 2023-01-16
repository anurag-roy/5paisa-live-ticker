import { createCipheriv, pbkdf2Sync } from 'node:crypto';

const iv = Buffer.from([
  83, 71, 26, 58, 54, 35, 22, 11, 83, 71, 26, 58, 54, 35, 22, 11,
]);

export const encrypt = (key: string, text: string) => {
  const keyLen = 256;
  const IVLen = 128;

  try {
    const keyGen = pbkdf2Sync(
      Buffer.from(key),
      Uint8Array.from(iv),
      1000,
      keyLen + IVLen,
      'sha1'
    );

    const aesKey = Buffer.allocUnsafe(32);
    const aesIV = Buffer.allocUnsafe(16);

    // you need to limit the buffer copy to 16 for aesIV.
    keyGen.copy(aesIV, 0, 0, 16);
    keyGen.copy(aesKey, 0, 16);
    const cipher = createCipheriv('aes-256-cbc', aesKey, aesIV);

    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    return encrypted;
  } catch (error) {
    console.log(error, 'error in encrypt');
  }
};
