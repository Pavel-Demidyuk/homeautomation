var Model = require('../libs/model');
var dbModel = new Model;
var FsController = require('../libs/fs');
var fsController = new FsController();
var DrivesController = require('../libs/drives');
var drivesController = new DrivesController(dbModel);
var GroupsController = require('../libs/groups');
var groupsController = new GroupsController(dbModel);
var events = require('events');

var globalRes;

var newDrivesAvaliable = function () {
	return true;
}


/**
 * This method describes _CONTROLLERS_ logic
 * @param app
 */
var registerListeners = function (app) {
	// finished reading drives from FS
	fsController.on('drivesReadFinish', function (drivesFs) {
		drivesController.setFsDrives(drivesFs);
		drivesController.fetchAllDrives();
		drivesController.on("drivesFetched", function (drives) {

			if (drivesController.newDrivesAvailable()) {
				app.io.broadcast("page:install", drivesController.getNewDrives());
			}

			else {
				app.io.broadcast("page:home", drives);
			}
		});
	});

	fsController.on("typesLoaded", function (types) {
		app.io.broadcast('drives:typesLoaded', {
			types: types
		})
	});

	fsController.on("statesFetched", function (states) {
		app.io.broadcast("drives:statesFetched", states);
	});

	fsController.on("drivePulse", function (driveId, state) {
		console.log("serverSwitch");
		app.io.broadcast('drives:serverSwitch', {
			name: driveId,
			state: state
		})
	});

	drivesController.on("drivesSaved", function () {
		drivesController.fetchAllDrives();
	});

	groupsController.on("groupAdded", function () {
		// reload groups after adding new group
		groupsController.fetchGroups();
	});

	groupsController.on("groupsLoaded", function (groups) {
		app.io.broadcast('drives:groupsLoaded', groups)
	});
}

/**
 * This is socket IO routes logic.
 * @param app
 */
var defineRoutes = function (app) {
	app.io.route('app', {
		'ready': function () {
			//start point
			fsController.readDrives();
		}
	});

	app.io.route('drives', {
		'userSwitch': function (req) {
			fsController.switchDrive(req.data.name);
		},
		'installPageRendered': function () {
			fsController.fetchTypes();
			groupsController.fetchGroups();
		},
		'save': function (drives) {
			drivesController.saveNewDrives(drives.data);
		},

		'fetchStates': function (driveIds) {
			fsController.fetchStates(driveIds.data);
		}
	});

	app.io.route('groups', {
		'add': function (req) {
			groupsController.add(req.data);
		}
	});
}

/**
 * This is root routes logic
 * @param app
 */
module.exports = function (app) {
	app.get('/', function (req, res) {
		res.render('boot', {
			partials: {
				header: 'layouts/header',
				footer: 'layouts/footer'
			}
		});

		dbModel.init();
		fsController.init();
		drivesController.init();
		groupsController.init();

		dbModel.on("ready", function () {
			registerListeners(app);
			defineRoutes(app);
		});
	})
};