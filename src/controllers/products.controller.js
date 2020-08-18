const productsCtrl = {};
const Product  = require('../models/Product');

productsCtrl.renderProductForm = (req, res) => {
    res.render('products/newProduct');
};

productsCtrl.createNewProduct = async (req, res, next) => {
    try{
        const { name, description, price, category } = req.body;
        const newProduct = new Product({name, description, price, category});
        newProduct.userId = req.user.id;
        await newProduct.save();
    } catch(err){
        next();
    }
    console.log(req.user);
    req.flash('success_msg', '¡Producto agregado correctamente!   ');
    res.redirect('/menu');
};
  

productsCtrl.renderMenu = async (req, res) => {
    const menu = await Product.find({userId: req.user.id}).lean();
    res.render('products/menu', { menu });
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
    } catch(err){
        next();
    }
    req.flash('success_msg', '¡Producto actualizado correctamente!  ');
    res.redirect('/menu');
};

productsCtrl.deleteProduct = async (req, res, next) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
    } catch(err){
        next();
    }
    req.flash('success_msg', '¡Producto eliminado!                   ');
    res.redirect('/menu');
    
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
    res.redirect('/menu');
    
}

module.exports = productsCtrl;