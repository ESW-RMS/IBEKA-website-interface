$(function() {
    $( "#legend" ).draggable();
});

function clearResults() {
  document.getElementById("axis0").innerHTML = "";
  document.getElementById("axis1").innerHTML = "";
  document.getElementById("chart").innerHTML = "";
  document.getElementById("legend").innerHTML = "";
  document.getElementById("results-table").innerHTML = "";
}

Template.selector.events({
  'click #graph-button' : function () {
    clearResults();

    var generator = parseInt($("#generator-select").val());
    var reg = parseInt($("#region-select").val());
    var start_time = $("#start-date").val() + 'T' + $("#start-time").val() + ':00.000Z';
    var end_time = $("#end-date").val() + 'T' + $("#end-time").val() + ':59.999Z';

    var checked = [];
    if ($("#voltage").is(":checked")) checked.push("Voltage");
    if ($("#current").is(":checked")) checked.push("Current");
    if ($("#power").is(":checked")) checked.push("Power");
    if ($("#frequency").is(":checked")) checked.push("Frequency");

    var results = RMSData.find({ gen_num: generator, timestamp: { $gt: new Date(start_time), $lt: new Date(end_time) }, region: reg }).fetch();
    var data, graph, i, max, min, point, random, scales, series, _i, _j, _k, _l, _len, _len1, _len2, _ref;
    if (checked.length > 1) data = [[], []];
    else if (checked.length == 1) data = [[]];
    else {
      //TODO(mcsforza): error handling
    }

    for (var i = 0; i < results.length; i++) {
        for (var j = 0; j < 2 && j < checked.length; j++) {
          switch (checked[j]) {
          case "Voltage":
            data[j].push({ x: results[i].timestamp.getTime() / 1000, y: results[i].voltage });
            break;
          case "Current":
            data[j].push({ x: results[i].timestamp.getTime() / 1000, y: results[i].current });
            break;
          case "Power":
            data[j].push({ x: results[i].timestamp.getTime() / 1000, y: results[i].power });
            break;
          case "Frequency":
            data[j].push({ x: results[i].timestamp.getTime() / 1000, y: results[i].frequency });
            break;
        }
      }
    }
    console.log(data);
    scales = [];
    if (data.length > 1) {
      _ref = data[1];
      for (_j = 0, _len = _ref.length; _j < _len; _j++) {
        point = _ref[_j];
        point.y *= point.y;
      }
    }
    for (_k = 0, _len1 = data.length; _k < _len1; _k++) {
      series = data[_k];
      min = Number.MAX_VALUE;
      max = Number.MIN_VALUE;
      for (_l = 0, _len2 = series.length; _l < _len2; _l++) {
        point = series[_l];
        min = Math.min(min, point.y);
        max = Math.max(max, point.y);
      }
      if (_k === 0) {
        scales.push(d3.scale.linear().domain([min, max]).nice());
      } else {
        scales.push(d3.scale.linear().domain([min, max]).nice());
      }
    }

    var series = [{
          color: 'steelblue',
          data: data[0],
          name: checked[0],
          scale: scales[0]
        }];
    if (checked.length > 1) {
      series.push({
          color: 'lightblue',
          data: data[1],
          name: checked[1],
          scale: scales[1]
      })
    }
    graph = new Rickshaw.Graph({
      element: document.getElementById("chart"),
      renderer: 'line',
      height: 400,
      series: series
    });

    new Rickshaw.Graph.Axis.Y.Scaled({
      element: document.getElementById('axis0'),
      graph: graph,
      orientation: 'left',
      scale: scales[0],
      tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
      padding: {top: "10px", bottom: "10px"}
    });

    if (checked.length > 1) {
      new Rickshaw.Graph.Axis.Y.Scaled({
        element: document.getElementById('axis1'),
        graph: graph,
        grid: false,
        orientation: 'right',
        scale: scales[1],
        tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
        padding: {top: "10px", bottom: "10px"}
      });
    }
    new Rickshaw.Graph.Axis.Time({
      graph: graph
    });

    new Rickshaw.Graph.HoverDetail({
      graph: graph
    });

    new Rickshaw.Graph.Legend( {
      element: document.querySelector('#legend'),
      graph: graph
    });

    graph.render();
  }, 

  'click #table-button' : function () {
    clearResults();
    console.log("You clicked the table button!");
  }, 

  'click #csv-button' : function () {
    clearResults();
    //http://jsfiddle.net/terryyounghk/KPEGU/
    console.log("You clicked the CSV button!");
  }
});

Template.selector.generators = function() {
  return _.pluck(_.uniq(RMSData.find({}).fetch(), false, function(d) {return d.gen_num}), 'gen_num');
};

Template.selector.regions = function() {
  return _.pluck(_.uniq(RMSData.find({}).fetch(), false, function(d) {return d.region}), 'region');
};