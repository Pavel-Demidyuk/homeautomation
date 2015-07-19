var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var configPaths = require('../../configs/drives/paths.json');
var util = require('util');

var FsController = function () {
	var self = this,
		countFilesInDrive = 4; // pioA, pioB, sensoredA, sensoredB

	this.init = function () {
		this.removeAllListeners();
	};

	this.readDrives = function () {
		var result = [];
		fs.readdir(__dirname + configPaths.drivesPath, function (err, drives) {
			if (err) throw err;
			drives.forEach(function (driveId) {
				//self.watchFile(driveId);

				self.getDrive(driveId, function (drive) {
					if (err) throw err;
					result.push({"name": driveId, content: drive});
					// drives read finished
					if (result.length === drives.length) {
						self.emit("drivesReadFinish", result);
						return;
					}
				})
			})
		})
	}

	this.getDrive = function (driveId, callBack) {
		var result = {};
		var count = 1;
		this.getDrivePaths(driveId).forEach(function (path) {
			fs.readFile(path.path, {encoding: 'utf8'}, function (err, data) {
				if (err) throw err;
				result[path.name] = data;
				if (count == countFilesInDrive) {
					callBack(result);
				}
				count ++;
			})
		})
	}

	this.getDrivePaths = function (driveId) {
		return [
			{name: "pioA", "path": __dirname + configPaths.drivesPath + '/' + driveId + '/' + configPaths.pioA},
			{name: "pioB", "path": __dirname + configPaths.drivesPath + '/' + driveId + '/' + configPaths.pioB},
			{name: "sensedA", "path": __dirname + configPaths.drivesPath + '/' + driveId + '/' + configPaths.sensedA},
			{name: "sensedB", "path": __dirname + configPaths.drivesPath + '/' + driveId + '/' + configPaths.sensedB}
		]
	}

	this.fetchTypes = function () {
		var typesPath = __dirname + '/../../' + configPaths.driveTypes;
		//var typesPath = '/home/epam/www/smarthome/configs/drives/types.json';
		fs.readFile(typesPath, {encoding: 'utf8'}, function (err, content) {
			if (err) throw err;
			self.emit("typesLoaded", JSON.parse(content));
		})
	}

	/**
	 * Detects drive type.
	 *
	 * @param driveId
	 * @returns {string}
	 */
	this.detectType = function (driveId) {
		// todo implement logic
		return 'switcher';
	}

	this.fetchStates = function (driveIds) {
		var result = [];
		for (var key in driveIds) {
			result.push({
				id: driveIds[key],
				state: this.getCurrentState(driveIds[key]) == 1 ? 0 : 1
			});
		}
		this.emit("statesFetched", result);
	}

	this.watchFile = function (driveId) {
		var fullFilePath = this.getFullFilePath(driveId);
		fs.watch(fullFilePath, {persistent: true}, function () {
			console.log("root switch");
			fs.readFile(fullFilePath, {encoding: 'utf8'}, function (err, content) {
				self.emit("drivePulse", driveId, content);
			});
		})
	}

	this.setDriveState = function (driveId, state) {

	}

	this.switchDrive = function (driveId) {
		var state = this.getCurrentState(driveId) == 1 ? 0 : 1;
		fs.writeFile(this.getFullFilePath(driveId), state, function (err) {
			if (err) throw err;
		})
	}

	this.getCurrentState = function (driveId) {
		return fs.readFileSync(this.getFullFilePath(driveId), {encoding: 'utf8'});
	}
}

util.inherits(FsController, EventEmitter);
module.exports = FsController;