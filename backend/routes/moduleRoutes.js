const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/authMiddleware');
const adminAuth = require('../middleware/adminAuthMiddleware');
const modulesCtrl = require('../controllers/moduleController');

const router = express.Router();

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// GET /modules -> List all published modules.
router.get('/', modulesCtrl.listModules);

// POST /modules/:id/register -> Register the current user for a module.
router.post('/:id/register', auth, modulesCtrl.registerModule);

// DELETE /modules/:id/register -> Unregister the current user from a module.
router.delete('/:id/register', auth, modulesCtrl.unregisterModule);

// GET /modules/:slug -> Get one module by slug.
router.get('/:slug', modulesCtrl.getModuleBySlug);

// POST /modules -> Create a new module (admin portal only).
router.post('/', adminAuth, modulesCtrl.createModule);

// PUT /modules/:id -> Update an existing module (admin portal only).
router.put('/:id', adminAuth, modulesCtrl.updateModule);

// DELETE /modules/:id -> Delete a module (admin portal only).
router.delete('/:id', adminAuth, modulesCtrl.deleteModule);

module.exports = router;
