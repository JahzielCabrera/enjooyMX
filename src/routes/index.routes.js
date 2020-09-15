const { Router } = require("express");
const router = Router();

const { renderIndex, sendEmailContact, renderTest} = require('../controllers/index.controller')

router.get('/', renderIndex);

router.post('/contact', sendEmailContact);


router.get('/tests', renderTest);

module.exports = router;