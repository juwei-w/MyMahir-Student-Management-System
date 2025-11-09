const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// ===========================================
// 1. MIDDLEWARE SETUP (Order matters!)
// ===========================================

// Serve static files FIRST
app.use(express.static('public'));

// Body parsing middleware for JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Method Override Middleware
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Set EJS as templating engine BEFORE routes
app.engine('ejs', require('ejs').__express);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Student Route
const studentRoutes = require( './routes/student/student_routes' );
app.use( '/students', studentRoutes );

// API Student Route (Postman testing)
const studentApiRoutes = require( './routes/api/student_api_routes' );
app.use( '/api/students', studentApiRoutes );

// Auth API Route
const authApiRoutes = require( './routes/api/auth_api_routes' );
app.use( '/api/auth', authApiRoutes );

// CORS Middleware
const cors = require('cors'); 
const corsOptions = { 
  origin: ['http://localhost:3000', 'https://yourfrontenddomain.com'], // Allowed origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
  credentials: true, // Allow sending cookies/authorization headers
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed request headers
};
app.use(cors(corsOptions));

// ===========================================
// 2. ROUTES (After all middleware)
// ===========================================

// Home route
app.get('/', (req, res) => {
  res.send('Hello Express!');
});

// Blog routes
const blogRoutes = require('./routes/blogRoutes');
app.use('/posts', blogRoutes);

// Contact routes
const contactRoutes = require('./routes/contact/contact_routes');
app.use('/contacts', contactRoutes);

// ===========================================
// 3. Requests
// ===========================================

// GET request
app.get( '/about', (req, res) => {
    res.send( 'About Us Page' );
});

// POST request
app.post( '/user', (req, res) => {
    const name = req.query.name;
    res.status( 201 ).send( `Hello ${ name }` );
});


// PUT request
app.put( '/update', (req, res) => {
    const email = req.query.email;
    res.send( `The email has been updated to ${ email }` );
});


// DELETE request
app.delete( '/item/:id', (req, res) => {
    const id = req.params.id;
    res.send( `The item with id ${ id } has been successfully deleted.` );
});


// Route with URL parameter
app.get( '/posts/:id', (req, res) => {
  const { id } = req.params;
  res.send( `Post ID: ${ id }` );
});


// Route with query parameters
app.get( '/search', (req, res) => {
  const { q, page } = req.query;
  res.send( `Search: ${ q } ( page ${ page || 1 })` );
});


// Dynamic content rendering
const posts = [
  { id:1, title:'Hello' },
  { id:2, title:'Express Tips' }
];

// Route 1: Shows the blog list (uses index.ejs)
app.get( '/posting', (req, res) => {
  res.render( 'index', { title: 'My Blog', posts });
});

// Route 2: Shows individual post (uses post.ejs)
app.get( '/posting/:id', (req, res) => {
  const post = posts.find( p => p.id === Number( req.params.id ));
  if (!post) return res.status(404).send( 'Post not found' );
  res.render( 'post', { post });
});



app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
