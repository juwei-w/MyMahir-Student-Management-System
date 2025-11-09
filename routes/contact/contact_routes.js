const express = require( 'express' );
const router = express.Router();

// Contact List Dynamic Rendering
const contacts = [
  { id:1, name:'Khairul Adnan', phone: '01123346677' },
  { id:2, name:'Siti Huda', phone: '0139974545' },
  { id:3, name:'Liau Kai Ze', phone: '0162703913' }
];

// Contact List Page
router.get( '/', (req, res) => {
  res.render( 'contacts/contacts', {
    title: 'My Contacts',
    content: 'Manage and view details of the saved contacts.',
    contacts 
  });
});


// Render Form Page
function renderFormPage( res, error = null, contact = null ) {
  const isUpdate = !!contact;
  res.render( 'contacts/contact_form', {
    title: isUpdate ? 'Update Contact' : 'Add New Contact',
    content: isUpdate
      ? 'Update the details of this contact.'
      : 'Fill in the details to add a new contact.',
    error,
    contact,
    formAction: isUpdate ? `/contacts/update/${ contact.id }?_method=PUT` : '/contacts/add'
  });
}


// Add Contact Form
router.get( '/add', (req, res) => renderFormPage( res ));

// Handle Add Contact
router.post( '/add', (req, res) => {
  const { name, phone } = req.body;

  // Validation
  if ( !name || name.trim() === '') {
    return renderFormPage( res, 'Name cannot be empty.' );
  }

  if ( !phone || !/^\d+$/.test( phone )) {
    return renderFormPage( res, 'Phone number must contain numbers only and cannot be empty.' );
  }

  // Add New Contact And Redirect Back
  const newContact = {
    id: contacts.length + 1,
    name,
    phone
  };
  contacts.push( newContact );
  res.redirect( '/contacts' );
});

// Contact Details
router.get( '/:id', (req, res) => {
  const contact = contacts.find( c => c.id == req.params.id );

  if ( !contact ) {
    return res.status( 404 ).send( 'Contact not found' );
  }

  res.render( 'contacts/contact_details', {
    title: 'Contact Details',
    content: 'View detailed information about this contact.', 
    contact
  });
});

// Update Contact Form
router.get( '/update/:id', (req, res) => {
  const contact = contacts.find( c => c.id == req.params.id );
  if ( !contact ) return res.status( 404 ).send( 'Contact not found' );
  renderFormPage( res, null, contact );
});

// Handle Update Contact
router.put( '/update/:id', (req, res) => {
  const { name, phone } = req.body;
  const contact = contacts.find( c => c.id == req.params.id );
  if ( !contact ) return res.status( 404 ).send( 'Contact not found' );

  // Validation
  if ( !name || name.trim() === '' ) {
    return renderFormPage( res, 'Name cannot be empty.', contact );
  }
  if ( !phone || !/^\d+$/.test( phone )) {
    return renderFormPage( res, 'Phone number must contain numbers only and cannot be empty.', contact );
  }

  // Update Values And Redirect Back
  contact.name = name;
  contact.phone = phone;
  res.redirect( '/contacts' );
});

// Handle Delete Contact
router.post( '/delete/:id', (req, res) => {
  const id = parseInt( req.params.id );
  const index = contacts.findIndex( c => c.id === id );

  if (index === -1) {
    return res.status( 404 ).send( 'Contact not found' );
  }

   // Remove From Array And Redirect Back
  contacts.splice( index, 1 );
  res.redirect( '/contacts' );
});

module.exports = router;
