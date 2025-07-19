import { ApolloProvider } from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { client } from './apollo';
import App from './App';
import { LineupPage } from './components/tennis';
import reportWebVitals from './reportWebVitals';
import { store } from './store';
import './styles/globals.css';
import './styles/tailwind.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<App />} />
            <Route path="/tennis/lineup/:teamMatchId" element={<LineupPage />} />
          </Routes>
        </BrowserRouter>
      </ApolloProvider>
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
