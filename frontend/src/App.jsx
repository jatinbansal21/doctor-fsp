import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe } from './features/auth/authSlice';
import AppRouter from './router/AppRouter';
import { Toaster } from 'react-hot-toast';

function App() {
  const dispatch = useDispatch();
  const { accessToken, initialized } = useSelector((state) => state.auth);

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchMe());
    }
  }, [accessToken, dispatch]);

  return (
    <>
      <AppRouter initialized={initialized} />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: 'Inter, sans-serif',
            fontSize: '0.875rem',
            fontWeight: 500,
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
    </>
  );
}

export default App;
