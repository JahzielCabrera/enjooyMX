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
    changeVisibility
} = require('../controllers/products.controller');

// New Product
router.get('/products/add', isAuthenticated, renderProductForm); //Send Form
router.post('/products/new-product', isAuthenticated, createNewProduct); //Save Changes

// All Products
router.get('/menu', isAuthenticated, renderMenu); 

// Edit Products
router.get('/products/edit/:id', isAuthenticated, renderEditForm); //Send Form
router.put('/products/edit/:id', isAuthenticated, updateProduct); //Save Changes
router.put('/products/visibility/:id', isAuthenticated, changeVisibility);

// Delete Products
router.delete('/products/delete/:id', isAuthenticated, deleteProduct);

module.exports = router;