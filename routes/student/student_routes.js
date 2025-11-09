const express = require( 'express' );
const router = express.Router();
const db = require( '../../database' );

// Student List Page
router.get( '/', async (req, res) => {
  try {
    const [result] = await db.query('SELECT * FROM students');
    const students = result;

    res.render( 'students/students_view', {
      title: 'Student Management System',
      content: 'Manage and view details of the students.',
      students
    });
  } catch ( err ) {
    console.error( err );
  }
});

// Render Form Page
function renderFormPage( res, error = null, student = null ) {
  const isUpdate = !!student;
  res.render( 'students/student_form', {
    title: isUpdate ? 'Update Student' : 'Add New Student',
    content: isUpdate
      ? 'Update the details of this student.'
      : 'Fill in the details to add a new student.',
    error,
    student,
    formAction: isUpdate ? `/students/update/${ student.id }?_method=PUT` : '/students/add'
  });
}

// Add Student Form
router.get( '/add', (req, res) => renderFormPage( res ));

// Student Details
router.get( '/:id', async (req, res) => {
  try {
    const [ result ] = await db.query( 'SELECT * FROM students WHERE id = ?', [ req.params.id ]);
    const student = result[0];

    if ( !student ) {
      return res.status( 404 ).send( 'Student not found' );
    }

    res.render( 'students/student_details', {
      title: 'Student Details',
      content: 'View detailed information about this student.', 
      student
    });
  } catch( err ) {
    console.error( err );
    res.status( 500 ).send( 'Database error' );
  }
});

// Handle Add Student
router.post( '/add', async (req, res) => {
  const { name, studentNo, email, phone } = req.body;
  const type = 'student';

  // Validation
  if ( !name || name.trim() === '') {
    return renderFormPage( res, 'Name cannot be empty.' );
  }

  if ( !studentNo || !/^\d+$/.test( studentNo )) {
    return renderFormPage( res, 'Student number must contain numbers only and cannot be empty.' );
  }

  if ( !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email )) {
    return renderFormPage( res, 'Please enter a valid email address and cannot be empty.');
  }

  if ( !phone || !/^\d+$/.test( phone )) {
    return renderFormPage( res, 'Phone number must contain numbers only and cannot be empty.' );
  }

  try {
    // Insert New Student Into Database
    await db.query( 'INSERT INTO students (name, student_number, email, phone, type) VALUES (?, ?, ?, ?, ?)', [ name, studentNo, email, phone, type ]);

    // Redirect Back
    res.redirect( '/students' );
  } catch ( err ) {
    console.error( err );
    renderFormPage( res, 'Database error. Failed to add student.' );
  }
});

// Update Student Form
router.get( '/update/:id', async (req, res) => {
  try {
    const [ rows ] = await db.query( 'SELECT * FROM students WHERE id = ?', [ req.params.id ]);

    if ( rows.length === 0 ) {
      return res.status( 404 ).send('Student not found');
    }

    const student = rows[ 0 ];
    renderFormPage( res, null, student );
  } catch ( err ) {
    console.error( err );
    res.status( 500 ).send( 'Database query failed' );
  }
});

// Handle Update Student
router.put( '/update/:id', async (req, res) => {
  const { name, studentNo, email, phone } = req.body;
  const studentId = req.params.id;

  // Validation
  if ( !name || name.trim() === '' ) {
    return renderFormPage( res, 'Name cannot be empty.', student );
  }

  if ( !studentNo || !/^\d+$/.test( studentNo )) {
    return renderFormPage( res, 'Student number must contain numbers only and cannot be empty.', student );
  }

  if ( !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email )) {
    return renderFormPage( res, 'Please enter a valid email address and cannot be empty.', student );
  }

  if ( !phone || !/^\d+$/.test( phone )) {
    return renderFormPage( res, 'Phone number must contain numbers only and cannot be empty.', student );
  }

  try {
    // Update Student In Database
    const [ result ] = await db.query(
      'UPDATE students SET name = ?, student_number = ?, email = ?, phone = ? WHERE id = ?',
      [ name, studentNo, email, phone, studentId ]
    );

    if ( result.affectedRows === 0 ) {
      return res.status( 404 ).send( 'Student not found' );
    }

    res.redirect( '/students' );
  } catch ( err ) {
    console.error( err );
    renderFormPage( res, 'Database error. Failed to update student.' );
  }
});

// Handle Delete Contact
router.delete( '/delete/:id', async (req, res) => {
  try {
    const studentId = req.params.id;

    // Delete From Database
    const [ result ] = await db.query( 'DELETE FROM students WHERE id = ?', [ studentId ]);

    if ( result.affectedRows === 0 ) {
      return res.status( 404 ).send( 'Student not found' );
    }

    // Redirect Back
    res.redirect( '/students' );
  } catch ( err ) {
    console.error( err );
    res.status( 500 ).send( 'Database error. Failed to delete contact.' );
  }
});


module.exports = router;
