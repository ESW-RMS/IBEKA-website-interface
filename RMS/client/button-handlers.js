$(function() {
    $( "#legend" ).draggable();
});

Template.selector.events({
  'click #graph-button' : function () {
    document.getElementById('axis0').innerHTML="";
    document.getElementById('axis1').innerHTML="";
    document.getElementById('chart').innerHTML="";
    document.getElementById('legend').innerHTML="";

    var generator = parseInt($("#generator-select").val());
    var reg = parseInt($("#region-select").val());
    var start_time = $("#start-date").val() + 'T' + $("#start-time").val() + ':00.000Z';
    var end_time = $("#end-date").val() + 'T' + $("#end-time").val() + ':59.999Z';

    var results = RMSData.find({ gen_num: generator, timestamp: { $gt: new Date(start_time), $lt: new Date(end_time) }, region: reg }).fetch();
    var data, graph, i, max, min, point, random, scales, series, _i, _j, _k, _l, _len, _len1, _len2, _ref;
    data = [[], []];

    for (var i = 0; i < results.length; i++) {
      data[0].push({ x: results[i].timestamp.getTime() / 1000, y: results[i].voltage });
      data[1].push({ x: results[i].timestamp.getTime() / 1000, y: results[i].power });
    }
    console.log(data);
    scales = [];

    _ref = data[1];
    for (_j = 0, _len = _ref.length; _j < _len; _j++) {
      point = _ref[_j];
      point.y *= point.y;
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

    graph = new Rickshaw.Graph({
      element: document.getElementById("chart"),
      renderer: 'line',
      height: 400,
      series: [
        {
          color: 'steelblue',
          data: data[0],
          name: 'Voltage',
          scale: scales[0]
        }, {
          color: 'lightblue',
          data: data[1],
          name: 'Power',
          scale: scales[1]
        }
      ]
    });

    new Rickshaw.Graph.Axis.Y.Scaled({
      element: document.getElementById('axis0'),
      graph: graph,
      orientation: 'left',
      scale: scales[0],
      tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
      padding: {top: "10px", bottom: "10px"}
    });

    new Rickshaw.Graph.Axis.Y.Scaled({
      element: document.getElementById('axis1'),
      graph: graph,
      grid: false,
      orientation: 'right',
      scale: scales[1],
      tickFormat: Rickshaw.Fixtures.Number.formatKMBT,
      padding: {top: "10px", bottom: "10px"}
    });

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

  'click #excel-button' : function () {
    console.log("You clicked the Excel button!");
  }, 

  'click #access-button' : function () {
    console.log("You clicked the Access button!");
  }
});

Template.selector.generators = function() {
  return _.pluck(_.uniq(RMSData.find({}).fetch(), false, function(d) {return d.gen_num}), 'gen_num');
;
};

Template.selector.regions = function() {
  return _.pluck(_.uniq(RMSData.find({}).fetch(), false, function(d) {return d.region}), 'region');
;
};