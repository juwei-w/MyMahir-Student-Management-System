require( 'dotenv' ).config();
const express = require( 'express' );
const bcrypt = require( 'bcrypt' );
const router = express.Router();
const db = require( '../../database' );
const jwt = require( 'jsonwebtoken' );

// POST - Register
router.post( '/register', async (req, res) => {
    const data = { ...req.body, ...req.query };
    const { name, email, password } = data;
    const errors = [];

    // Validation Checks
    if ( !name || name.trim() === '' ) {
        errors.push( 'Name cannot be empty.' );
    }

    if ( !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email )) {
        errors.push( 'Please enter a valid email address and cannot be empty.' );
    }

    if ( !password || !/^.{8,}$/.test( password )) {
        errors.push( 'Password needs to be at least 8 characters.' );
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
        // Check If User Already Exists
        const [ existingUser ] = await db.query( 'SELECT * FROM students WHERE email = ?', [ email ]);
        if ( existingUser.length > 0 ) {
            return res.status( 409 ).json({ 
            success: false, 
            message: 'Email already registered.' 
        });
        }

    // Hash password
    const hashedPassword = await bcrypt.hash( password, 10 );
    // Insert new user
    const type = 'admin';
    const [ result ] = await db.query(
        'INSERT INTO students (name, email, hash_password, type) VALUES (?, ?, ?, ?)', 
        [ name, email, hashedPassword, type ]
    );

    // Success Response
    res.status( 201 ).json({
        success: true,
        message: 'User registered successfully.',
        data: {
        id: result.insertId,
        name,
        email,
        hashedPassword,
        type
        }
    });
    } catch ( err ) {
        console.error( err );
        res.status( 500 ).json({
        success: false,
        message: 'Registration failed.',
        error: err.message
        });
    }
});

// POST - Login
router.post( '/login', async (req, res) => {
    const data = { ...req.body, ...req.query };
    const { name, email, password } = data;
    const errors = [];

        // Validation Checks
        if ( !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email )) {
        errors.push( 'Please enter a valid email address and cannot be empty.' );
        }

        if ( !password || !/^.{8,}$/.test( password )) {
        errors.push( 'Password needs to be at least 8 characters.' );
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
        // Search User In Database
        const [ rows ] = await db.query(
        'SELECT * FROM students WHERE email = ? AND type = ?',
        [ email, 'admin' ]
        );

        if ( rows.length === 0 ) {
        return res.status( 401 ).json({
        success: false,
        message: 'Invalid email or password.'
        });
    }
    const admin = rows[ 0 ];
    const isMatch = await bcrypt.compare( password, admin.hash_password );

    if( !isMatch ) {
        return res.status( 401 ).json({
        success: false,
        message: 'Invalid email or password.'
        });
    }
    // Generate Token (Valid For 1 Hour)
    const token = jwt.sign(
        { id: admin.id, email: admin.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({
        success: true,
        message: 'Login successful.',
        token
    });
    } catch ( err ) {
        console.error( err );
        res.status( 500 ).json({
        success: false,
        message: 'Registration failed.',
        error: err.message
        });
    }
});


module.exports = router;