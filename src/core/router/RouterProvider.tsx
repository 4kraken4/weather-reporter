import { useRoutes } from 'react-router-dom';

import { routes } from './router.config';

export const RouterProvider = () => {
  const element = useRoutes(routes);
  return element;
};
