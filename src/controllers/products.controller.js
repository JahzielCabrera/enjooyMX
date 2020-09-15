const productsCtrl = {};
const Product  = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Sucursal = require('../models/Sucursal');
const cloudinary = require('cloudinary');
const fs = require('fs-extra');
const { isUndefined } = require('util');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
 
productsCtrl.renderProductForm = async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    const productsCount = await Product.find({userId: req.user.id}).countDocuments();
    if(user.accountLimits.limitDishes <= productsCount){
        req.flash('limit_alert', 'Tu cuenta tiene limites');
        res.redirect('/menu/'+id);
    } else {
        const categories = await Category.find({sucursalId: id}).lean();
        res.render('products/newProduct', {categories, id});
    }
}; 

productsCtrl.createNewProduct = async (req, res, next) => {
    const { name, description, price, category } = req.body;
    const sucursal = req.params.id;
    const newProduct = new Product({name, description, price, category});
    newProduct.userId = req.user.id;
    newProduct.restaurantName = req.user.restaurantName;
    newProduct.sucursalId = sucursal;
    if(req.files.length != undefined){
        const uploadCloudinary = await cloudinary.v2.uploader.upload(req.files.image[0].path, {width: 300}, function(error, result) {console.log(result, error); });
        newProduct.imageUrl = uploadCloudinary.secure_url;
        newProduct.cloudinary_public_id = uploadCloudinary.public_id;
        await newProduct.save();
        await fs.unlink(req.files.image[0].path);
        req.flash('success_msg', '¡Producto agregado correctamente!');
        res.redirect('/menu/'+sucursal);     
    } else {
        await newProduct.save();
        req.flash('success_msg', '¡Producto agregado correctamente!');
        res.redirect('/menu/'+sucursal); 
    }
};
   

productsCtrl.renderMenu = async (req, res) => {
    const sucursalId = req.params.id;
    const userMenu = await User.findById(req.user.id).lean();
    const menu = await Product.find({sucursalId: sucursalId}).lean();
    const categories = await Category.find({sucursalId: sucursalId}).lean();
    const sucursal = await Sucursal.findById(sucursalId).lean();
    if(!sucursal){
        res.redirect('/admin');
    } else{
        res.render('products/menu', { userMenu, sucursal, categories, menu });
    }
};

productsCtrl.renderEditForm = async (req, res, next) => {
    try{
        const product = await Product.findById(req.params.id).lean();
        const sucursalID = product.sucursalId;
        const categories = await Category.find({sucursalId: sucursalID}).lean();
        if(product.userId != req.user.id){
            return res.redirect('/');
        }
        res.render('products/editProduct', { product, categories });
    } catch(err){
        next();
    }
    
}; 

productsCtrl.updateProduct = async (req, res) => {
    const { name, description, price, category } = req.body;
    const productUpdate = await Product.findOne({_id: req.params.id});
    sucursalID = productUpdate.sucursalId;
    productUpdate.name = name;
    productUpdate.description = description;
    productUpdate.price = price;
    productUpdate.category = category;
     
    if(req.files.length != undefined){
        await cloudinary.v2.uploader.destroy(productUpdate.cloudinary_public_id);
        const uploadCloudinary = await cloudinary.v2.uploader.upload(req.files.image[0].path, {width: 300}, function(error, result) {console.log(result, error); });
        productUpdate.imageUrl = uploadCloudinary.secure_url;
        productUpdate.cloudinary_public_id = uploadCloudinary.public_id;
        productUpdate.save();
        await fs.unlink(req.files.image[0].path);
        req.flash('success_msg', '¡Producto actualizado correctamente!');
        res.redirect('/menu/'+sucursalID);
    } else {
        productUpdate.save();
        req.flash('success_msg', '¡Producto actualizado correctamente!');
        res.redirect('/menu/'+sucursalID);
    }
};

productsCtrl.deleteProduct = async (req, res) => {
    const productDelete = await Product.findById(req.params.id);
    if(productDelete.cloudinary_public_id){
        await cloudinary.v2.uploader.destroy(productDelete.cloudinary_public_id);
    }
    await Product.findByIdAndDelete(req.params.id);
  
    req.flash('success_msg', '¡Producto eliminado correctamente!    ');
    res.redirect('back');
    
};

productsCtrl.changeVisibility = async (req, res, next) => {
    try{
        const product = await Product.findById(req.params.id);
        if(product.visible==true){
            var visible = false;
            await Product.findByIdAndUpdate(req.params.id, {visible});
        }
        else{
            var visible = true;
            await Product.findByIdAndUpdate(req.params.id, {visible});
        }
    } catch(err){
        console.log(err);
        next();
    }
    res.redirect('back');
    
}

productsCtrl.renderClientView = async (req, res) => {
    console.log(req.params.restaurantName);
    console.log(req.params.id);
    // Verify Promo End Date 
    const sucursalPromo = await Sucursal.findOne({_id: req.params.id});
    if(sucursalPromo.promo.endDate <= Date.now()){
        await cloudinary.v2.uploader.destroy(sucursalPromo.promo.cloudinary_publicId);
        sucursalPromo.promo = null;
        await sucursalPromo.save();
    }
    const sucursalRender = await Sucursal.findById(req.params.id).lean();
    const userMenu = await User.findById(sucursalRender.userId).lean();
    const productsList = await Product.find({sucursalId: req.params.id, visible:true}).limit(userMenu.accountLimits.limitDishes).lean();
    const categoriesMenu = await Category.find({sucursalId: req.params.id}).lean();;
    if(productsList.length == 0){
        res.send('Parece que la sucursal que buscas aún no tiene platillos registrados 🤔');
    } else{
        res.render('clientViewMenu', {layout: false, productsList, sucursalRender, userMenu, categoriesMenu});
    }
    
}

module.exports = productsCtrl; 