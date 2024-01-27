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
import Teachers from './admin/views/teacher/Teachers';
import BatchSection from './admin/views/batch_section/BatchSection';
import Students from './admin/views/student/Students';
import AddStudent from './admin/views/student/AddStudent';
import Semesters from "./admin/views/semester/Semesters";
import AssignedCourses from "./user/views/classes/AssignedCourses";
import Departments from "./admin/views/department_courses/Departments";
import ViewClass from "./user/views/classes/ViewClass";
import CreateQuestion from "./user/views/classes/view_class/Questions/CreateQuestion";
import ViewQuestion from "./user/views/classes/view_class/Questions/ViewQuestion";
import ManualMarksEntry from "./user/views/classes/view_class/Marks/ManualMarksEntry";
import ImportMarks from "./user/views/classes/view_class/Marks/ImportMarks";
import StudentDashboard from "./user/views/classes/view_class/Students/StudentDashboard";
import StudentProfile from "./user/views/classes/view_class/Students/StudentProfile";
import ModeratorPrivateRoute from "./moderator/layout/PrivateRoute";
import ModeratorLayout from "./moderator/layout/Layout";
import ModeratorDashboard from "./moderator/views/Dashboard";
import Moderators from "./admin/views/moderator/Moderators";
import ModeratorCourses from "./moderator/views/Courses";

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

        {/* Classes routes */}
        <Route path="classes" element={<AssignedCourses />} />
        <Route path="classes/:id" element={<ViewClass />} />

        {/* Question routes */}
        <Route path="classes/create-question/:id" element={<CreateQuestion />} />
        <Route path="classes/question/:id" element={<ViewQuestion />} />

        {/* Marks entry routes */}
        <Route path="classes/manual-marks-entry/:id" element={<ManualMarksEntry />} />
        <Route path="classes/import-marks/:id" element={<ImportMarks />} />

        {/* Students routes */}
        <Route path="classes/student-dashboard/:id" element={<StudentDashboard />} />
        <Route path="classes/student-profile/:id" element={<StudentProfile />} />
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

        {/* moderators */}
        <Route path="moderators" element={<Moderators />} />

        {/* Batches Routes  */}
        <Route path="batch-section" element={<BatchSection />} />

        {/* Department Routes */}
        <Route path="departments-courses" element={<Departments />} />

        {/* Student Routes */}
        <Route path="students" element={<Students />} />
        <Route path="students/add" element={<AddStudent />} />

        {/* Semester & Assign Course */}
        <Route path="semester" element={<Semesters />} />
        <Route path="semester/classes/:id" element={<ViewClass />} />

        {/* Question routes */}
        <Route path="semester/classes/question/:id" element={<ViewQuestion />} />

        {/* Marks entry routes */}
        <Route path="semester/classes/manual-marks-entry/:id" element={<ManualMarksEntry />} />

        {/* Students routes */}
        <Route path="semester/classes/student-dashboard/:id" element={<StudentDashboard />} />
        <Route path="semester/classes/student-profile/:id" element={<StudentProfile />} />
      </Route>


      {/**
          |--------------------------------------------------------------------------
          | Moderator routes
          |--------------------------------------------------------------------------
         */}
      <Route path="/moderator" element={<ModeratorPrivateRoute><ModeratorLayout /></ModeratorPrivateRoute>}>
        <Route index element={<ModeratorDashboard />} />

        {/* Teacher Routes */}
        <Route path="teachers" element={<Teachers />} />

        {/* moderators */}
        <Route path="moderators" element={<Moderators />} />

        {/* Batches Routes  */}
        <Route path="batch-section" element={<BatchSection />} />

        {/* Department Routes */}
        <Route path="departments-courses" element={<ModeratorCourses />} />

        {/* Student Routes */}
        <Route path="students" element={<Students />} />
        <Route path="students/add" element={<AddStudent />} />

        {/* Semester & Assign Course */}
        <Route path="semester" element={<Semesters />} />
        <Route path="semester/classes/:id" element={<ViewClass />} />

        {/* Question routes */}
        <Route path="semester/classes/question/:id" element={<ViewQuestion />} />

        {/* Marks entry routes */}
        <Route path="semester/classes/manual-marks-entry/:id" element={<ManualMarksEntry />} />

        {/* Students routes */}
        <Route path="semester/classes/student-dashboard/:id" element={<StudentDashboard />} />
        <Route path="semester/classes/student-profile/:id" element={<StudentProfile />} />
      </Route>


      <Route path="/login" element={<PublicRoute><UserLogin /></PublicRoute>} />
      <Route path="/admin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />

      {/* <Route path="/forgot-password" element={<ForgotPassword />} /> */}
      <Route path="*" element={<Navigate to={'/'} />} />
    </Routes>
  )
}
