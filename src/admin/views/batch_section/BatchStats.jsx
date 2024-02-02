import { Box } from '@mui/material';
import { useLocation, useParams } from 'react-router-dom'

export default function BatchStats() {

  const batch_id = useParams().batch_id;
  const location = useLocation();
  const batch = location.state.batch;

  // console.log(batch);

  return (
    <Box className="container">
      <Box className="card my-2">
        {/* seading section */}
        <Box className='card-header pb-0 d-flex justify-content-between align-items-center' sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Box className='d-flex'>
            <button onClick={() => window.history.back()} className='btn btn-light btn-floating me-3 mt-2'>
              <i className='fas fa-arrow-left fa-lg'></i></button>
            <Box className='my-2'>
              <h5 className='card-title mb-1'>
                Batch: {batch.batch_name}
              </h5>
              <small> Sections:
                {batch.sections.map((section, index) => (
                  <span>
                    {` ${section.section_name}${batch.sections.length - 1 !== index ? ', ' : ''}`}
                  </span>
                ))}
              </small> <br />
              <small className='text-muted'>{`${batch.department.name}`}</small>
            </Box>
          </Box>
        </Box>

        {/* body section */}
        <Box className="card-body">

        </Box>
      </Box>
    </Box>
  )
}
