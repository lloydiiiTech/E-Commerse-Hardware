const hardware ={
    index:(req,res)=>{
        res.render('index');
    },
    shop:(req,res)=>{
        res.render('shop');
    },
    shop_details:(req,res)=>{
        res.render('shop_details');
    },
    shoping_cart:(req,res)=>{
        res.render('shoping_cart');
    },
    check_out:(req,res)=>{
        res.render('check_out');
    },
    blog_details:(req,res)=>{
        res.render('blog_details');
    },
    blog:(req,res)=>{
        res.render('blog');
    },
    contact:(req,res)=>{
        res.render('contact');
    },
    cart:(req,res)=>{
        res.render('cart');
    },
    login:(req,res)=>{
        res.render('login');
    },
    pages:(req,res)=>{
        res.render('pages');
    }
}

module.exports = hardware;