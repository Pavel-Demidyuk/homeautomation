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

        bindSubmit: function() {
            // submit
            $("#installDrives").submit(function (event) {
                io.emit("drives:save", $(this).serializeArray());
                event.preventDefault();
            })
        },

        bindSwitcherSensor: function() {
            $('button[data-for="channel_type"]').each(function(e, element){
                var driveId = drivesBase.getDriveIdForElement(element);

                var channel = $(element).data('channel');
                var type = $(element).data('type');
                var opponentType = type == "switcher" ? "senser" : "switcher";
                var opponent = $(element).closest("form").find("button[data-for='channel_type'][data-type=" + opponentType + "]");

                $(element).click(function(event){
                    $(element).prop("enabled", true);
                    opponent.prop("disabled", true);
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
