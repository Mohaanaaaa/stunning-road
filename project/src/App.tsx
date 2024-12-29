import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AlertCircle, Camera, Map, ShieldCheck, LogOut, Eye } from 'lucide-react';
import PotholeCard from './components/PotholeCard';
import ReportForm from './components/ReportForm';
import AdminView from './components/AdminView';
import Login from './components/LoginForm';
import ForgotPassword from './components/forgotPassword';
import ResetPassword from './components/ResetPassword';
import { PotholeType } from './types';
import { getDailyQuote } from './quotes';
import { COPYRIGHT_TEXT } from './copyrights';

const defaultPotholes: PotholeType[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=2400',
    location: '123 Main Street, Downtown',
    date: new Date('2024-03-10'),
    severity: 'high',
    description: 'Large pothole causing traffic slowdown and vehicle damage.',
    resolved: false,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1518162673976-0d2f210f3d05?auto=format&fit=crop&q=80&w=2400',
    location: '456 Oak Avenue, Westside',
    date: new Date('2024-03-09'),
    severity: 'medium',
    description: 'Medium-sized pothole near school zone.',
    resolved: false,
  },
];

// Function to parse potholes and convert date strings to Date objects
const parsePotholes = (potholes: any[]): PotholeType[] => {
  return potholes.map((pothole) => ({
    ...pothole,
    date: new Date(pothole.date), // Convert date string back to Date object
  }));
};

function App() {
  const storedPotholes = JSON.parse(localStorage.getItem('potholes') || '[]');
  const [potholes, setPotholes] = useState<PotholeType[]>(
    storedPotholes.length > 0 ? parsePotholes(storedPotholes) : defaultPotholes
  );
  const [showForm, setShowForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Effect to save potholes to local storage
  useEffect(() => {
    const potholesToStore = potholes.map((pothole) => ({
      ...pothole,
      date: pothole.date.toISOString(), // Store dates as ISO strings
    }));
    localStorage.setItem('potholes', JSON.stringify(potholesToStore));
  }, [potholes]);

  // Handle login success
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setIsAdmin(true);
    setShowLogin(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsAuthenticated(false);
        setIsAdmin(false);
        setShowLogin(false);
        console.log('Logout successful');
      } else {
        const errorResponse = await response.json();
        console.error('Logout failed:', errorResponse.message);
      }
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  // Handle submission of the pothole report form
  const handleSubmit = (data: any) => {
    const newPothole: PotholeType = {
      id: potholes.length + 1,
      image: 'https://images.unsplash.com/photo-1516728778615-2d590ea1855e?auto=format&fit=crop&q=80&w=2400',
      location: data.location,
      date: new Date(),
      severity: data.severity,
      description: data.description,
      resolved: false,
    };
    setPotholes([newPothole, ...potholes]);
    setShowForm(false);
  };

  // Handle marking a pothole as resolved
  const handleResolve = (id: number) => {
    setPotholes(potholes.map((pothole) => (pothole.id === id ? { ...pothole, resolved: true } : pothole)));
  };

  // Handle deleting a pothole report
  const handleDelete = (id: number) => {
    setPotholes(potholes.filter((pothole) => pothole.id !== id));
  };

  const activePotholes = potholes.filter((p) => !p.resolved);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <div className="min-h-screen bg-gray-50">
              <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-8 w-8 text-blue-600" />
                      <h1 className="text-2xl font-bold text-gray-900">Bengaluru Roads</h1>
                    </div>
                    <div className="flex items-center gap-4">
                      {!isAuthenticated && !showLogin && (
                        <button
                          onClick={() => setShowForm(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Camera size={20} />
                          Report Road
                        </button>
                      )}
                      {isAuthenticated && (
                        <>
                          <button
                            onClick={() => setIsAdmin(!isAdmin)}
                            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                          >
                            <Eye size={20} />
                            {isAdmin ? 'Public View' : 'Admin View'}
                          </button>
                          <button
                            onClick={handleLogout}
                            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                          >
                            <LogOut size={20} />
                            Logout
                          </button>
                        </>
                      )}
                      {!isAuthenticated && (
                        <button
                          onClick={() => setShowLogin(!showLogin)}
                          className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
                        >
                          <ShieldCheck size={20} />
                          {showLogin ? 'Back to Home' : 'Login to Admin'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </header>

              {showLogin ? (
                <Login onLoginSuccess={handleLoginSuccess} />
              ) : (
                <>
                  {!isAdmin ? (
                    <>
                      {/* Daily Quote Section */}
                      <div className="bg-gray-100 py-4 shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                          <p className="text-lg font-bold text-gray-700 italic">"{getDailyQuote()}"</p>
                        </div>
                      </div>
                      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {showForm ? (
                          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                              <h2 className="text-xl font-semibold">Report a Pothole</h2>
                              <button
                                onClick={() => setShowForm(false)}
                                className="text-gray-500 hover:text-gray-700"
                              >
                                ×
                              </button>
                            </div>
                            <ReportForm onSubmit={handleSubmit} />
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                              <div className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="flex items-center gap-2 text-blue-600 mb-2">
                                  <Map size={24} />
                                  <h3 className="font-semibold">Active Reports</h3>
                                </div>
                                <p className="text-3xl font-bold">{activePotholes.length}</p>
                              </div>
                              <div className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="flex items-center gap-2 text-orange-600 mb-2">
                                  <AlertCircle size={24} />
                                  <h3 className="font-semibold">High Severity</h3>
                                </div>
                                <p className="text-3xl font-bold">
                                  {activePotholes.filter((p) => p.severity === 'high').length}
                                </p>
                              </div>
                              <div className="bg-white p-6 rounded-xl shadow-sm">
                                <div className="flex items-center gap-2 text-green-600 mb-2">
                                  <Camera size={24} />
                                  <h3 className="font-semibold">Recent Reports</h3>
                                </div>
                                <p className="text-3xl font-bold">
                                  {activePotholes.filter((p) => {
                                    const daysDiff =
                                      (new Date().getTime() - p.date.getTime()) / (1000 * 3600 * 24);
                                    return daysDiff <= 7;
                                  }).length}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {activePotholes.map((pothole) => (
                                <PotholeCard key={pothole.id} {...pothole} onResolve={handleResolve} onDelete={handleDelete} />
                              ))}
                            </div>
                          </>
                        )}
                      </main>
                    </>
                  ) : (
                    isAuthenticated && (
                      <AdminView
                        potholes={potholes}
                        onResolve={handleResolve}
                        onDelete={handleDelete}
                      />
                    )
                  )}
                </>
              )}

              <footer className="bg-white shadow-sm py-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                  <p onClick={() => alert(COPYRIGHT_TEXT)} className="text-sm text-gray-500">
                    © {new Date().getFullYear()} Bengaluru Roads. All Rights Reserved.
                  </p>
                  <p className="text-sm text-gray-600">
                    Click here to view the copyright information
                  </p>
                </div>
              </footer>
            </div>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;