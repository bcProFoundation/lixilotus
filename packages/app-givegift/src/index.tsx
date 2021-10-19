import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import { StoreProvider } from 'src/store/context';
// import GA from '@utils/GoogleAnalytics';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <StoreProvider>
    <Router>
      {/* {GA.init() && <GA.RouteTracker />} */}
      <App />
    </Router>
  </StoreProvider>,
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
