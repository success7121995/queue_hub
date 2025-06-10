"use client";

// TODO: Enable when backend is ready
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

const QueryProvider = ({ children }: { children: ReactNode }) => {
    // TODO: Enable when backend is ready
    // const [queryClient] = useState(() => new QueryClient());
    // return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    return <>{children}</>;
}

export default QueryProvider;