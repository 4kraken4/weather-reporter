import { useRouteError } from 'react-router-dom';

export const ErrorBoundary = () => {
  const error = useRouteError();

  return (
    <div>
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
  );
};
