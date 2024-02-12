import { Box } from '@mui/material'
import MuLogo from '../../../../assets/images/logo/mu_logo.png'
import TlesLogo from '../../../../assets/images/logo/tles_logo_dt.png'

export const PrintHeading = (props) => {

  const { content } = props;

  return (
    <Box className="d-flex justify-content-between align-items-start border-bottom pb-2 mb-2">
      {/* info section */}
      <Box>
        {content}
      </Box>


      {/* logo section */}
      <Box className="d-flex">
        <img src={MuLogo} alt="" width={130} />
        <span className='border mx-3'></span>
        <img src={TlesLogo} alt="" width={130} />
      </Box>
    </Box>
  )
}
