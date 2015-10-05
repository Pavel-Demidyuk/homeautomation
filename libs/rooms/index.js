var util = require('util');
var EventEmitter = require('events').EventEmitter;

var RoomsController = function (dbModel) {
	var self = this;

	this.init = function () {
		this.removeAllListeners();
	};

	this.add = function (data) {
		if (!data.name || !data.driveId) {
			console.log("Room name is not defined");
			return;
		}
		var self = this;
		dbModel.addRoom(data.name, data.driveId, function(){
			self.emit("roomAdded");
		});
	}

	this.fetchRooms = function () {
		var self = this;

		dbModel.getAllRooms(function (data) {
			self.emit("roomsLoaded", data);
		});
	}
}

util.inherits(RoomsController, EventEmitter);
module.exports = RoomsController;