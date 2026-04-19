import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Trips from './pages/Trips';
import TripDashboard from './pages/TripDashboard';
import TripOverview from './pages/TripOverview';
import Budget from './pages/Budget';
import Accommodation from './pages/Accommodation';
import Transport from './pages/Transport';
import Expenses from './pages/Expenses';
import CurrencyConverter from './pages/CurrencyConverter';

function Layout() {
  return (
    <div className="min-h-screen bg-neutral-950">
      <Navbar />
      <Outlet />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'trips', element: <Trips /> },
      {
        path: 'trips/:id',
        element: <TripDashboard />,
        children: [
          { index: true, element: <TripOverview /> },
          { path: 'budget', element: <Budget /> },
          { path: 'accommodation', element: <Accommodation /> },
          { path: 'transport', element: <Transport /> },
          { path: 'expenses', element: <Expenses /> },
          { path: 'currency', element: <CurrencyConverter /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
