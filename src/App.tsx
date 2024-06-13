import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { AppRoot } from '@telegram-apps/telegram-ui';
import Home from './pages/Home';
import { CreateSquad, SquadDetail, SquadList } from './pages/squad';
import useUserStore from './store/userUserStore';
import fetchAPI from './lib/utils/fetchApi';
import './App.css';
import '@telegram-apps/telegram-ui/dist/styles.css';

function AppContent() {
  const navigate = useNavigate();
  const { setUser } = useUserStore();

  const createUser = async (userId: string) => {
    console.log('createing user');
    try {
      const user = await fetchAPI('POST', '/user', { userId });
      setUser(user);
    } catch (error: any) {
      console.log(error);
    }
  };

  const getUser = async (userId: string) => {
    try {
      const user = await fetchAPI('GET', `/user/${userId}`);
      setUser(user);
      return user;
    } catch (error: any) {
      console.log(error);
    }
  };

  const fetchUser = async (userId: string) => {
    try {
      const user = await getUser(userId);
      if (!user) createUser(userId);
      console.log(user);
    } catch (error: any) {
      console.log(error);
    }
  };

  useEffect(() => {
    WebApp.expand();
    WebApp.BackButton.show();
    WebApp.BackButton.onClick(() => {
      navigate(-1);
    });
    const userId = WebApp.initDataUnsafe.user?.id;
    // const userId = 7159954324;
    if (!userId) return;
    fetchUser(`${userId}`);
  }, []);

  return (
    <div className='App'>
      <AppRoot>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/squad/create' element={<CreateSquad />} />
          <Route path='/squad/:id' element={<SquadDetail />} />
          <Route path='/squads' element={<SquadList />} />
        </Routes>
      </AppRoot>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
