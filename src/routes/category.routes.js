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
router.put('/category/edit/:id', isAuthenticated, updateCategory);

// Delete category
router.delete('/category/delete/:id', isAuthenticated, deleteCategory);

module.exports = router;  