'use strict';

var ngrams = [];
var currentNgrams = [];
var handles = [];
var ngramsParam;
var select;
var xscale;
var yscale;
var svg;
var xAxis;
var yAxis;
var chart;
var color = d3.scale.category20();
var barHeight;
var bars;
var counts;

var margin = {top: 0, right: 100, bottom: 30, left: 175},
    width = 1170 - margin.left - margin.right,
    height = 1500 - margin.top - margin.bottom;

function loadNgramsList(done) {
  d3.json('/api/ngram', function(error, json) {
    d3.select('#spinner').remove();
    ngrams = json.slice(0,50);
    currentNgrams = ngrams.map(function(ngram) {
      return {'count': ngram.count };
    });
    ngramsParam = ngrams.map(function(ngram) { return ngram.id; }).join(',');

    barHeight = height / currentNgrams.length;

    xscale = d3.scale.linear()
      .domain([0,d3.max(currentNgrams,function(d) { return d.count; })])
      .range([0,width]);

    yscale = d3.scale.linear()
      .domain([0,currentNgrams.length])
      .range([0,height]);

    svg = d3
      .select('#main')
      .append('svg')
      .attr({
        'width': width + margin.left + margin.right,
        'height':height + margin.top + margin.bottom
      });

    yAxis = d3.svg.axis()
      .orient('left')
      .scale(yscale)
      .tickSize(2)
      .tickFormat(function(d,i){ return ngrams[i].nGram; })
      .tickValues(d3.range(currentNgrams.length));

    svg
      .append('g')
		  .attr("transform", "translate(" + margin.left + ",0)")
		  .attr('id','yaxis')
		  .call(yAxis)
      .call(function(selection) {
        selection
          .selectAll('text')
          .attr('y',barHeight / 2);
      });

    chart = svg
      .append('g')
  		.attr("transform", "translate(" + margin.left + ",0)")
  		.attr('id','bars')
  		.selectAll('rect')
  		.data(currentNgrams)
  		.enter()

    bars = chart
  		.append('rect')
  		.attr({
        'width': function(d) { return xscale(d.count); },
        'height': barHeight,
        'fill': function(d,i) {return color(i);},
        'x': 0,
        'y': function(d,i) { return yscale(i); }
      });

    counts = chart
      .append('text')
      .attr({
        'font-size': (barHeight / 2),
        'x': function(d) { return xscale(d.count) + (barHeight * 0.25); },
        'y': function(d,i) { return yscale(i) + (barHeight * 0.65); }
      })
      .text(function(d) { return d.count; });

    done();
  });
}

function transitionValues() {
  bars
    .transition()
    .attr('width',function(d){ return xscale(d.count); });

  counts
    .transition()
    .attr('x',function(d) { return xscale(d.count) + (barHeight * 0.25); })
    .text(function(d) { return d.count; });
}

function changeHandle() {
  if (ngrams.length == 0) {
    loadNgramsList(changeHandle);
  } else {
    var selectedIndex = select.property('selectedIndex');
    if (selectedIndex > 0) {
      var handle = handles[selectedIndex];
      var url = '/api/handle/' + handle.id + '?ngrams=' + encodeURIComponent(ngramsParam);
      d3.json(url, function(error, handle) {
        ngrams.forEach(function(ngram,i) {
          var handleNGramMatches = handle.ngrams.filter(function(_ngram) {
            return _ngram.nGram == ngram.nGram;
          });
          currentNgrams[i].count = handleNGramMatches.length == 0 ? 0 : handleNGramMatches[0].count;
        });
        transitionValues();
      });
    } else {
      ngrams.forEach(function(ngram,i) {
        currentNgrams[i].count = ngram.count;
      });
      transitionValues();
    }
  }
}

d3.json('/api/handle', function(error, json) {
  handles = json;

  select = d3
    .select('#top')
    .append('select')
    .attr('class','form-control pull-left')
    .on('change',changeHandle);

  handles.unshift({
    'id': 0,
    'name': 'All'
  });

  var options = select
    .selectAll('option')
    .data(handles)
    .enter()
    .append('option')
    .attr('value',function(d) { return d.id; })
    .text(function(d) { return d.name; });

  changeHandle();
});
