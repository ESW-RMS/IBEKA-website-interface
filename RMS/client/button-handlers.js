/** 
 * Main functionality of the client-side interface of the website. 
 */

/* Make legend draggable. */
$(function() {
    $("#legend").draggable();
});

/** 
 * Starting to set up mappings between generator ids and region names. The idea was 
 * to have a mapping between generator IDs (which, at time of coding, were going to be
 * hardcoded into the MoMos [the hardware monitoring generator performance on-site]), and to
 * make these mappings editable, through the client side interface, by the IBEKA employees. 
 * (That way, if a module had to be transferred to another site, or a new module deployed, this mapping 
 *  this mapping could be intuitively updated).
 *
 * This feature was never close to being implemented. (The code below represents a musing in this direction.)
 */

var gen_name_to_id = {"Cinta Mekar": 0, "Sukaramai" : 1, "Bantarsari" : 2};
var region_name_to_id = {"West Java" : 0, "South Bengkulu" : 1};
var gen_id_to_name = {"0" : ["Cinta Mekar", "West Java"], "1" : ["Sukaramai", "South Bengkulu"], "2" : ["Bantarsari", "West Java"]};
var region_id_to_name = {"0" : "West Java", "1" : "South Bengkulu"};

/* Queries the database based on the given parameters, and returns a result that can be interpretted 
   by the graphing package. Stores these results in a session variable. */

var populateData = function() {
    Session.set("voltage", false);
    Session.set("current", false);
    Session.set("power", false);
    Session.set("frequency", false);
    generator = gen_name_to_id[$("#generator-select").val()]; //parseInt($("#generator-select").val());
    reg = region_name_to_id[$("#region-select").val()]; //parseInt($("#region-select").val());
    start_time = new Date($("#start-date").val() + 'T' + $("#start-time").val() + ':00.000Z');
    end_time = new Date($("#end-date").val() + 'T' + $("#end-time").val() + ':59.999Z');

    checked = [];
    if ($("#voltage").is(":checked")) {checked.push("Voltage"); Session.set("voltage", true); }
    if ($("#current").is(":checked")) {checked.push("Current"); Session.set("current", true); }
    if ($("#power").is(":checked")) {checked.push("Power"); Session.set("power", true); }
    if ($("#frequency").is(":checked")) {checked.push("Frequency"); Session.set("frequency", true); }
    Session.set("checked", checked);
    results = RMSData.find({ gen_num: generator, timestamp: { $gt: start_time, $lt: end_time }, region: reg }, {sort: {timestamp: 1}}).fetch();
    
    Session.set("results", results); //store results in a session variable for access
                                     //when populating graph
}

/* May work? Not tested. Intent is to make graphed data downloadable in CSV format. */

var exportTableToCSV = function($table, filename) {
    console.log("here I am!")
    var $rows = $table.find('tr:has(td)'),

    // Temporary delimiter characters unlikely to be typed by keyboard
    // This is to avoid accidentally splitting the actual contents
    tmpColDelim = String.fromCharCode(11), // vertical tab character
    tmpRowDelim = String.fromCharCode(0), // null character

    // actual delimiter characters for CSV format
    colDelim = '","',
    rowDelim = '"\r\n"',

    // Grab text from table into CSV formatted string
    csv = '"' + $rows.map(function (i, row) {
        var $row = $(row),
            $cols = $row.find('td');

        return $cols.map(function (j, col) {
            var $col = $(col),
                text = $col.text();

            return text.replace('"', '""'); // escape double quotes

        }).get().join(tmpColDelim);

    }).get().join(tmpRowDelim)
        .split(tmpRowDelim).join(rowDelim)
        .split(tmpColDelim).join(colDelim) + '"',

    // Data URI
    csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);

    $(this)
        .attr({
        'download': filename,
            'href': csvData,
            'target': '_blank'
    });
}

/* Button handlers */

Template.selector.events({
  'click #graph-button' : function () {
    console.log(Posts.find({}).fetch());
    populateData();
    // var checked = Session.get("checked");
    // var results = Session.get("results");
    var series = [];
    var title = "";
    var yAxis = [];
    for (var i = 0; i < checked.length; i++) {
        if (i == checked.length - 2) title += checked[i] + " and ";
        else if (i == checked.length - 1) title += checked[i] + " ";
        else title += checked[i] + ", ";
        var axis_object = {labels: {style: {color: Highcharts.getOptions().colors[i]}}  ,
                           title: {text: checked[i], style: {color: Highcharts.getOptions().colors[i]}}};
        if (i % 2 == 1) axis_object.opposite = true;
        object = {name: checked[i], data: []};
        if (i != 0) object.yAxis = i;
        for (var j = 0; j < results.length; j++) {
            switch (checked[i]) {
              case "Voltage":
                object.data.push([results[j].timestamp.getTime(), results[j].voltage ]);
                object.tooltip = {valueSuffix: ' V'};
                axis_object.labels.format = "{value} V";
                break;
              case "Current":
                object.data.push([results[j].timestamp.getTime(), results[j].current]);
                object.tooltip = {valueSuffix: ' A'};
                axis_object.labels.format = "{value} A";
                break;
              case "Power":
                object.data.push([results[j].timestamp.getTime(), results[j].power]);
                object.tooltip = {valueSuffix: ' W'};
                axis_object.labels.format = "{value} W";
                break;
              case "Frequency":
                object.data.push([results[j].timestamp.getTime(), results[j].frequency]);
                object.tooltip = {valueSuffix: ' Hz'};
                axis_object.labels.format = "{value} Hz";
                break;
            }
        }
        series.push(object);
        yAxis.push(axis_object);
    }
    console.log(series);
    console.log(yAxis);
    $(function () {
        $('#container').highcharts({
            chart: {
                zoomType: 'x'
            },
            title: {
                text: title + "for Generator " + gen_id_to_name[generator.toString()][0] + ", " + region_id_to_name[reg.toString()]
            },
            subtitle: {
                text: " from " + start_time.toDateString() + " to " + end_time.toDateString()
            },
            xAxis: {
                type: 'datetime',
                minRange: 24 * 3600000 // one day
            },
            yAxis: yAxis,
            tooltip: {
                shared: true
            },
            plotOptions: {
                area: {
                    fillColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                        ]
                    },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            series: series
        });
    });
  }, 

  'click #table-button' : function () {
    //console.log("You clicked the table button!");
    populateData();
    $("#container").hide();
    $("#data_table").show();
}, 

  'click #csv-button' : function () {
    //http://jsfiddle.net/terryyounghk/KPEGU/
    exportTableToCSV(this, [$('#data_table>table'), 'data.csv']);
  }
});

Template.selector.generators = function() {
  return ["Cinta Mekar", "Sukaramai", "Bantarsari"];
  //return _.pluck(_.uniq(RMSData.find({}).fetch(), false, function(d) {return d.gen_num}), 'gen_num');
};

Template.selector.regions = function() {
  return ["West Java", "South Bengkulu"];
  //return _.pluck(_.uniq(RMSData.find({}).fetch(), false, function(d) {return d.region}), 'region');
};

/* A bunch of helper functions */

Template.results.results = function() {
  return Session.get("results");
};
Template.results.checked = function() {
  return Session.get("checked");
};
Template.results.isVoltage = function() {
  return Session.get("voltage");
};
Template.results.isCurrent = function() {
  return Session.get("current");
};
Template.results.isPower = function() {
  return Session.get("power");
};
Template.results.isFrequency = function() {
  return Session.get("frequency");
};
