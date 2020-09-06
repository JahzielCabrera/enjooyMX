const { Router } = require('express');
const router = Router();
const {isAuthenticated} = require('../helpers/validateAuth');

const {  
    renderProductForm, 
    createNewProduct, 
    renderMenu, 
    renderEditForm,   
    deleteProduct, 
    updateProduct,
    changeVisibility,
    renderClientView } = require('../controllers/products.controller');

// New Product
router.get('/products/add/:id', isAuthenticated, renderProductForm); //Send Form
router.post('/products/new-product/:id', isAuthenticated, createNewProduct); //Save Changes

// All Products 
router.get('/menu/:id', isAuthenticated, renderMenu); 

// Edit Products 
router.get('/products/edit/:id', isAuthenticated, renderEditForm); //Send Form
router.put('/products/edit/:id', isAuthenticated, updateProduct); //Save Changes
router.put('/products/visibility/:id', isAuthenticated, changeVisibility);

// Delete Products
router.delete('/products/delete/:id', isAuthenticated, deleteProduct);

// Render view client menu
router.get('/menu/:restaurantName/:id', renderClientView);

module.exports = router; 