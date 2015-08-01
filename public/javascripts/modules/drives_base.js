define(["jquery"], function ($) {

	var io,
		bindFlag = false;

	return {
		setIo: function (socket_io) {
			io = socket_io;
		},

		bindEvents: function () {
			if (bindFlag) {
				return;
			}

            // switch drive
			$('.dimension-switch').each(function (e, element) {
				// bind switch event
				$(element).on('switchChange.bootstrapSwitch', null, {io: io}, function (e, state) {

					e.data.io.emit("drives:userSwitch", {
						name: e.currentTarget.dataset.drive,
						channel: e.currentTarget.channel,
						state: state
					});
				});
				//$(element).bootstrapSwitch();
			});

			bindFlag = true;
		},

		findSwitchByDriveId: function (driveId) {
			return $('input.dimension-switch[data-drive="' + driveId + '"]').bootstrapSwitch('state', true, true);
		},

		serverSwitch: function (data) {
			console.log("fucking switch!!!", data);
			var element = $('input[data-drive="' + data.name + '"]');
			element.bootstrapSwitch('state', data.state, true);
		},

		fetchStates: function (driveIds) {
			io.emit("drives:fetchStates", driveIds);
		},

		updateStates: function (drives) {
			console.log(drives);

			for (var key in drives) {
				this.singleDriveStateUpdate(drives[key].id, drives[key].state);
			}
		},

		singleDriveStateUpdate: function (driveId, state) {
			$(this.findSwitchByDriveId(driveId)).bootstrapSwitch('disabled', false);
			$(this.findSwitchByDriveId(driveId)).bootstrapSwitch('state', state, true);
		}
	}
});
