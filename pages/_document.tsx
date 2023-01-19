import { Head, Html, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="p-4 bg-gray-50 max-w-5xl mx-auto">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
