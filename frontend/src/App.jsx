import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Suspense, useContext, lazy } from "react";
import { Spinner } from "react-bootstrap";
import { AuthContext } from "./contexts/AuthContext";

import Header from "./components/Header";
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Home = lazy(() => import("./pages/Home"));
const TemplateDetail = lazy(() => import("./pages/TemplateDetail"));
const TemplateEditor = lazy(() => import("./pages/TemplateEditor"));
const SearchResults = lazy(() => import("./pages/SearchResults"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));
const TemplateAnalytics = lazy(() => import("./pages/TemplateAnalytics"));
const FormDetail = lazy(() => import("./pages/FormDetail"));

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

      <Suspense
        fallback={
          <div className="d-flex justify-content-center mt-5">
            <Spinner />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/search" element={<SearchResults />} />
          <Route path="/forms/:id" element={<FormDetail />} />
          <Route path="/templates/:id" element={<TemplateDetail />} />
          <Route
            path="/templates/:id/analytics"
            element={
              <PrivateRoute>
                <TemplateAnalytics />
              </PrivateRoute>
            }
          />
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
                <TemplateEditor />
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
      </Suspense>
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
