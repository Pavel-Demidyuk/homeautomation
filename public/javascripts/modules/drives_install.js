define(['modules/drives_base', "jquery", "typeahead"], function (drivesBase, $) {
    var io;

    return {

        setIo: function (socket_io) {
            io = socket_io;
        },

        prepare: function () {
            this.displayOneDrive();
            this.bindEvents();
            io.emit("drives:installPageRendered");
        },

        displayOneDrive: function () {
            $("#installDrivesForm:first").show();
        },

        typeaheadInit: function (data) {
            var rooms = [];
            for (var i = 0; i < data.length; i++) {

                rooms.push(data[i].key);
            }
            var substringMatcher = function (strs) {
                return function findMatches(q, cb) {
                    var matches, substringRegex;

                    // an array that will be populated with substring matches
                    matches = [];

                    // regex used to determine if a string contains the substring `q`
                    substrRegex = new RegExp(q, 'i');

                    // iterate through the pool of strings and for any string that
                    // contains the substring `q`, add it to the `matches` array
                    $.each(strs, function (i, str) {
                        if (substrRegex.test(str)) {
                            matches.push(str);
                        }
                    });

                    cb(matches);
                };
            };

            $('.typeahead').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },
                {
                    name: 'rooms',
                    source: substringMatcher(rooms)
                });
        },

        bindSubmit: function () {
            // submit
            $("#installDrivesForm").submit(function (event) {
                console.log($(this).serializeArray());
                event.preventDefault();

                return;
                io.emit("drives:save", $(this).serializeArray());
            })
        },

        bindSwitcherSensor: function () {
            $('button[data-for="channel_type"]').each(function (e, element) {
                var driveId = drivesBase.getDriveIdForElement(element);
                var channel = $(element).data('channel');
                var type = $(element).data('type');
                var opponentType = type == "switcher" ? "sensor" : "switcher";
                var anotherChannel = channel == "A" ? "B" : "A";
                var opponent = $(element).closest("form").find("button[data-for='channel_type'][data-channel='" + channel + "'][data-type=" + opponentType + "]");
                var anotherTypeToActivate = $(element).closest("form").find("button[data-for='channel_type'][data-channel='" + anotherChannel + "'][data-type=" + opponentType + "]");
                var anotherTypeToDeactivate = $(element).closest("form").find("button[data-for='channel_type'][data-channel='" + anotherChannel + "'][data-type=" + type + "]");
                var typeAInput = $(element).closest("form").find("input[name='type_A']");
                var typeBInput = $(element).closest("form").find("input[name='type_B']");
                $(element).click(function (event) {
                    //self.activateChannelType(driveId, channel, type);
                    $(element).addClass("mdl-button--raised");
                    opponent.removeClass("mdl-button--raised");
                    anotherTypeToActivate.addClass("mdl-button--raised");
                    anotherTypeToDeactivate.removeClass("mdl-button--raised");
                    typeAInput.val(type);
                    typeBInput.val(opponentType);
                    event.preventDefault();

                })
            });
        },
        bindEvents: function () {
            drivesBase.bindEvents();

            this.bindSubmit();
            this.bindSwitcherSensor();
        },


    }
});
