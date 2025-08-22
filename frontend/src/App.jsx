import { Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

import HomePage from './pages/home/HomePage';
import SignUpPage from './pages/auth/signup/SignUpPage';
import LoginPage from './pages/auth/login/LoginPage';
import NotificationPage from './pages/notifications/NotificationPage';
import ProfilePage from './pages/profile/ProfilePage';

import SideBar from './components/common/Sidebar';
import RightPanel from './components/common/RightPanel';
import LoadingSpinner from './components/common/LoadingSpinner';

function App() {
	// Query to fetch the currently authenticated user
	const { data: authUser, isLoading } = useQuery({
		queryKey: ['authUser'],
		queryFn: async () => {
			const res = await fetch('/api/auth/me');
			const data = await res.json();

			// If backend sends an error in JSON response, treat as unauthenticated
			if (data.error) return null;

			// Handle failed response (non-2xx status)
			if (!res.ok) {
				throw new Error(data.error || 'Failed to fetch user data');
			}

			return data;
		},
		retry: false, // Do not retry the request if it fails
	});

	// Show loading spinner while user data is being fetched
	if (isLoading) {
		return (
			<div className='flex items-center justify-center h-screen'>
				<LoadingSpinner size='lg' />
			</div>
		);
	}

	return (
		<div className='flex max-w-6xl mx-auto'>

			{/* Sidebar (only visible when user is logged in) */}
			{authUser && <SideBar />}

			{/* Define application routes */}
			<Routes>
				{/* Home Page - only accessible when logged in */}
				<Route
					path='/'
					element={authUser ? <HomePage /> : <Navigate to='/login' />}
				/>

				{/* Sign Up - redirect to home if already logged in */}
				<Route
					path='/signup'
					element={!authUser ? <SignUpPage /> : <Navigate to='/' />}
				/>

				{/* Login - redirect to home if already logged in */}
				<Route
					path='/login'
					element={!authUser ? <LoginPage /> : <Navigate to='/' />}
				/>

				{/* Notifications - protected route */}
				<Route
					path='/notifications'
					element={authUser ? <NotificationPage /> : <Navigate to='/login' />}
				/>

				{/* Profile - protected route */}
				<Route
					path='/profile/:username'
					element={authUser ? <ProfilePage /> : <Navigate to='/login' />}
				/>

			</Routes>

			{/* Right Panel (only visible when user is logged in) */}
			{authUser && <RightPanel />}

			{/* Toast notifications container */}
			<Toaster />
		</div>
	);
}

export default App;
