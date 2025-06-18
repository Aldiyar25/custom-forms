import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";

import Header from "./components/Header";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import TemplateDetail from "./pages/TemplateDetail";
import TemplateEditor from "./pages/TemplateEditor";
import SearchResults from "./pages/SearchResults";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user && user.role === "ADMIN" ? children : <Navigate to="/" replace />;
}

function AppLayout() {
  const location = useLocation();
  const noHeader = ["/login", "/register"];
  return (
    <>
      {!noHeader.includes(location.pathname) && <Header />}

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/search" element={<SearchResults />} />

        <Route path="/templates/:id" element={<TemplateDetail />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/" element={<Home />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/templates/new"
          element={
            <PrivateRoute>
              <TemplateEditor />
            </PrivateRoute>
          }
        />
        <Route
          path="/templates/:id/edit"
          element={
            <PrivateRoute>
              <TemplateDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
export default App;
