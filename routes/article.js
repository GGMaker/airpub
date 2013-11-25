// GET     /          ->  index
// GET     /new       ->  new
// POST    /          ->  create
// GET     /:id       ->  show
// GET     /:id/edit  ->  edit
// PUT     /:id       ->  update
// DELETE  /:id       ->  destroy
var moment = require('moment'),
    pinyin = require('pinyinjs');

exports = module.exports = function($ctrlers) {
    return {
        index: function(req, res, next) {
            $ctrlers.article.pageByPubdate(1, 10, {}, function(err, articles) {
                res.render('home', {
                    articles: articles,
                    moment: moment
                });
            });
        },
        page: function(req, res, next) {
            var page = req.params.page && !isNaN(parseInt(req.params.page)) ? parseInt(req.params.page) : 1;
            $ctrlers.article.pageByPubdate(page, 10, {}, function(err, articles) {
                res.render('home', {
                    articles: articles,
                    moment: moment
                });
            });
        },
        new: function(req, res, next) {
            if (res.locals.user) {
                res.render('article/new');
            } else {
                res.redirect('/signin');
            }
        },
        create: function(req, res, next) {
            if (res.locals.user) {
                var baby = req.body.article;
                if (baby) {
                    baby.author = [];
                    baby.author.push(res.locals.user._id);
                    if (!baby.url) {
                        baby.url = pinyin(baby.title, {
                            style: pinyin.STYLE_NORMAL
                        })[0][0];
                    }
                    $ctrlers.article.create(baby, function(err, b) {
                        console.log(b);
                        res.json({
                            stat: !err ? 'ok' : 'error',
                            article: !err ? b : null
                        });
                    });
                } else {
                    next(new Error('params required'))
                }
            } else {
                next(new Error('signin required'))
            }
        },
        show: function(req, res, next) {
            var url = req.params.article;
            if (url) {
                $ctrlers.article.findOne({
                    url: url
                }).populate('author').exec(function(err, article) {
                    if (!err) {
                        console.log(article);
                        res.render('article/single', {
                            article: article
                        });
                    } else {
                        next(err);
                    }
                });
            } else {
                next(new Error('404'));
            }
        },
        edit: function(req, res, next) {
            if (res.locals.user) {
                $ctrlers.article.checkAuthor(res.locals.user, req.params.article, function(err, stat, article) {
                    if (!err) {
                        if (stat) {
                            res.render('article/edit', {
                                article: article
                            });
                        } else {
                            next(new Error('authed users required'))
                        }
                    } else {
                        next(err);
                    }
                });
            } else {
                next(new Error('authed users required'))
            }
        },
        update: function(req, res, next) {
            if (res.locals.user) {
                $ctrlers.article.checkAuthor(res.locals.user, req.params.article, function(err, stat, article) {
                    if (!err) {
                        if (stat) {
                            $ctrlers.article.update(req.params.article, req.body.article, function(err) {
                                res.json({
                                    stat: !err ? 'ok' : 'error'
                                })
                            })
                        } else {
                            next(new Error('authed users required'))
                        }
                    } else {
                        next(err);
                    }
                });
            } else {
                next(new Error('authed users required'))
            }
        },
        destroy: function(req, res, next) {
            if (res.locals.user) {
                $ctrlers.article.checkAuthor(res.locals.user, req.params.article, function(err, stat, article) {
                    if (!err) {
                        if (stat) {
                            $ctrlers.article.remove(req.params.article, function(err) {
                                res.json({
                                    stat: !err ? 'ok' : 'error'
                                });
                            });
                        } else {
                            next(new Error('authed users required'))
                        }
                    } else {
                        next(err);
                    }
                });
            } else {
                next(new Error('authed users required'))
            }
        }
    }
}