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

var OwfsClient =  require('owfs').Client;
var owfs = new OwfsClient('127.0.0.1', '4304');

owfs.read("/10.67C6697351FF", function (err, data){
    console.log("err", err);
    console.log("_______________");
    console.log(data);
    console.log("_______________");
})

owfs.dir("//mnt/1wire",function(err, directories){
    console.log(directories);
})

owfs.dirall("/",function(err, directories){
    console.log(directories);
})

owfs.get("/",function(err, directories){
    console.log(directories);
})

owfs.dirallslash("/",function(err, directories){
    console.log(directories);
})

owfs.getslash("/",function(err, directories){
    console.log(directories);
})
owfs.dir('/', function(directories){
   console.log(directories);
});

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

    fsController.on("drivePulse", function (driveId,  channelName, state) {
        drivesController.handleSwitch(driveId);
    });

    drivesController.on("switch", function(driveId, state){
        console.log("drive switch");
        app.io.broadcast('drives:switch', {
            name: driveId,
            state: state
        })
    })

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
            fsController.readDrives(true);
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


        return;


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