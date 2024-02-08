// pages/_app.tsx
import React from "react";
import { Provider } from "react-redux";
import store from "../redux/store"; // Import your store
import type { AppProps } from "next/app";
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  );
}

export default MyApp;
