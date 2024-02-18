import { Box } from "@mui/material";
import { forwardRef } from "react";
import DashboardCountShowCard from "../../components/DashboardCountShowCard";
import DashboardAvgBloomsLevels from "../../components/DashboardAvgBloomsLevels";
import { PrintHeading } from "./components/PrintHeading";
import DashboardAvgGpaPrint from "./components/DashboardAvgGpa";

// eslint-disable-next-line react/display-name
export const AdminModDashboardPrint = forwardRef((props, ref) => {

  const { dashboardContent, semester, department } = props;
  const moderator = JSON.parse(localStorage.getItem('user')) || JSON.parse(sessionStorage.getItem('user'));

  return (
    <Box ref={ref} className="print-section">

      {/* heading section */}
      <PrintHeading content={
        <Box>
          <h5>
            {"Department Dashboard"}
            <small className="fw-normal"> - {semester.name}</small>
          </h5>
          <h6 className="mb-0">{
            moderator.department ?
              moderator.department.name
              : department.name
          }</h6>
        </Box>
      } />


      <Box className="row mt-2">

        {/* heading cards */}
        <DashboardCountShowCard label={'Total Courses'} count={dashboardContent.current_classes_count}
          icon={'fas fa-chalkboard-user'} color={'success'} />

        <DashboardCountShowCard label={'Running Students'} count={dashboardContent.running_students}
          icon={'fas fa-people-roof'} color={'info'} />

        <DashboardCountShowCard label={'Retaking Students'} count={dashboardContent.retaking_students}
          icon={'fas fa-person-walking-arrow-loop-left'} color={'danger'} />

        <DashboardCountShowCard label={'Working Teachers'} count={dashboardContent.working_teachers}
          icon={'fas fa-person-chalkboard'} color={'primary'} />


        {/* blooms level counts */}
        <Box className="col-12 col-lg-8 mb-3" sx={{ width: '8.27in' }}>
          <Box className="card border border-light-grey h-100">
            <Box className="card-header">
              <h6 className="mt-2 mb-0">Total Attainment</h6>
            </Box>

            <Box className="card-body">
              {dashboardContent.current_classes?.length > 0 ?
                <DashboardAvgBloomsLevels
                  current_classes={dashboardContent.current_classes}
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
              {dashboardContent.current_classes?.length > 0 ?
                <DashboardAvgGpaPrint
                  current_classes={dashboardContent.current_classes}
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