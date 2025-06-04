import { Login } from "@/components";
import LoadingIndicator from "@/components/common/loading-indicator";
import { Suspense } from "react";

const LoginPage = () => {
    return (
        <Suspense fallback={<LoadingIndicator fullScreen />}>
            <Login />
        </Suspense>
    )
}

export default LoginPage;