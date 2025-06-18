import { QueryClient } from "@tanstack/react-query";

let queryClient: QueryClient | null = null;

export const getQueryClient = () => {
    if (!queryClient) {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 60 * 1000,
                    retry: 1,
                    refetchOnWindowFocus: false,
                },
                mutations: {
                    retry: 1,
                },
            },
        });
    }

    return queryClient;
};
