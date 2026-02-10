import { QueryClient } from '@tanstack/react-query';

export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			refetchOnWindowFocus: false,
			retry: 1,
			retryDelay: 1000,
			staleTime: 5 * 60 * 1000,
			gcTime: 10 * 60 * 1000,
		},
	},
});
