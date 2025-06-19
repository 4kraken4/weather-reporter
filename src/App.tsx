import { RouterProvider } from '@core/router/RouterProvider';
import 'primeflex/primeflex.css'; // flex
import 'primeicons/primeicons.css'; // icons
import 'primereact/resources/primereact.min.css'; // core css
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <RouterProvider />
    </BrowserRouter>
  );
}

export default App;
