import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import { PersistGate } from 'redux-persist/integration/react'
// import GA from '@utils/GoogleAnalytics';
import reportWebVitals from './reportWebVitals';
import { ConnectedRouter } from 'connected-react-router';
import { history } from '@utils/history';
import { Provider } from 'react-redux';
import { store, persistor } from './store/store';

ReactDOM.render(
  <Provider store={store}>
    <PersistGate persistor={persistor}>
      <ConnectedRouter history={history}>
        {/* {GA.init() && <GA.RouteTracker />} */}
        <App />
      </ConnectedRouter>
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () =>
    navigator.serviceWorker.register('/serviceWorker.js').catch(() => null)
  );
}

if (module.hot) {
  module.hot.accept();
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
