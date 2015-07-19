var util = require('util');
var EventEmitter = require('events').EventEmitter;

var GroupsController = function (dbModel) {
	var self = this;

	this.init = function () {
		this.removeAllListeners();
	};

	this.add = function (data) {
		if (!data.name || !data.driveId) {
			console.log("Group name is not defined");
			return;
		}
		var self = this;
		dbModel.addGroup(data.name, data.driveId, function(){
			self.emit("groupAdded");
		});
	}

	this.fetchGroups = function () {
		var self = this;

		dbModel.getAllGroups(function (data) {
			self.emit("groupsLoaded", data);
		});
	}
}

util.inherits(GroupsController, EventEmitter);
module.exports = GroupsController;