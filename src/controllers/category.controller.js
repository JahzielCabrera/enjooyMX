const categoryCtrl = {};
const Category = require('../models/Category');
const Product = require('../models/Product');
const Sucursal = require('../models/Sucursal');
const cloudinary = require('cloudinary');
const fs = require('fs-extra');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

categoryCtrl.renderNewCategory = async (req, res) => {
    const id = req.params.id;
    const sucursal = await Sucursal.findById(id);
    console.log(sucursal);
    if(req.user.id != sucursal.userId) {
        req.flash('error_msg', 'No autorizado');
        res.redirect('/menu/'+id);
    } else {
        res.render('category/newCategory', {id});
    }
};

categoryCtrl.createNewCategory = async (req, res, next) => {
    const {name} = req.body;
    const verifyCategory = await Category.findOne({sucursalId: req.params.id, name: name});
    if(verifyCategory){
        req.flash('error_msg', 'Ya existe una categoría con ese nombre');
        res.redirect('/menu/'+req.params.id);
    } else {
        const uploadCloudinary = await cloudinary.v2.uploader.upload(req.files.image[0].path, {width: 600}, function(error, result) {console.log(result, error); });
        const newCategory = new Category({name});
        newCategory.sucursalId = req.params.id;
        newCategory.img = uploadCloudinary.secure_url;
        newCategory.cloudinary_publicId = uploadCloudinary.public_id;
        newCategory.userId = req.user.id;
        newCategory.categoryName = name.toLowerCase().split(" ").join("");
        console.log(newCategory);
        await newCategory.save();
        await fs.unlink(req.files.image[0].path);
        req.flash('success_msg', '¡Categoría creada correctamente!');
        res.redirect('/menu/'+req.params.id);
    }
};

categoryCtrl.renderEditCategory = async (req, res) => {
    const category = await Category.findOne({_id: req.params.id}).lean();
    res.render('category/editCategory', {category});
};

categoryCtrl.updateCategory = async (req, res) => {
    const { name } = req.body;
    const categoryUpdate = await Category.findOne({_id: req.params.id});
    await Product.updateMany({category: categoryUpdate.categoryName}, {category: name.toLowerCase().split(" ").join("")});
    categoryUpdate.name = name;
    categoryUpdate.categoryName = name.toLowerCase().split(" ").join("");

    if(req.files.length != undefined){
        await cloudinary.v2.uploader.destroy(categoryUpdate.cloudinary_publicId);
        const uploadCloudinary = await cloudinary.v2.uploader.upload(req.files.image[0].path, {width: 600}, function(error, result) {console.log(result, error); });
        categoryUpdate.img = uploadCloudinary.secure_url;
        categoryUpdate.cloudinary_publicId = uploadCloudinary.public_id;
        await categoryUpdate.save();
        await fs.unlink(req.files.image[0].path);
        req.flash('success_msg', '¡Categoría actualizada correctamente!');
        res.redirect('/menu/'+categoryUpdate.sucursalId);

    } else {

        await categoryUpdate.save();
        req.flash('success_msg', '¡Categoría actualizada correctamente!');
        res.redirect('/menu/'+categoryUpdate.sucursalId);
    }
};

categoryCtrl.deleteCategory = async (req, res, next) => {
    const category = await Category.findOne({_id: req.params.id}).lean();
    const products = await Product.findOne({category: category.categoryName});
    await cloudinary.v2.uploader.destroy(category.cloudinary_publicId);
    if(products){
        await Product.deleteMany({category: category.categoryName});
        await Category.findByIdAndDelete(category._id);
    } else{
        await Category.findByIdAndDelete(req.params.id);
    }
    
    req.flash('alert_success', 'Categoría eliminada correctamente');
    res.redirect('back');
}

module.exports = categoryCtrl; 