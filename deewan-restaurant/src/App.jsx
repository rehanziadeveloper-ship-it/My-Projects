import React, { useState, useEffect } from 'react';
import GuestChat from './pages/GuestChat';
import KitchenScreen from './pages/KitchenScreen';
import WaiterScreen from './pages/WaiterScreen';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Route Resolver
  if (currentPath === '/kitchen') {
    return <KitchenScreen />;
  }

  if (currentPath === '/waiter') {
    return <WaiterScreen />;
  }

  if (currentPath === '/admin') {
    return <AdminPanel />;
  }

  if (currentPath === '/login') {
    return (
      <Login
        onLogin={(role) => {
          if (role === 'kitchen') navigateTo('/kitchen');
          else if (role === 'waiter') navigateTo('/waiter');
          else if (role === 'admin') navigateTo('/admin');
        }}
      />
    );
  }

  // Default to Guest Chat for / or /chat
  return <GuestChat />;
}
