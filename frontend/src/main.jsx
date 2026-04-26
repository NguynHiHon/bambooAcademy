import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { store, persistor } from './redux/store'
import { setupJwtInterceptors } from './config/axiosJWT'
import App from './App.jsx'

setupJwtInterceptors(store)

const GOOGLE_CLIENT_ID = '284118872124-k8o4nn1e5rnb198rea9qs69smdd6h27p.apps.googleusercontent.com'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <App />
        </GoogleOAuthProvider>
      </PersistGate>
    </Provider>
  </StrictMode>,
)
