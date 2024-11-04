import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setTokens } from '../redux/userSlice';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const accessTokenData = useSelector((state) => state.accessToken);
  const dispatch = useDispatch()
  useEffect(()=>{
    const queryString = location.search;
    const params = new URLSearchParams(queryString);
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    if (accessToken && refreshToken && !accessTokenData) {
      dispatch(setTokens({ accessToken, refreshToken }));
    }
  },[])
  if (!accessTokenData) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;