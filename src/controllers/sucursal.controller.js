const sucursalCtrl = {};
const Sucursal = require('../models/Sucursal');

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

module.exports = sucursalCtrl; 
