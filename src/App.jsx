import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import RegisterPage from './pages/registerPage';
import HomePage from './pages/homePage';
import ProtectedRoute from './protectiveCheck/protectedRoute.jsx';
import PublicRoute from './protectiveCheck/publicRoute.jsx'
import RecipeDetailsPage from './pages/recipeDetailsPage.jsx';
import LikedPage from './pages/likedPage.jsx';
import { Toaster} from 'react-hot-toast'

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
        <Toaster position="top-center" />
          <Routes>
            <Route path="/" element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } />
            <Route path="/home" element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } />
            <Route path="/recipeDetails/:recipeId" element={
              <ProtectedRoute>
                <RecipeDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/liked" element={
              <ProtectedRoute>
                <LikedPage />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;