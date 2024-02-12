import { Box } from "@mui/material";
import { forwardRef } from "react";
import DashboardCountShowCard from "../../components/DashboardCountShowCard";
import DashboardAvgBloomsLevels from "../../components/DashboardAvgBloomsLevels";
import DashboardAvgGpa from "../../components/DashboardAvgGpa";
import { PrintHeading } from "./components/PrintHeading";

// eslint-disable-next-line react/display-name
export const UserDashboardPrint = forwardRef((props, ref) => {

  const { dashboardContent, semester } = props;
  const teacher = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));

  return (
    <Box ref={ref} className="print-section">

      {/* heading section */}
      <PrintHeading content={
        <Box>
          <h5>
            {"Techer's Dashboard"}
            <small className="fw-normal"> - {semester.name}</small>
          </h5>
          <h6 className="mb-0">{teacher.name}</h6>
          {/* <small>{teacher.email}</small> */}
          <small>{teacher.department?.name}</small>
        </Box>
      } />


      <Box className="row mt-2">

        {/* heading cards */}
        <DashboardCountShowCard label={'Semester Classes'} count={dashboardContent.assigned_classes_count}
          icon={'fas fa-chalkboard-user'} color={'success'} />

        <DashboardCountShowCard label={'Assigned Students'} count={dashboardContent.assigned_students}
          icon={'fas fa-people-roof'} color={'info'} />

        <DashboardCountShowCard label={'Retaking Students'} count={dashboardContent.retake_students}
          icon={'fas fa-person-walking-arrow-loop-left'} color={'danger'} />

        <DashboardCountShowCard label={'Total Conducted Classes'} count={dashboardContent.total_classes}
          icon={'fas fa-clipboard-check'} color={'primary'} />


        {/* blooms level counts */}
        <Box className="col-12 col-lg-8 mb-3" sx={{ width: '8.27in' }}>
          <Box className="card border border-light-grey h-100">
            <Box className="card-header">
              <h6 className="mt-2 mb-0">Average Blooms Levels of Classes</h6>
            </Box>

            <Box className="card-body">
              {dashboardContent.assigned_classes?.length > 0 ?
                <DashboardAvgBloomsLevels
                  current_classes={dashboardContent.assigned_classes}
                />
                : <Box className='text-center my-5'>Not enough data to show this report</Box>
              }
            </Box>
          </Box>
        </Box>

        {/* average GPA of my classes */}
        <Box className="col-12 col-lg-4">
          <Box className="card border border-light-grey h-100">
            <Box className="card-header">
              <h6 className="mt-2 mb-0">Average GPA of Classes</h6>
            </Box>

            <Box className="card-body">
              {dashboardContent.assigned_classes?.length > 0 ?
                <DashboardAvgGpa
                  current_classes={dashboardContent.assigned_classes}
                />
                : <Box className='text-center my-5'>Not enough data to show this report</Box>
              }
            </Box>
          </Box>
        </Box>

      </Box>
    </Box>
  );
});