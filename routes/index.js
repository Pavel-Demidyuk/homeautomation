mode = "dev";


var Model = require('../libs/model');
var dbModel = new Model;
var FsController = require('../libs/fs');
var fsController = new FsController();
var DrivesController = require('../libs/drives');
var drivesController = new DrivesController(dbModel);
var RoomsController = require('../libs/rooms');
var roomsController = new RoomsController(dbModel);
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

    fsController.on("statesFetched", function (states) {
        app.io.broadcast("drives:statesFetched", drivesController.mapStates(states));
    });

    fsController.on("drivePulse", function (driveId, state) { //@TODO check if it works
        console.log("serverSwitch");
        app.io.broadcast('drives:serverSwitch', {
            name: driveId,
            state: state
        })
    });

    drivesController.on("drivesSaved", function () {
        drivesController.fetchAllDrives();
    });

    roomsController.on("roomAdded", function () {
        // reload rooms after adding new room
        roomsController.fetchRooms();
    });

    roomsController.on("roomsLoaded", function (rooms) {
        app.io.broadcast('drives:roomsLoaded', rooms)
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
            fsController.switchDrive(req.data.id,
                drivesController.mapChannel(req.data.id, req.data.channel));
        },
        'installPageRendered': function () {
            roomsController.fetchRooms();
        },
        'save': function (drives) {
            drivesController.saveNewDrives(drives.data);
        },

        'fetchStates': function (driveNames) {
            fsController.fetchStates(driveNames.data);
        }
    });

    app.io.route('rooms', {
        'add': function (req) {
            roomsController.add(req.data);
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
        roomsController.init();

        dbModel.on("ready", function () {
            registerListeners(app);
            defineRoutes(app);
        });
    })
};