// D3 controls ----------------------------------------------------------------------
//
var width = 600,
  height = 600;

var tree = d3.layout.tree()
  .size([height, width - 160]);

var diagonal = d3.svg.diagonal()
  .projection(function(d) { return [d.y, d.x]; });

var jsonStr = SceneJsonStr;

var drawIt = function(json) {
  d3.select('#_tw_treeContainerDiv').html(''); // clear
  
  var svg = d3.select("#_tw_treeContainerDiv").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(40,0)");

  var nodes = tree.nodes(json),
    links = tree.links(nodes);

  var link = svg.selectAll("path.link")
    .data(links)
    .enter().append("path")
    .attr("class", "link")
    .attr("d", diagonal)
  ;

  var node = svg.selectAll("g.node")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
  ;

  node.append("circle")
    .attr("r", 4.5)
  ;

  node.append("text")
    .attr("dx", function(d) { return d.children ? -8 : 8; })
    .attr("dy", 3)
    .attr("text-anchor", function(d) { return d.children ? "end" : "start"; })
    .text(function(d) { return d.name; })
  ;
};

d3.select(self.frameElement).style("height", height + "px");

// Angular controls ----------------------------------------------------------------------
//
var x; ////
var app = angular.module("TreeWhizApp", []);

app.controller("TWController", function($scope,$http) {
  $scope.treeJsonStr = SceneJsonStr; // Loaded from file: scene-json.js
   
  $scope.tryDisplay = function() {
    var treeObj;
    
    try {
      treeObj = JSON.parse($scope.treeJsonStr);
      drawIt(treeObj);
    } catch (msg) {
      treeObj = app.parseLTN($scope.treeJsonStr);   // Try and parse LTN (Loceff Tree Notation)
      if (treeObj != null) {
        drawIt(treeObj);
        return;
      }
      d3.select("#_tw_treeContainerDiv")
        .html("A beautiful tree will grow here once you feed it with a<br/> well-formed JSON or <a href=ltn.html>LTN</a>");
    }
  }
  
  $scope.tryDisplay();
});

// Thanks to Mikel McDaniel for the below
app.getNodeLTN = function(linesLTN, level) {
  // Look for a node spec at the given indentation level in the top line
  while (linesLTN.length > 0 && linesLTN[linesLTN.length-1] == "") linesLTN.pop();
  if (linesLTN.length == 0) return null;
  
  var nspaces = linesLTN[linesLTN.length-1].search(/[^ ]/);
  if (nspaces != level)
    return null;
  
  var node = new Object();
  node.name = linesLTN.pop().substring(nspaces);
  node.children = new Array();
  
  while (linesLTN.length > 0) {
    var nextNumSpaces = linesLTN[linesLTN.length-1].search(/[^ ]/);
    if (nextNumSpaces > level+1) return null; // LTN Syntax error
    if (nextNumSpaces < level+1) break;
    node.children.push(app.getNodeLTN(linesLTN, level+1));
  }
  return node;
};

app.parseLTN = function(treeLtnStr) {
  return app.getNodeLTN(treeLtnStr.split("\n").reverse(), 0);   // rev() 'cuz unshift() is O(n)
};



