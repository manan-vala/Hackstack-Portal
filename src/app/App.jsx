import { RouterProvider } from "react-router";
import { StoreProvider } from "./store";
import { Toaster } from "./components/ui/sonner";
import { router } from "./routes";
function App() {
  return <StoreProvider>
      <RouterProvider router={router} />
      <Toaster theme="dark" />
    </StoreProvider>;
}
export {
  App as default
};
