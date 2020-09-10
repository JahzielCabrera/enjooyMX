const sucursalCtrl = {};
const Sucursal = require('../models/Sucursal');
const cloudinary = require('cloudinary');
const fs = require('fs-extra');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

sucursalCtrl.renderSucursalForm = (req, res) => {
    res.render('sucursal/newSucursal');
};

sucursalCtrl.createNewSucursal = async (req, res, next) => {
    try{
        console.log(req.user);
        const {name, adress, suburb, city, state} = req.body;
        const newSucursal = new Sucursal({name});
        newSucursal.location.adress = adress;
        newSucursal.location.suburb = suburb;
        newSucursal.location.city = city;
        newSucursal.location.state = state;
        newSucursal.userId = req.user.id;
        newSucursal.restaurantName = req.user.restaurantName;
        console.log(newSucursal);
        await newSucursal.save();
    } catch(err){
        next();
    }

    req.flash('success_msg', 'Sucursal creada correctamente');
    res.redirect('/admin');
};

sucursalCtrl.renderPanelAdmin = async (req, res) => {
    const sucursales = await Sucursal.find({userId: req.user.id}).lean();
    res.render('admin', {sucursales});
};

sucursalCtrl.renderEditSucursal = async (req, res, next) => {
    try{
        console.log(req.params.id);
        const sucursal = await Sucursal.findById(req.params.id).lean();
        if(sucursal.userId != req.user.id){
            res.redirect('/');
        }
        console.log(sucursal);
        res.render('sucursal/editSucursal', { sucursal });
    } catch(err){
        next();
    }
};

sucursalCtrl.updateSucursal = async (req, res, next) => {
    try{
        const {name, adress, suburb, city, state} = req.body;
        await Sucursal.findByIdAndUpdate(req.params.id, {name, location:{adress, suburb, city, state} });
    } catch(err){
        next();
    }
    req.flash('success_msg', '¡Sucursal actualizada correctamente!');
    res.redirect('/admin');
};

sucursalCtrl.renderPromo = async (req, res) => {
    const sucursal = await Sucursal.findById(req.params.id);
    res.render('sucursal/newPromo', sucursal);
}

sucursalCtrl.createPromo = async (req, res) => {
    const {title, description, date} = req.body;
    const sucursalPromo = await Sucursal.findById(req.params.id);
    if(sucursalPromo.promo.cloudinary_publicId){
        await cloudinary.v2.uploader.destroy(sucursalPromo.promo.cloudinary_publicId);
    }
    sucursalPromo.promo.title = title;
    sucursalPromo.promo.description = description;
    sucursalPromo.promo.endDate = new Date(date).getTime() + 21600000;
    const uploadCloudinary = await cloudinary.v2.uploader.upload(req.files.image[0].path, {width: 800}, function(error, result) {console.log(result, error); });
    sucursalPromo.promo.img = uploadCloudinary.secure_url;
    sucursalPromo.promo.cloudinary_publicId = uploadCloudinary.public_id;
    sucursalPromo.save();
    await fs.unlink(req.files.image[0].path);
    req.flash('success_msg', 'Promoción creada con éxito');
    res.redirect('/menu/'+req.params.id);
}

module.exports = sucursalCtrl; 
