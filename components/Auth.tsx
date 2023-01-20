import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

function SpinnerSvg() {
  return (
    <svg
      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
}

export function Auth() {
  const [authState, setAuthState] = useState<
    'authorized' | 'authorizing' | 'not-authorized'
  >('not-authorized');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const { exp } = JSON.parse(atob(token.split('.')[1]));
      if (Date.now() < exp * 1000) {
        setAuthState('authorized');
      }
    }
  }, []);

  const runLoginFlow = async () => {
    setAuthState('authorizing');
    try {
      const tokenResponse = await fetch('/api/getToken');
      const { data } = await tokenResponse.json();
      localStorage.setItem('token', data);
    } catch (error) {
      console.error('Some error occured while logging in : ', error);
      alert('Some error occured while logging in. Please check console.');
      setAuthState('not-authorized');
      return;
    }

    try {
      const cookieResponse = await fetch('/api/getCookie');
      const { data } = await cookieResponse.json();
      document.cookie = data;
    } catch (error) {
      console.error('Some error occured while checking login : ', error);
      alert('Some error occured while checking login. Please check console.');
      setAuthState('not-authorized');
      return;
    }

    setAuthState('authorized');
  };

  if (authState === 'authorized') {
    return (
      <span className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-green-700 bg-green-100">
        <CheckCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
        You're logged in!
      </span>
    );
  } else {
    return (
      <button
        type="button"
        onClick={runLoginFlow}
        disabled={authState === 'authorizing'}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        {authState === 'authorizing' ? (
          <>
            <SpinnerSvg />
            Logging in...
          </>
        ) : (
          <>
            <XCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Click here to login
          </>
        )}
      </button>
    );
  }
}
