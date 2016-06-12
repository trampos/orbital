
var width = 1000,
    height = 700,
    radius = Math.min(width, height) / 2;

var x = d3.scale.linear()
    .range([0, 2 * Math.PI]);

var y = d3.scale.pow().exponent(.5)
    .range([0, radius]);

//var color =  d3.scale.linear()
//    .domain([0, 10])
//    .range(["blue", "red", "white"]);

var color = d3.scale.category20c();

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + (width / 2) + "," + (height / 2 + 10) + ")");

var tree = d3.layout.tree();

var partition = d3.layout.partition()
    .sort(null)
    .value(function(d) { return 1; });

// Desenha as órbitas
for(var i = 0; i < 10; ++i) {
    var orbit = svg.append("circle")
      .attr("r", y(i/10))
      .attr("class","orbit")
      .attr("fill", "transparent")
}

// AQUI VAI O JSON COM OS DADOS
d3.json("orbital.json", function(error, root) {
  var nodes = partition.nodes(root);
  drawLinks(nodes);
  drawNodes(nodes);
});

function drawLinks(nodes){
  var links = tree.links(nodes);
  svg.selectAll(".link")
    .data(links)
    .enter().insert("svg:line", ".node")
    .attr('link-tree', function(d) {
      return nodes.indexOf(d.source) + "-" + nodes.indexOf(d.target);
    })
    .attr("class", "link")
    .attr("id", function(d, index) { return index; } )
    .attr('teste', function(d){ console.log(d) })
    .attr("x1", function(d) { return y(d.source.depth / 10) * Math.sin( Math.max(0, Math.min(2 * Math.PI, x(d.source.x + d.source.dx / 2 ))) ); })
    .attr("y1", function(d) { return y(d.source.depth / 10) * Math.cos( Math.max(0, Math.min(2 * Math.PI, x(d.source.x + d.source.dx / 2 ))) ); })
    .attr("x2", function(d) { return y(d.target.depth / 10) * Math.sin( Math.max(0, Math.min(2 * Math.PI, x(d.target.x + d.target.dx / 2 ))) ); })
    .attr("y2", function(d) { return y(d.target.depth / 10) * Math.cos( Math.max(0, Math.min(2 * Math.PI, x(d.target.x + d.target.dx / 2 ))) ); })
    .attr("stroke","rgba(0,0,0,0.2)")
    .attr("stroke-width","1px")
}

function drawNodes(nodes){
  var path = svg.selectAll("g.node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", function(d, index) {
      var dx = y(d.depth / 10) * Math.sin( Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx / 2 ))) );
      var dy = y(d.depth / 10) * Math.cos( Math.max(0, Math.min(2 * Math.PI, x(d.x + d.dx / 2 ))) );
      return "translate("+ dx +","+ dy +")"
    })
    .on("mouseover", function(d) {
      // HIGHLIGHT LINES
      var _highlight = function(d){
        if(d && d.parent){
          d3.selectAll("line[link-tree=\""+nodes.indexOf(d.parent) + "-" + nodes.indexOf(d)+"\"]").classed("highlight", true);
        }
        if(d && d.children){
          d.children.forEach(function(child){ _highlight(child) });
        }
      }
      _highlight(d);
      d3.select(this).append("text").text(d.name).style("text-anchor", "middle").attr("y", 35);
      d3.select(this).select("circle").style("stroke", "#666").style("stroke-width", 1);
    })
    .on("mouseout", function(){
      d3.selectAll("line[link-tree]").classed("highlight", false)
      d3.selectAll("text").remove();
      d3.selectAll("g.node > circle").style("stroke", "none").style("stroke-width", 0);
    });

  path.append("circle")
    .style("fill", function(d) { return color((d.children ? d : d.parent).name); })
    //.attr("r", "7")
    //.attr("r", function(d){ return d.y > 0 ? 3 / Math.sqrt(d.y) : 40 })
    .attr("class", function(d){
      return d.parent ? "child" : "root";
    })
    .attr("r", function(d){ return 7 })
}
