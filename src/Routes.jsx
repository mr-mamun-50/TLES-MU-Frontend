import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from './admin/layout/Layout';
import AdminPrivateRoute from './admin/layout/PrivateRoute';
import PublicRoute from './utilities/PublicRoute';
import UserLogin from './auth/UserLogin';
import AdminLogin from './auth/AdminLogin';
import UserPrivateRoute from './user/layout/PrivateRoute';
import UserLayout from './user/layout/Layout';
import AdminDashboard from './admin/views/Dashboard';
import UserDashboard from './user/views/Dashboard';
import DcIndex from './admin/views/department_courses/DcIndex';
import Teachers from './admin/views/teacher/Teachers';
import BatchSection from './admin/views/batch_section/BatchSection';
import Students from './admin/views/student/Students';
import AddStudent from './admin/views/student/AddStudent';
import AssignCourse from "./admin/views/semester/AssignCourse";
import Semesters from "./admin/views/semester/Semesters";

export default function AllRoutes() {
  return (
    <Routes>
      {/**
          |--------------------------------------------------------------------------
          | User routes
          |--------------------------------------------------------------------------
         */}
      <Route path="/" element={<UserPrivateRoute><UserLayout /></UserPrivateRoute>}>
        <Route index element={<UserDashboard />} />

        {/* clinic routes */}
        {/* <Route path="clinics" element={<Clinics />} /> */}
      </Route>


      {/**
          |--------------------------------------------------------------------------
          | Admin routes
          |--------------------------------------------------------------------------
         */}
      <Route path="/admin" element={<AdminPrivateRoute><AdminLayout /></AdminPrivateRoute>}>
        <Route index element={<AdminDashboard />} />

        {/* Teacher Routes */}
        <Route path="teachers" element={<Teachers />} />

        {/* Batches Routes  */}
        <Route path="batch-section" element={<BatchSection />} />

        {/* Department Routes */}
        <Route path="departments-courses" element={<DcIndex />} />

        {/* Student Routes */}
        <Route path="students" element={<Students />} />
        <Route path="students/add" element={<AddStudent />} />

        {/* Semester & Assign Course */}
        <Route path="semester" element={<Semesters />} />
        <Route path="assign-course" element={<AssignCourse />} />
      </Route>


      <Route path="/login" element={<PublicRoute><UserLogin /></PublicRoute>} />
      <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />

      {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
      <Route path="/" element={<Navigate to={'/login'} />} />
      <Route path="*" element={<Navigate to={'/'} />} />
    </Routes>
  )
}
