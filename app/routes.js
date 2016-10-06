var User = require('./models/user');
var Poll = require('./models/poll.js');
module.exports = function(app, passport){
	app.get('/', function(req, res){
		res.render('index.ejs');
	});


	app.get('/poll/:id', isLoggedIn, function(req,res){
		Poll.findById(req.params.id, function(err, data){
			// console.log(data);
			if(err) {
				res.render('Request error');
			}

			res.render('vote.ejs', {poll : data, user : req.user});
		});
	});

	app.post('/vote', function(req, res){
		console.log(req.body);
		var newOpt = req.body.userOption;

		var pollid = req.body.pollid;
		Poll.findById(pollid, function(err, result){
			if(err) throw err;
			console.log('founded');
			if(newOpt.length){
				result.options.push({
					option : newOpt,
					quantity : 1
				});
			}
			else {
				var opts = result.options;
				for (var i = opts.length - 1; i >= 0; i--) {
					if(opts[i].id == req.body.votefor){
						opts[i].quantity += 1;
						break;
					}
				}
			}
			result.save(function(err, poll){
				if(err) throw err;
				res.redirect('/poll/' + pollid);
			})
			// console.log(result);
			
		});
	});

	app.get('/poll/delete/:pollid', isLoggedIn, function(req, res){
		Poll.findByIdAndRemove(req.params.pollid, function(err, result){
			console.log(err);
			console.log(result);
			if(err){
				res.redirect('/mypoll', {message : "Delete Error"});
			}
			else{
				res.redirect("/mypoll");
			}
		});
	});

	app.get('/newpoll', isLoggedIn, function(req, res){
		res.render('poll.ejs');
	});

	app.post('/newpoll', isLoggedIn, function(req, res){
		var formInput = req.body;
		// console.log(formInput);
		var poll = new Poll();
		poll.userId = req.user.id;
		poll.title = formInput.title;
		var len  = Object.keys(formInput).length;
		for(var i = 0; i < len - 2 ; i++){
			poll.options.push({
				option : formInput['opt' + i],
				quantity : 0
			});
		}
		// console.log(poll);

		poll.save(function(err, poll){
			if(err) throw err;
			res.redirect('/poll/' + poll.id);
		})

	})

	app.get('/mypoll',  isLoggedIn, function(req, res){
		Poll.find({
			userId : req.user.id
		}, function(err, data){
			if(err) {
				res.reder("Serch Error");
			}
			res.render('mypoll.ejs', {polls : data, userId : req.user.id});
		}) 
	})

	app.get('/login', function(req, res){
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});
	app.post('/login', passport.authenticate('local-login', {
		successRedirect: '/mypoll',
		failureRedirect: '/login',
		failureFlash: true
	}));

	app.get('/signup', function(req, res){
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});


	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/',
		failureRedirect: '/signup',
		failureFlash: true
	}));

	app.get('/profile', isLoggedIn, function(req, res){
		res.render('profile.ejs', { user: req.user });
	});



	/*app.get('/:username/:password', function(req, res){
		var newUser = new User();
		newUser.local.username = req.params.username;
		newUser.local.password = req.params.password;
		console.log(newUser.local.username + " " + newUser.local.password);
		newUser.save(function(err){
			if(err)
				throw err;
		});
		res.send("Success!");
	});*/

	app.get('/logout', function(req, res){
		req.logout();
		res.redirect('/');
	})

};

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next();
	}

	res.redirect('/login');
}