import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute, AdminRoute, PublicRoute } from './protectedRoutes/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboardPage from './pages/UserDashboardPage';
import DesignJewelryPage from './pages/DesignJewelryPage';
import DashboardPage from './pages/DashboardPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import SalesPage from './pages/SalesPage';
import CustomersPage from './pages/CustomersPage';
import OrdersPage from './pages/OrdersPage';
import RatesPage from './pages/RatesPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import ProfilePage from './pages/ProfilePage';
import CustomDesignsPage from './pages/CustomDesignsPage';
import CatalogPage from './pages/CatalogPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentCancelPage from './pages/PaymentCancelPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                    />
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

                        {/* Protected Routes */}
                        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                        <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboardPage /></ProtectedRoute>} />
                        <Route path="/ai-design" element={<ProtectedRoute><DesignJewelryPage /></ProtectedRoute>} />
                        <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
                        <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
                        <Route path="/sales" element={<ProtectedRoute><SalesPage /></ProtectedRoute>} />
                        <Route path="/customers" element={<ProtectedRoute><CustomersPage /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                        <Route path="/design-requests" element={<ProtectedRoute><CustomDesignsPage /></ProtectedRoute>} />
                        <Route path="/rates" element={<ProtectedRoute><RatesPage /></ProtectedRoute>} />
                        <Route path="/catalog" element={<CatalogPage />} />
                        <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
                        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                        {/* Payment Routes */}
                        <Route path="/payment/success" element={<ProtectedRoute><PaymentSuccessPage /></ProtectedRoute>} />
                        <Route path="/payment/cancel" element={<ProtectedRoute><PaymentCancelPage /></ProtectedRoute>} />

                        {/* Admin Only Routes */}
                        <Route path="/reports" element={<AdminRoute><ReportsPage /></AdminRoute>} />
                        <Route path="/users" element={<AdminRoute><UsersPage /></AdminRoute>} />

                        {/* Default Redirect */}
                        <Route path="/" element={<Navigate to="/catalog" replace />} />
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
