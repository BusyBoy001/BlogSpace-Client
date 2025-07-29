import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import BlogPage from "./components/BlogPage";
import RegisterPage from "./components/RegisterPage";
import LoginPage from "./components/LoginPage";
import BlogReadPage from "./components/BlogReadPage";
import CreatePost from "./components/CreatePost";
import AdminAccounts from "./components/AdminAccounts";
import AdminDashboard from "./components/AdminDashboard";
import UserProfile from "./components/UserProfile";
import AdminAccountDetail from "./components/AdminAccountDetail";
import { SearchProvider } from "./SearchContext";
import { ThemeProvider } from "./ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <SearchProvider>
          <div className="bg-lightbg dark:bg-darkbg min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1 flex flex-col">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/blog/:id" element={<BlogReadPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/create-post" element={<CreatePost />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/accounts" element={<AdminAccounts />} />
                <Route path="/admin/accounts/:id" element={<AdminAccountDetail />} />
                <Route path="/profile/:userId" element={<UserProfile />} />
                <Route path="/profile" element={<UserProfile />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </SearchProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
