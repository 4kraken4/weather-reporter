import './App.css';

import { RouterProvider } from '@core/router/RouterProvider';
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <RouterProvider />
    </BrowserRouter>
  );
}

export default App;
