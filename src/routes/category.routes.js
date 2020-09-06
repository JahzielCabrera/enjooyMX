const { Router } = require('express');
const router = Router();
const {isAuthenticated} = require('../helpers/validateAuth');

const {
    renderNewCategory,
    createNewCategory, 
    renderEditCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/category.controller');

// New category
router.get('/category/new/:id', isAuthenticated, renderNewCategory);
router.post('/category/new/:id', isAuthenticated, createNewCategory);

// Edit category
router.get('/category/edit/:id', isAuthenticated, renderEditCategory);
router.post('/category/edit/:id', isAuthenticated, updateCategory);

// Delete category
router.delete('/category/detele', isAuthenticated, deleteCategory);

module.exports = router;  