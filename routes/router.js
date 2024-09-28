const express = require('express');
const router = express.Router();
const hardware = require('../controller/hardwareController.js');
router.get('/',hardware.index);
router.get('/index',hardware.index);
router.get('/shop',hardware.shop);
router.get('/shop',hardware.shop);
router.get('/shop_details',hardware.shop_details);
router.get('/shoping_cart',hardware.shoping_cart);
router.get('/check_out',hardware.check_out);
router.get('/blog_details',hardware.blog_details);
router.get('/blog',hardware.blog);
router.get('/contact',hardware.contact);
router.get('/cart',hardware.cart);
router.get('/login',hardware.login);
router.get('/pages',hardware.pages);

module.exports = router;