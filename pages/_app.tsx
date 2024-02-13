// pages/_app.tsx
import React from "react";
import { Provider } from "react-redux";
import store, {persistor} from "../redux/store"; // Import your store
import type { AppProps } from "next/app";
import '../styles/globals.css'
import { PersistGate } from "redux-persist/integration/react";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>}  persistor={persistor}>
        <Component {...pageProps} />
      </PersistGate>
    </Provider>
  );
}

export default MyApp;
