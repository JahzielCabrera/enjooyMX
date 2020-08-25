const productsCtrl = {};
const Product  = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const Sucursal = require('../models/Sucursal');

productsCtrl.renderProductForm = async (req, res) => {
    const id = req.params.id;
    const categories = await Category.find({sucursalId: id}).lean();
    res.render('products/newProduct', {categories, id});
}; 

productsCtrl.createNewProduct = async (req, res, next) => {
    try{
        const { name, description, price, category } = req.body;
        const sucursal = req.params.id;
        const newProduct = new Product({name, description, price, category});
        newProduct.userId = req.user.id;
        newProduct.restaurantName = req.user.restaurantName;
        newProduct.sucursalId = sucursal;
        await newProduct.save();
    } catch(err){
        next(); 
    } 
    reqDiv = req.path.split("/");
    req.flash('success_msg', '¡Producto agregado correctamente!');
    res.redirect('/menu/'+reqDiv[reqDiv.length-1]); 
};
  

productsCtrl.renderMenu = async (req, res) => {
    const sucursalId = req.params.id;
    const user = await User.findById(req.user.id).lean();
    const menu = await Product.find({sucursalId: sucursalId}).lean();
    const categories = await Category.find({sucursalId: sucursalId}).lean();
    const sucursal = await Sucursal.findById(sucursalId).lean();
    console.log(menu);
    res.render('products/menu', { user, sucursal, categories, menu });
};

productsCtrl.renderEditForm = async (req, res, next) => {
    try{
        const product = await Product.findById(req.params.id).lean();
        if(product.userId != req.user.id){
            return res.redirect('/');
        }
        res.render('products/editProduct', { product });
    } catch(err){
        next();
    }
    
};

productsCtrl.updateProduct = async (req, res, next) => {
    try {
        const { name, description, price, category } = req.body;
        await Product.findByIdAndUpdate(req.params.id, {name, price, description, price, category});
        //const sucursalId = await Product.findById(req.params.id).lean();
    } catch(err){
        next();
    }
    req.flash('success_msg', '¡Producto actualizado correctamente!');
    res.redirect('/admin');
    
};

productsCtrl.deleteProduct = async (req, res, next) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
    } catch(err){
        next();
    }
    req.flash('success_msg', '¡Producto eliminado!                   ');
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

module.exports = productsCtrl;