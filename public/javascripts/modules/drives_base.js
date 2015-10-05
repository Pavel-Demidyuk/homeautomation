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

            this.bindSwitcher();

            bindFlag = true;
        },

        bindSwitcher: function () {
            var self = this;
            // switch drive
            $('.mdl-switch').each(function (e, element) {
                var checkbox = $(element).find("input");
                $(checkbox).on('change', function () {
                    var options = {
                        id: checkbox.data("drive"),
                        channel: checkbox.data("channel") ? checkbox.data("channel") : 'default',
                        state: checkbox.prop("checked")
                    };
                    io.emit("drives:userSwitch", options);
                });
            });
        },

        serverSwitch: function (data) {
            // TODO implement!!!!
        },

        fetchStates: function (driveIds) {
            io.emit("drives:fetchStates", driveIds);
        },

        updateStates: function (states) {
            for (var key in states) {
                this.singleDriveStateUpdate(states[key].name, states[key].state);
            }
        },

        singleDriveStateUpdate: function (driveName, state) {
            var switcher = this.getSwitcher(driveName);
            switcher.removeAttr("disabled").parent('label').removeClass('is-disabled');
            if (state) {
                switcher.prop('checked', 'checked').parent('label').addClass('is-checked');
            }
        },

        getSwitcher: function (driveName) {
            return $("#switch-" + driveName.replace(/(\.)/g, "\\$1"));
        }
    }
});
