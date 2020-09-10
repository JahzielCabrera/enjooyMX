const { Router } = require('express');
const router = Router();
const {isAuthenticated} = require('../helpers/validateAuth');

const {
    renderSucursalForm,
    createNewSucursal,
    renderPanelAdmin,
    renderEditSucursal,
    updateSucursal, 
    renderPromo, 
    createPromo
} = require('../controllers/sucursal.controller');

// new sucursal
router.get('/sucursal/new', isAuthenticated, renderSucursalForm);
router.post('/sucursal/new', isAuthenticated, createNewSucursal);

// edit sucursal
router.get('/sucursal/edit/:id', isAuthenticated, renderEditSucursal);
router.put('/sucursal/edit/:id', isAuthenticated, updateSucursal);

// panel admin 
router.get('/admin', isAuthenticated, renderPanelAdmin); 

// create Promo
router.get('/promo/new/:id', isAuthenticated, renderPromo);
router.post('/promo/new/:id', isAuthenticated, createPromo);

module.exports = router;

