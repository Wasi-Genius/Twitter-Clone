import {Route, Routes} from 'react-router-dom';
import HomePage from './pages/home/HomePage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import LoginPage from './pages/auth/login/LoginPage';
import SideBar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';
import NotificationPage from './pages/notifications/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';

import { Toaster } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {

	const {data, isLoading} = useQuery({

		queryKey: ['authUser'],
		queryFn: async () => {
			try {
				const res = await fetch('/api/auth/me');
				const data = await res.json();
				if(!res.ok) {
					throw new Error(data.message || 'Failed to fetch user data');
				}
				return data; 
			} catch (error) {
				throw new Error(error)
			}
		},
	});

	if (isLoading) {
		return (
			<div className = 'flex items-center justify-center h-screen'>
				<LoadingSpinner size = 'lg'/>
			</div>
		)
	}

	return (
		<div className='flex max-w-6xl mx-auto'>
			<SideBar/>
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/signup' element={<SignUpPage />} />
				<Route path='/login' element={<LoginPage />} />
				<Route path = '/notifications' element = {<NotificationPage />} />
				<Route path='/profile/:username' element={< ProfilePage />} />
			</Routes>
			<RightPanel />
			<Toaster />
		</div>
	);
}

export default App; 
