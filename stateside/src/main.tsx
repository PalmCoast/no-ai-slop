import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import { Layout } from "./components/Layout";
import { Spinner } from "./components/ui";
import { AdminPage } from "./pages/Admin";
import { Login, Signup } from "./pages/Auth";
import { Applicants, EmployerDashboard, PostJob, PostSuccess } from "./pages/Employer";
import { GroupDetail, GroupsPage } from "./pages/Groups";
import { Home } from "./pages/Home";
import { JobDetail, JobsPage } from "./pages/Jobs";
import { MessagesPage, PeoplePage, PersonDetail } from "./pages/People";
import { NotFound, PoliciesPage } from "./pages/Policies";
import { ProfilePage } from "./pages/Profile";
import "./styles.css";

function RequireAuth({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { me, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner />;
  if (!me) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (admin && !me.is_admin) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/policies" element={<PoliciesPage />} />
        <Route path="/employer" element={<EmployerDashboard />} />
        <Route path="/employer/post" element={<RequireAuth><PostJob /></RequireAuth>} />
        <Route path="/employer/jobs/:id/applicants" element={<RequireAuth><Applicants /></RequireAuth>} />
        <Route path="/post/success" element={<RequireAuth><PostSuccess /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/groups" element={<RequireAuth><GroupsPage /></RequireAuth>} />
        <Route path="/groups/:slug" element={<RequireAuth><GroupDetail /></RequireAuth>} />
        <Route path="/people" element={<RequireAuth><PeoplePage /></RequireAuth>} />
        <Route path="/people/:id" element={<RequireAuth><PersonDetail /></RequireAuth>} />
        <Route path="/messages" element={<RequireAuth><MessagesPage /></RequireAuth>} />
        <Route path="/messages/:userId" element={<RequireAuth><MessagesPage /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth admin><AdminPage /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
