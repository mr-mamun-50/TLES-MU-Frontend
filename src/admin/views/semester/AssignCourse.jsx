import React, { useState } from 'react'

export default function AssignCourse() {

  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')


  return (
    <div className="card my-2">
      <div className='card-header d-flex justify-content-between align-items-center'>
        <h5 className='mt-2 mb-0'>Assign Courses</h5>
      </div>

      <div className="card-body">

      </div>
    </div>
  )
}
