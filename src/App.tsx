// src/App.tsx
import { useRoutes } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { SiteHeader } from "@/components/site-header";

// Define routes configuration
const routes = [
    { path: "/", element: <Index /> },
    { path: "*", element: <NotFound /> }
];

const App = () => {
    const element = useRoutes(routes);

    return (
        <>
            <SiteHeader />
            {element}
        </>
    );
};

export default App;