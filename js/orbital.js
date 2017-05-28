jQuery.fn.orbital = function(jsonUrl){

    var rootOrbitmanImage = "imagens/mediattor.png";

    var svg = d3.select($(this).get(0)),
        width = +svg.attr("width") - 40,
        height = +svg.attr("height") - 40,
        defs = svg.append('defs'),
        totalOrbits = 9;

    var g = svg.append("g").attr("transform", "translate(" + (width / 2 + 20) + "," + (height / 2 + 20) + ")"),
        radius = Math.min(width, height) / 2,
        orbitSize = radius / (totalOrbits + 2);

    var orbitNumber = function(d){
      var count = 0, node = d;
      while(node.parent){
        count++;
        node = node.parent;
      }
      return count;
    };

    // LOGO DA MEDIATTOR
    defs.append("pattern")
      .attr("id", "root-orbitman-background")
      .attr('width', 1)
      .attr('height', 1)
      .append("image")
      .attr('width', orbitSize * 2)
      .attr('height', orbitSize * 2)
      .attr("xlink:href", rootOrbitmanImage);

    /* DESENHA ORBITAIS */

    var y = d3.scaleLinear()
        .range([orbitSize * 2, radius])
        .domain([0, totalOrbits]);

    var yAxis = g.append("g");

    var ticks = new Array(totalOrbits);
    ticks = ticks.fill().map(function(v,i,a){ return i % totalOrbits; });

    var yTick = yAxis
      .selectAll("g")
      .data(ticks)
      .enter().append("g");

    yTick.append("circle")
      .attr("class", function(d, i) { return "orbit" + " orbit-" + i + (d == 1 ? " last-orbit" : " internal-orbit" ); })
      .attr("r", y);

    /* FIM DESENHA ORBITAIS */

    var getDepth = function (obj) {
      var depth = 0;
      if (obj.children) {
          obj.children.forEach(function (d) {
              var tmpDepth = getDepth(d)
              if (tmpDepth > depth) {
                  depth = tmpDepth
              }
          })
      }
      return 1 + depth
    };

    var guid = function() {
      function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    };

    var orbitalData = function(data){
      data.id = guid();
      if(data.depth > 0){
        data.depth += 1;
      }
      if(data.children){
        data.children.forEach(function(child){
          child = orbitalData(child);
        });
      }
      return data;
    }

    d3.json(jsonUrl, function(error, data) {

      var tree = d3.tree()
         .size([360, orbitSize * getDepth(data)])
         .separation(function(a, b) { return (a.parent == b.parent ? 1 : 2) / a.depth; });

      var root = tree(orbitalData(d3.hierarchy(data)));

      var buildTooltipster = function(d){
        if(d.depth > 0){
          var content = "<h4>" + orbitNumber(d) + "a orbita</h4>";
          content += "<div class=\"orbit-way\">"
          content += "<div class=\"orbit-way-item\"><img src=\"" + root.data.picture + "\" /></div>";
          for(var i = 2; i < d.depth; i++){
            content += "<div class=\"orbit-way-item\"></div>";
          }
          content += "<div class=\"orbit-way-item\"><img src=\"" + d.data.picture + "\" /></div>";
          content += "</div>";
          content += "<p>Parentesco de " + d.data.name + "</p>";

          $(this).tooltipster({ theme: 'tooltipster-shadow', contentAsHTML: true, content: content, delay: 0 });
        }
      };

      var highlightOn = function(d) {

        var highlightOrbitman = function(_d) {
          if (_d.parent) {
            highlightOrbitman(_d.parent);
          }
          svg.selectAll(".orbitman.orbitman-" + _d.id).classed('highlight', true);
          if(_d.depth == 2 || _d.id == d.id){
            svg.selectAll(".orbitman.orbitman-" + _d.id).classed('edge', true);
          }
        };
        var highlightLine =  function(_d) {
          if (_d.parent) {
            highlightLine(_d.parent);
            svg.selectAll(".link.source-" + _d.parent.id + ".target-" + _d.id).classed('highlight', true);
          }
        };
        var highlightOrbit =  function(_d) {
          svg.selectAll(".orbit.orbit-" + (orbitNumber(_d) -1)).classed('highlight', true);
        };
        highlightOrbitman(d);
        highlightLine(d);
        highlightOrbit(d);
      };

      var highlightOff = function(d) {
        svg.selectAll(".orbitman").classed('highlight', false);
        svg.selectAll(".orbitman").classed('edge', false);
        svg.selectAll(".link").classed('highlight', false);
        svg.selectAll(".orbit").classed('highlight', false);
      };

      var link = g.selectAll(".link")
        .data(root.links())
        .enter().append("line")
        .attr("class",  function(d) {
          return "link source-" + d.source.id + " target-" + d.target.id;
        })
        .attr("x1", function(d) { return d.source.y * Math.cos((d.source.x - 90) / 180 * Math.PI); })
        .attr("y1", function(d) { return d.source.y * Math.sin((d.source.x - 90) / 180 * Math.PI); })
        .attr("x2", function(d) { return d.target.y * Math.cos((d.target.x - 90) / 180 * Math.PI); })
        .attr("y2", function(d) { return d.target.y * Math.sin((d.target.x - 90) / 180 * Math.PI); });

      var node = g.selectAll(".node")
        .data(root.descendants().filter( function(d) { return d.depth <= totalOrbits + 1; } ))
        .enter().append("g")
        .attr("class", function(d,i){ return "node"; })
        .attr("transform", function(d) {
          var a = (d.x - 90) / 180 * Math.PI, r = d.y;
          return "translate(" + (r * Math.cos(a)) + "," + (r * Math.sin(a)) + ")";
        })
        .each(buildTooltipster)
        .on('mouseover', highlightOn)
        .on('mouseout', highlightOff);

      var orbitman = node.append("circle")
        .attr("data-orbitman", '1')
        .attr("data-name", function(d,i){ return d.name; })
        .attr("class", function(d,i){ return (d.depth == 0 ? " first-orbitman" : "orbitman") + " orbitman-" + d.id + (d.parent ? " orbitman-parent-" + d.parent.id : ""); })
        .attr("r", function(d){ return d.depth == 0 ? orbitSize : radius * 0.03 })
        .attr("fill", function(d){ return d.depth == 0 ? "url(#root-orbitman-background)" : null });

    });
  }
