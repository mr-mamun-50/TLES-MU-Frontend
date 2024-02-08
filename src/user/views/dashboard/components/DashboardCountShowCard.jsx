import { Box } from "@mui/material";

export default function DashboardCountShowCard({ label, count, icon, color }) {
  return (
    <Box className="col-xl-3 col-sm-6 col-12 mb-4">
      <Box className={`card card-body border-bottom border-${color} border-4 h-100`}>
        <Box className="d-flex justify-content-between px-md-1">
          <Box className="align-self-center">
            <i className={`${icon} text-secondary fa-3x`}></i>
          </Box>
          <Box className="text-end">
            <h3 className={`fw-bold text-${color}`}>{count}</h3>
            <p className={`mb-0 text-${color}`}>{label}</p>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
