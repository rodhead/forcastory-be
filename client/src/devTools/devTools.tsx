import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
// import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export default function Devtools() {
    return (
        <>
            <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
            {/* <TanStackRouterDevtools initialIsOpen={false} position="bottom-right" /> */}
        </>
    );
}
