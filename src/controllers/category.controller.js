const categoryCtrl = {};
const Category = require('../models/Category');

categoryCtrl.renderNewCategory = (req, res) => {
    const id = req.params.id;
    res.render('category/newCategory', {id});
};

categoryCtrl.createNewCategory = async (req, res, next) => {
    try{
        const {name} = req.body;
        const newCategory = new Category({name});
        newCategory.sucursalId = req.params.id;
        console.log(req.params.id);
        newCategory.userId = req.user.id;
        newCategory.categoryName = name.toLowerCase().split(" ").join("");
        console.log(newCategory);
        await newCategory.save();
    } catch(err){
        next();
    }
    reqDiv = req.path.split("/");
    req.flash('success_msg', '¡Categoría creada correctamente!');
    res.redirect('/menu/'+reqDiv[reqDiv.length -1]);
};

categoryCtrl.renderEditCategory = (req, res) => {
    res.render('category/editCategory');
};

categoryCtrl.updateCategory = (req, res) => {
    res.send('Category was updated'); 
};

module.exports = categoryCtrl; 