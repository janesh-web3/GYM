import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ExploreGyms from "./pages/ExploreGyms";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/gym/Dashboard";
import EditProfile from "./pages/gym/EditProfile";
import UploadMedia from "./pages/gym/UploadMedia";
import Trainers from "./pages/gym/Trainers";
import Members from "./pages/gym/Members";
import WorkoutPlans from "./pages/gym/WorkoutPlans";
import DietPlans from "./pages/gym/DietPlans";
import Scheduling from "./pages/gym/Scheduling";
import Attendance from "./pages/gym/Attendance";
import MemberProgress from "./pages/gym/MemberProgress";
import Branches from "./pages/gym/Branches";
import BranchProfile from "./pages/gym/BranchProfile";
import QrScanner from "./pages/gym/QrScanner";
import CoinDashboard from "./pages/gym/CoinDashboard";
import MemberDashboard from "./pages/member/Dashboard";
import MemberProfile from "./pages/member/Profile";
import MemberWorkoutPlans from "./pages/member/WorkoutPlan";
import MemberDietPlans from "./pages/member/DietPlan";
import MemberSchedule from "./pages/member/Schedule";
import MemberProgressPage from "./pages/member/Progress";
import GymShop from "./pages/member/Shop";
import PremiumMembership from "./pages/member/PremiumMembership";

// React Toastify
import { ToastContainer } from "react-toastify";

// Trainer components
import TrainerDashboard from "./pages/trainer/Dashboard";
import TrainerMembers from "./pages/trainer/Members";
import WorkoutPlanner from "./pages/trainer/WorkoutPlanner";
import TrainerAttendance from "./pages/trainer/Attendance";
import TrainerChat from "./pages/trainer/Chat";

// Admin components
import AdminDashboard from "./pages/admin/Dashboard";
import GymManagement from "./pages/admin/GymManagement";
import SalesMonitoring from "./pages/admin/SalesMonitoring";
import ProductListing from "./pages/admin/ProductListing";
import Settings from "./pages/admin/Settings";
import CoinManagement from "./pages/admin/CoinManagement";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/explore" element={<ExploreGyms />} />
      </Route>

      {/* Gym Owner Routes */}
      <Route
        path="/gym"
        element={<ProtectedRoute allowedRoles={["gymOwner"]} />}
      >
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="upload-media" element={<UploadMedia />} />
          <Route path="trainers" element={<Trainers />} />
          <Route path="members" element={<Members />} />
          <Route path="workout-plans" element={<WorkoutPlans />} />
          <Route path="diet-plans" element={<DietPlans />} />
          <Route path="scheduling" element={<Scheduling />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="member-progress" element={<MemberProgress />} />
          <Route path="branches" element={<Branches />} />
          <Route path="branches/:branchId" element={<BranchProfile />} />
          <Route path="qr-scanner" element={<QrScanner />} />
          <Route path="coin-dashboard" element={<CoinDashboard />} />
        </Route>
      </Route>

      {/* Member Routes */}
      <Route
        path="/member"
        element={<ProtectedRoute allowedRoles={["member"]} />}
      >
        <Route element={<AppLayout />}>
          <Route index element={<MemberDashboard />} />
          <Route path="dashboard" element={<MemberDashboard />} />
          <Route path="workout-plans" element={<MemberWorkoutPlans />} />
          <Route path="diet-plans" element={<MemberDietPlans />} />
          <Route path="schedule" element={<MemberSchedule />} />
          <Route path="progress" element={<MemberProgressPage />} />
          <Route path="profile" element={<MemberProfile />} />
          <Route path="shop" element={<GymShop />} />
          <Route path="premium" element={<PremiumMembership />} />
        </Route>
      </Route>

      {/* Trainer Routes */}
      <Route
        path="/trainer"
        element={<ProtectedRoute allowedRoles={["trainer"]} />}
      >
        <Route element={<AppLayout />}>
          <Route index element={<TrainerDashboard />} />
          <Route path="dashboard" element={<TrainerDashboard />} />
          <Route path="members" element={<TrainerMembers />} />
          <Route path="workout-planner" element={<WorkoutPlanner />} />
          <Route path="attendance" element={<TrainerAttendance />} />
          <Route path="chat" element={<TrainerChat />} />
        </Route>
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={<ProtectedRoute allowedRoles={["admin"]} />}
      >
        <Route element={<AppLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="gym-management" element={<GymManagement />} />
          <Route path="sales" element={<SalesMonitoring />} />
          <Route path="products" element={<ProductListing />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      {/* SuperAdmin Routes */}
      <Route
        path="/superadmin"
        element={<ProtectedRoute allowedRoles={["superadmin"]} />}
      >
        <Route element={<AppLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="gym-management" element={<GymManagement />} />
          <Route path="sales" element={<SalesMonitoring />} />
          <Route path="products" element={<ProductListing />} />
          <Route path="settings" element={<Settings />} />
          <Route path="coin-management" element={<CoinManagement />} />
        </Route>
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
          aria-label="Notifications"
        />
      </AuthProvider>
    </Router>
  );
}

export default App;
