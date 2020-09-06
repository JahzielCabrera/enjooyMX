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

productsCtrl.updateProduct = async (req, res, next) => {
    let sucursalID = '';
    try {
        const { name, description, price, category } = req.body;
        const productUpdate = await Product.findOne({_id: req.params.id});
        sucursalID = productUpdate.sucursalId;
        productUpdate.name = name;
        productUpdate.description = description;
        productUpdate.price = price;
        productUpdate.category = category;
        productUpdate.save();
    } catch(err){
        console.log(err);
        next();
    }
    console.log(sucursalID);
    req.flash('success_msg', '¡Producto actualizado correctamente!');
    res.redirect('/menu/'+sucursalID);
};

productsCtrl.deleteProduct = async (req, res, next) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
    } catch(err){
        next();
    }
    req.flash('success_msg', '¡Producto eliminado!    ');
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
    const sucursalRender = await Sucursal.findById(req.params.id).lean();
    const userMenu = await User.findById(sucursalRender.userId).lean();
    const productsList = await Product.find({sucursalId: req.params.id, visible:true}).limit(userMenu.accountLimits.limitDishes).lean();
    const categoriesMenu = await Category.find({sucursalId: req.params.id}).lean();;
    console.log(userMenu);
    if(productsList.length == 0){
        res.send('Parece que la sucursal que buscas aún no tiene platillos registrados 🤔');
    } else{
        res.render('clientViewMenu', {layout: false, productsList, sucursalRender, userMenu, categoriesMenu});
    }
    
}

module.exports = productsCtrl; 