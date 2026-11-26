import { useCallback, useState } from 'react';

export function usePagination(initialLimit = 20) {
  const [page, setPage] = useState(1);
  const [limit, setLimitState] = useState(initialLimit);

  const setLimit = useCallback((nextLimit: number) => {
    setLimitState(nextLimit);
    setPage(1);
  }, []);

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  return { page, limit, setPage, setLimit, resetPage };
}
