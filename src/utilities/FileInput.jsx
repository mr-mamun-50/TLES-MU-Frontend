import { Box, Button, IconButton } from '@mui/material'
import React from 'react'
import styled from '@emotion/styled';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Close';

export default function FileInput({ label, state, onUpload, onDelete, formats }) {

  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  return (
    <Box display={'flex'} className='border border-secondary rounded-2'>
      <Button component="label" fullWidth style={{ justifyContent: "flex-start", textTransform: 'none' }}
        className='text-secondary ps-3 pe-1' startIcon={<CloudUploadIcon />}>
        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{state ? state.name : label}</span>
        <VisuallyHiddenInput type="file" onChange={onUpload} accept={formats} />
      </Button>
      {state && <IconButton className='rounded-0 px-2 border-start' onClick={onDelete} size='small'>
        <DeleteIcon sx={{ fontSize: '14px' }} /></IconButton>}
    </Box>
  )
}
