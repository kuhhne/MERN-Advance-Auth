const express = require('express');
const router = express.Router();
const {getPrivateData} = require('../controllers/private')
const { protect } = require('../middleware/auth')

// aca seteriamos las rutas privadas, que no todos tengan acceso 
// (admins, usuarios registrados, etc)
router.route('/').get(protect, getPrivateData);

module.exports = router