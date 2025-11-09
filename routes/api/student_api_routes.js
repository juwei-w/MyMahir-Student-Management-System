const express = require( 'express' );
const router = express.Router();
const db = require( '../../database' );
const jwt = require( 'jsonwebtoken' );

// Middleware to verify JWT Token
function verifyToken(req, res, next) {
  const authHeader = req.headers[ 'authorization' ];
  const token = authHeader && authHeader.split(' ')[ 1 ];

  if ( !token ) return res.status( 401 ).json({
    success: false,
    message: 'Access denied. No token provided.'
  });

  jwt.verify( token, process.env.JWT_SECRET, (err, user) => {
    if ( err ) return res.status( 403 ).json({
      success: false,
      message: 'Invalid token.'
    });
        
    req.user = user;
    next();
  });
}

router.get( '/', async ( req, res ) => {
  try {
    const [ rows ] = await db.query( 
        'SELECT id, name, student_number, email, phone FROM students' 
    );
    res.json({
        success: true,
        message: 'Student list retrieved successfully',
        data: rows
    });
  } catch ( err ) {
    console.error( err );
    res.status( 500 ).json({ error: 'Database error' });
    error: err.message
  } 
});

// GET - Student Details By ID
router.get( '/:id', async (req, res) => {
  try {
    const [ rows ] = await db.query( 'SELECT id, name, student_number, email, phone FROM students WHERE id = ?', [ req.params.id ]);

    // Error - Not Found
    if ( rows.length === 0 ) {
      return res.status( 404 ).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Success Response
    res.json({
      success: true,
      message: 'Student details retrieved successfully.',
      data: rows[ 0 ]
    });
  } catch( err ) {
    console.error( err );
    res.status( 500 ).json({
      success: false,
      message: 'Students details retrieved failed.',
      error: err.message
    });
  }
});

// POST - Add New Student
router.post("/add", verifyToken, async (req, res) => {
  const data = { ...req.body, ...req.query };
  const { name, student_number, email, phone } = data;
  const errors = [];
  const type = 'student';

  if (!name || name.trim() === "") {
    errors.push("Name cannot be empty");
  }

  if (!student_number || !/^\d+$/.test(student_number)) {
    errors.push("Student number must contain numbers only and cannot be empty");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Please enter a valid email address");
  }

  if (!phone || !/^\d+$/.test(phone)) {
    errors.push("Phone number must contain numbers only and cannot be empty");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors,
    });
  }

  try {
    const [result] = await db.query(
      "INSERT INTO students (name, student_number, email, phone, type) VALUES (?, ?, ?, ?, ?)",
      [name, student_number, email, phone, type]
    );

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      data: {
        id: result.insertId,
        name,
        student_number,
        email,
        phone,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to add student",
      error: err.message,
    });
  }
});

// PUT - Update Student By ID
router.put( '/update/:id', verifyToken, async (req, res) => {
  const data = { ...req.body, ...req.query };
  const { name, student_number, email, phone } = data;
  const errors = []; 

  // Validation Checks
  if ( !name || name.trim() === '' ) {
    errors.push( 'Name cannot be empty.' );
  }

  if ( !student_number || !/^\d+$/.test( student_number )) {
    errors.push( 'Student number must contain numbers only and cannot be empty.' );
  }

  if ( !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email )) {
    errors.push( 'Please enter a valid email address and cannot be empty.' );
  }

  if ( !phone || !/^\d+$/.test( phone )) {
    errors.push( 'Phone number must contain numbers only and cannot be empty.' );
  }
  // Validation Failed
  if ( errors.length > 0 ) {
    return res.status( 400 ).json({
      success: false,
      message: 'Validation failed.',
      errors
    });
  }

  try {
    // Update Student In Database
    const [ result ] = await db.query(
      'UPDATE students SET name = ?, student_number = ?, email = ?, phone = ? WHERE id = ?',
      [ name, student_number, email, phone, req.params.id ]
    );

    // Error - Not Found
    if ( result.affectedRows === 0 ) {
      return res.status( 404 ).json({
        success: false,
        message: 'Student not found'
      });
    }
    // Success Response
    res.status( 200 ).json({
      success: true,
      message: 'Student updated successfully',
    });
  } catch ( err ) {
    console.error( err );
    res.status( 500 ).json({
      success: false,
      message: 'Database error. Failed to update student.',
      error: err.message
    });
  }
});

// DELETE - Delete Student By ID
router.delete( '/delete/:id', verifyToken, async (req, res) => {
  try {
    const studentId = req.params.id;

    // Delete Student From Database
    const [ result ] = await db.query( 'DELETE FROM students WHERE id = ?', [ studentId ]);

    // Error - Not Found
    if ( result.affectedRows === 0 ) {
      return res.status( 404 ).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Success Response
    res.status( 200 ).json({
      success: true,
      message: 'Student deleted successfully',
      data: { id: studentId }
    });
  } catch ( err ) {
    console.error( err );
    res.status( 500 ).json({
      success: false,
      message: 'Database error. Failed to delete student.'
    });
  }
});


module.exports = router;