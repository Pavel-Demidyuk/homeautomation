var nano = require('nano')('http://localhost:5984');
var EventEmitter = require('events').EventEmitter;
var util = require('util');

var connected = false;
var db = false;

var dbModel = function () {
	var self = this;

	this.dbConnect = function () {

		nano.db.get('yousmart', function (err, body) {

			if (body) {
				if (err) throw err;
				db = nano.use('yousmart');
				self.emit("ready");
				return;
			}
			if (!body) {
				nano.db.create('yousmart', function () {
					db = nano.use('yousmart');
					self.dbInstall();
					connected = true;
					self.emit("ready");
				});
				return;
			}
			else {
				db = nano.use('yousmart');
				connected = true;
				self.emit("ready");

				return;
			}
		})
	};

	this.dbInstall = function () {
		db.insert({

				"updates": {
					//"inPlace": "function (doc, req) {var field = req.field; var value = req.value; var message = 'set ' + field + ' to ' + value; doc[field] = value; return [doc, message]}"
					"inPlace": "function (doc, req) {var status='undefined'; var body = JSON.parse(req.body); if (body.field && body.value) {doc[body.field] = body.value; status='success'} else {status='field or value are undefined'} return [doc, status]}"
				},

				"views": {
					getAllDrives: {
						"map": function (doc) {
							if (doc.type == "drive") {
								emit(doc.driveId, doc);
							}
						}
					},

					getAllRooms: {
						"map": function (doc) {
							if (doc.type == "room") {
								emit(doc.name, doc.driveId);
							}
						}
					},

					getDriveById: {
						"map": function (doc) {
							emit(doc.driveId, doc)
						}
					}

				}

			}, "_design/drives", function (err, response) {
				if (err) throw err;

			}
		)

	};

	this.init = function () {
		this.removeAllListeners();
		this.connect();
	};

	this.isConnected = function () {

		// TODO FIXME
		return false;


		return connected;
	};

	this.connect = function () {
		if (this.isConnected()) {
			return;
		}

		this.dbConnect();
	};

	this.addRoom = function (roomName, driveId, callback) {
		db.insert({
			type: "room",
			name: roomName,
			driveId: driveId
		}, function (err, body) {
			if (err) throw err;
			if (callback) callback();
		})
	};

	this.getAllDrives = function (callback) {
		db.view("drives", "getAllDrives", function (err, body) {
			if (err) throw err; // @TODO log
			if (callback) {
				callback(body.rows)
			}
			else {
				self.emit("getAllDrives", body.rows);
			}
		})
	};

	this.getAllRooms = function (callback) {
		db.view("drives", "getAllRooms", function (err, body) {
			if (err) throw err;
			if (callback) {
				callback(body.rows);
			}
			else {
				self.emit("getAllRooms", body.rows);
			}
		})
	}

	this.addDrives = function (drives, callback) {
		db.bulk({docs: drives}, function (error, response) {
			if (error) {
				// @TODO log
				console.log(error);
			}
			if (callback) {
				callback();
			}
			else {
				self.emit("saveDrives");
			}
		})

	}

	this.updateDrives = function (data, callback) {

		// !!THIS METHOD IS NOT FINISHED YET!!


		for (var i = 0; i < data.length; i++) {
			if (!data[i].driveId) {
				// @todo log
				console.log("Drive name not set, can't update");
			}

			//db.view("drives", "getDriveById", {keys: [data[i].driveId]}, function (err, body) {
			db.view("drives", "getAllDrives", function (err, body) {
				if (err) {
					console.log(err);
					// @todo log
				}

				var doc = body.rows[0];
				console.log("saving to database");
				db.atomic("drives", "inPlace", body.rows[0].id,
					{field: "foo", value: "bar"}, function (error, response) {
						console.log(error);
						console.log(response);
					});

			})
			return;

		}

		if (callback) {
			callback();
		}
		else {
			self.emit("saveDrives");
		}
	}


}

util.inherits(dbModel, EventEmitter);
module.exports = dbModel;



