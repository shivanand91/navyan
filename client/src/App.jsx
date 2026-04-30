import { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { StudentLayout } from "@/layouts/StudentLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { useAuth } from "@/context/AuthContext";

const Home = lazy(() => import("@/pages/public/Home"));
const Courses = lazy(() => import("@/pages/public/Courses"));
const Internships = lazy(() => import("@/pages/public/Internships"));
const InternshipDetail = lazy(() => import("@/pages/public/InternshipDetail"));
const Services = lazy(() => import("@/pages/public/Services"));
const Jobs = lazy(() => import("@/pages/public/Jobs"));
const About = lazy(() => import("@/pages/public/About"));
const Contact = lazy(() => import("@/pages/public/Contact"));
const VerifyCertificate = lazy(() => import("@/pages/public/VerifyCertificate"));
const Login = lazy(() => import("@/pages/auth/Login"));
const Signup = lazy(() => import("@/pages/auth/Signup"));
const StudentDashboard = lazy(() => import("@/pages/student/Dashboard"));
const ProfileOverview = lazy(() => import("@/pages/student/ProfileOverview"));
const Profile = lazy(() => import("@/pages/student/Profile"));
const StudentInternships = lazy(() => import("@/pages/student/Internships"));
const StudentJobs = lazy(() => import("@/pages/student/Jobs"));
const Applications = lazy(() => import("@/pages/student/Applications"));
const Certificates = lazy(() => import("@/pages/student/Certificates"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminInternships = lazy(() => import("@/pages/admin/Internships"));
const AdminJobs = lazy(() => import("@/pages/admin/Jobs"));
const AdminCourses = lazy(() => import("@/pages/admin/Courses"));
const AdminReferrals = lazy(() => import("@/pages/admin/Referrals"));
const AdminApplications = lazy(() => import("@/pages/admin/Applications"));
const AdminSubmissions = lazy(() => import("@/pages/admin/Submissions"));
const AdminCertificates = lazy(() => import("@/pages/admin/Certificates"));
const ServiceInquiries = lazy(() => import("@/pages/admin/ServiceInquiries"));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="navyan-card w-full max-w-md px-6 py-10 text-center">
        <p className="font-display text-2xl font-semibold text-slate-950 dark:text-[#f5f7fa]">
          Loading interface
        </p>
        <p className="mt-2 text-sm text-slate-600 dark:text-[#b7c0cc]">
          Preparing the next workspace surface.
        </p>
      </div>
    </div>
  );
}

function PrivateRoute({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function LazyPage({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, location.search]);

  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LazyPage><Home /></LazyPage>} />
          <Route path="/courses" element={<LazyPage><Courses /></LazyPage>} />
          <Route path="/internships" element={<LazyPage><Internships /></LazyPage>} />
          <Route path="/internships/:slug" element={<LazyPage><InternshipDetail /></LazyPage>} />
          <Route path="/jobs" element={<LazyPage><Jobs /></LazyPage>} />
          <Route path="/services" element={<LazyPage><Services /></LazyPage>} />
          <Route path="/about" element={<LazyPage><About /></LazyPage>} />
          <Route path="/contact" element={<LazyPage><Contact /></LazyPage>} />
          <Route path="/verify-certificate" element={<LazyPage><VerifyCertificate /></LazyPage>} />
          <Route path="/verify-certificate/:certificateId" element={<LazyPage><VerifyCertificate /></LazyPage>} />
          <Route path="/login" element={<LazyPage><Login /></LazyPage>} />
          <Route path="/signup" element={<LazyPage><Signup /></LazyPage>} />
        </Route>

        <Route
          path="/student"
          element={
            <PrivateRoute role="student">
              <StudentLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<LazyPage><StudentDashboard /></LazyPage>} />
          <Route path="profile" element={<LazyPage><ProfileOverview /></LazyPage>} />
          <Route path="profile/edit" element={<LazyPage><Profile /></LazyPage>} />
          <Route path="internships" element={<LazyPage><StudentInternships /></LazyPage>} />
          <Route path="jobs" element={<LazyPage><StudentJobs /></LazyPage>} />
          <Route path="applications" element={<LazyPage><Applications /></LazyPage>} />
          <Route path="certificates" element={<LazyPage><Certificates /></LazyPage>} />
        </Route>

        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<LazyPage><AdminDashboard /></LazyPage>} />
          <Route path="internships" element={<LazyPage><AdminInternships /></LazyPage>} />
          <Route path="jobs" element={<LazyPage><AdminJobs /></LazyPage>} />
          <Route path="courses" element={<LazyPage><AdminCourses /></LazyPage>} />
          <Route path="referrals" element={<LazyPage><AdminReferrals /></LazyPage>} />
          <Route path="applications" element={<LazyPage><AdminApplications /></LazyPage>} />
          <Route path="submissions" element={<LazyPage><AdminSubmissions /></LazyPage>} />
          <Route path="certificates" element={<LazyPage><AdminCertificates /></LazyPage>} />
          <Route path="service-inquiries" element={<LazyPage><ServiceInquiries /></LazyPage>} />
        </Route>
      </Routes>
    </>
  );
}
