import { useState, useCallback, useRef, useEffect } from 'react';

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  // To keep track of ongoing HTTP requests
  const activeHttpRequests = useRef([]);

  const sendRequest = useCallback(
    async (url, method = 'GET', body = null, headers = {}) => {
      setIsLoading(true);
      const httpAbortCtrl = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrl);

      try {
        console.log(url,body,headers,method)
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrl.signal
        });

        const responseData = await response.json();

        // Remove finished request controller
        activeHttpRequests.current = activeHttpRequests.current.filter(
          reqCtrl => reqCtrl !== httpAbortCtrl
        );

        if (!response.ok) {
          throw new Error(responseData.message || 'Request failed!');
        }

        setIsLoading(false);
        return responseData;
      } catch (err) {
        // ✅ Ignore AbortError silently
        if (err.name === 'AbortError') {
         // console.log('[INFO] Request aborted.');
          setIsLoading(false);
          return;
        }

        setError(err.message || 'Something went wrong!');
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  // ✅ Clear error state manually
  const clearError = () => {
    setError(null);
  };

  // ✅ Cancel all active requests on component unmount
  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach(abortCtrl => abortCtrl.abort());
    };
  }, []);

  return {
    isLoading,
    error,
    sendRequest,
    clearError
  };
};
