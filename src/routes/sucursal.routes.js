const { Router } = require('express');
const router = Router();
const {isAuthenticated} = require('../helpers/validateAuth');

const {
    renderSucursalForm,
    createNewSucursal,
    renderPanelAdmin,
    renderEditSucursal,
    updateSucursal
} = require('../controllers/sucursal.controller');

// new sucursal
router.get('/sucursal/new', isAuthenticated, renderSucursalForm);
router.post('/sucursal/new', isAuthenticated, createNewSucursal);

// edit sucursal
router.get('/sucursal/edit/:id', isAuthenticated, renderEditSucursal);
router.put('/sucursal/edit/:id', isAuthenticated, updateSucursal);

// panel admin 
router.get('/admin', isAuthenticated, renderPanelAdmin); 

module.exports = router;

