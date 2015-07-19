require.config({
	paths: {
		jquery: 'libs/jquery/jquery-2.1.1.min',
		bootstrap: 'libs/bootstrap/bootstrap.min',
		bootstrap_switch: 'libs/bootstrap/bootstrap-switch.min',
		socket_io: '/socket.io/socket.io.js',
		hogan: 'libs/hogan/hogan',
		text: 'libs/require/text'
	},
	shim : {
		"bootstrap" : {
			deps: ["jquery"]
		},
		"bootstrap_switch" : {
			deps: ["bootstrap", "jquery"]
		},
		"hogan": {exports: "Hogan"}
	}
});

require([
	// Load our app module and pass it to our definition function
	'app',
], function(App){
	// The "app" dependency is passed in as "App"
	App.initialize();
});