requirejs.config({
	"paths": {
		"typeahead": "libs/typeahead_jquery/typeahead_jquery",
		//"typeahead": "libs/typeahead/typeahead.bundle.min",
		"socket_io": "/socket.io/socket.io.js",
		"hogan": "libs/hogan/hogan",
		"text": "libs/require/text"
	},
	"shim" : {
		"typeahead" : ["jquery"],
		"hogan": {exports: "Hogan"}
	},
});

requirejs([
	// Load our app module and pass it to our definition function
	"app",
], function(App){
	// The "app" dependency is passed in as "App"
	App.initialize();
});