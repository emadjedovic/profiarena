const showHome = (req, res) => {
  const userName = res.locals.currentUser ? res.locals.currentUser.firstName : 'Guest';
  res.render('dashboard', { name: userName });
};

module.exports = {
  showHome
};