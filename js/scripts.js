
function makeViz() {
  d3.json("orbital.json", function(data) { drawOrbital(data) });
}

function drawOrbital(_data) {

  //down with category20a()!!
  colors = d3.scale.category20b();

  orbitalScale = d3.scale.linear().domain([1, 3]).range([3.8, 1.5]).clamp(true);
  radiusScale = d3.scale.linear().domain([0,1,2,3]).range([20,10,3,1]).clamp(true);


  orbital = d3.layout.orbital().size([1000,1000])
  .children(function(d) {return d.children})
  // .revolution(function(d) {return d.depth})
  .orbitalSize(function(d) {return orbitalScale(d.depth)})
  .nodes(_data);

  console.log(orbital.nodes());

  d3.select("svg").selectAll("g.node").data(orbital.nodes())
  .enter()
  .append("g")
  .attr("class", "node")
  .attr("transform", function(d) {return "translate(" +d.x +"," + d.y+")"})
  .on("mouseover", nodeOver)
  .on("mouseout", nodeOut)

  d3.selectAll("g.node")
  .append("circle")
  .attr("r", function(d) {return 10 /* radiusScale(d.depth) */})
  .style("fill", function(d) {return colors(d.depth)})
  //
  d3.select("svg").selectAll("circle.orbits")
  .data(orbital.orbitalRings())
  .enter()
  .insert("circle", "g")
  .attr("class", "ring")
  .attr("r", function(d) {return d.r})
  .attr("cx", function(d) {return d.x})
  .attr("cy", function(d) {return d.y})
  .style("fill", "none")
  .style("stroke", "black")
  .style("stroke-width", "1px")
  .style("stroke-opacity", .15)
  //
  // orbit.on("tick", function() {
  //   d3.selectAll("g.node")
  //     .attr("transform", function(d) {return "translate(" +d.x +"," + d.y+")"});
  //
  //   d3.selectAll("circle.ring")
  //   .attr("cx", function(d) {return d.x})
  //   .attr("cy", function(d) {return d.y});
  // });
  //
  // orbit.start();

  function nodeOver(d) {
    d3.select(this).append("text").text(d.name).style("text-anchor", "middle").attr("y", 35);
    d3.select(this).select("circle").style("stroke", "black").style("stroke-width", 3);
  }

  function nodeOut() {
    d3.selectAll("text").remove();
    d3.selectAll("g.node > circle").style("stroke", "none").style("stroke-width", 0);
  }


}
