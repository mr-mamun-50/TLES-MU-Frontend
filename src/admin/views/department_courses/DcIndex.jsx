import Departments from './Departments'
import Courses from './Courses'

export default function DcIndex() {
  return (
    <div className="container">
      <div className='row my-2'>
        <div className='col-lg-5'>
          <Departments />
        </div>
        <div className='col-lg-7 mt-4 mt-lg-0'>
          <Courses />
        </div>
      </div>
    </div>
  )
}
