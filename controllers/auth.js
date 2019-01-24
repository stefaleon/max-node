exports.getLogin = (req, res, next) => {
  console.log('[authController](getLogin) req.session.isLoggedIn: ', req.session.isLoggedIn)
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.isLoggedIn
  });
};

exports.postLogin = (req, res, next) => {
    req.session.isLoggedIn = true;
    res.redirect('/');
  };
