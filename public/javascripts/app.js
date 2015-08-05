// Filename: app.js
define([
	"socket_io",
	"modules/drives_base",
	"modules/drives_install",
	"modules/drives_list",
	"modules/pages"
], function(socket_io, drivesBase, drivesInstall, drivesList, pages){

	var io;

	var ioConnect = function() {
		io = socket_io.connect();
		drivesInstall.setIo(io);
		drivesList.setIo(io);
		drivesBase.setIo(io);
	}

	var listen = function() {
		io.on("page:home", function(data){
			pages.render("home", {result:drivesList.group(data)}, function() {
				drivesList.prepare();
			});
		})

		// there is a switch signal from the server
		io.on("drives:serverSwitch", function(data){
			drivesBase.serverSwitch(data);
		})

		// there are incoming rooms from the server
		io.on("drives:roomsLoaded", function(data){
			drivesInstall.typeaheadInit(data);
		})

		io.on("drives:groupsLoaded", function(data){
			drivesInstall.renderGroups(data);
		})

		io.on("drives:statesFetched", function(data){
			drivesBase.updateStates(data);
		})

		io.on("page:install", function(data){
			pages.render("install", {drives:data}, function(){
				drivesInstall.prepare();
			});
		})

		pages.render("index", {});
	}

	var renderDefaultPage = function() {

	}

	var initialize = function(){
		ioConnect();
		renderDefaultPage();
		listen();
		io.emit("app:ready");
	}

	return {
		initialize: initialize
	};
});