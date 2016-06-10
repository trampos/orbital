d3.layout.orbital = function() {
	var currentTickStep = 0;
	var orbitalNodes;
	var orbitalSize = [1,1];
	var nestedNodes;
	var flattenedNodes = [];
	var tickRadianStep = 0.004363323129985824;
  var orbitalDispatch = d3.dispatch('tick');
  var tickInterval;
  var orbitalRings = [];
  var orbitalDepthAdjust = function() {return 2.95};
  var childrenAccessor = function(d) {return d.children};
  var tickRadianFunction = function() {return 1};

	function _orbitalLayout() {
		return _orbitalLayout;
	}

	_orbitalLayout.mode = function() {
		//Atomic, Solar, other?
	}

	_orbitalLayout.start = function() {
		//activate animation here
		// tickInterval = setInterval(
		// 	function() {
		// 	currentTickStep++;
		// 	flattenedNodes.forEach(function(_node){
		// 		if (_node.parent) {
		// 			_node.x = _node.parent.x + ( (_node.parent.ring / 2) * Math.sin( _node.angle + (currentTickStep * tickRadianStep * tickRadianFunction(_node))) );
		// 			_node.y = _node.parent.y + ( (_node.parent.ring / 2) * Math.cos( _node.angle + (currentTickStep * tickRadianStep * tickRadianFunction(_node))) );
		// 		}
		// 	})
		// 	orbitalRings.forEach(function(_ring) {
		// 		_ring.x = _ring.source.x;
		// 		_ring.y = _ring.source.y;
		// 	})
		// 	orbitDispatch.tick();
		// },
		// 10);
	}


	_orbitalLayout.size = function(_value) {
		if (!arguments.length) return orbitalSize;
		orbitalSize = _value;
		return this;
		//change size here
	}

	_orbitalLayout.revolution = function(_function) {
		//change ring size reduction (make that into dynamic function)
		if (!arguments.length) return tickRadianFunction;
		tickRadianFunction = _function;
		return this
	}

	_orbitalLayout.orbitalSize = function(_function) {
		//change ring size reduction (make that into dynamic function)
		if (!arguments.length) return orbitalDepthAdjust;
		orbitalDepthAdjust = _function;
		return this
	}

	_orbitalLayout.orbitalRings = function() {
		if (!arguments.length) {
			return orbitalRings;
		}
		return this;
	}

	_orbitalLayout.nodes = function(_data) {
  	if (!arguments.length) return flattenedNodes;
  	nestedNodes = _data;
  	calculateNodes();
		return this;
	}

	_orbitalLayout.children = function(_function) {
    	if (!arguments.length) return childrenAccessor;

    	//Probably should use d3.functor to turn a string into an object key
    	childrenAccessor = _function;
    	return this;


	}

	// Copia o método "on" do orbitalDispatch para o _orbitalLayout
  d3.rebind(_orbitalLayout, orbitalDispatch, "on");

	return _orbitalLayout;

	function calculateNodes() {

		var _data = nestedNodes;
		var rootNode = _data;
		rootNode.x = orbitalSize[0] / 2;
		rootNode.y = orbitalSize[1] / 2;
		rootNode.deltaX = function(_x) {return _x}
		rootNode.deltaY = function(_y) {return _y}
		rootNode.ring = orbitalSize[0] / 2;
		rootNode.depth = 0;

		flattenedNodes.push(rootNode);

		// Popula os anéis
		for(var i = 0; i < 9; i++){
			orbitalRings.push({x: rootNode.x, y: rootNode.y, r: 100 + (i * 50)});
		}

		traverseNestedData(rootNode)

		function traverseNestedData(_node) {
			if(childrenAccessor(_node)) {
				var thisPie = d3.layout.pie().value(function(d) {return childrenAccessor(d) ? 4 : 1});
				var nodeChildren = childrenAccessor(_node);
				var piedValues = thisPie(nodeChildren);
				var depth = _node.depth + 1;

				for (var x = 0; x < nodeChildren.length; x++) {
					nodeChildren[x].angle = ((piedValues[x].endAngle - piedValues[x].startAngle) / 2) + piedValues[x].startAngle;
					nodeChildren[x].depth = depth;

					nodeChildren[x].x = rootNode.x + ( (100 + (depth * 50)) * Math.sin( nodeChildren[x].angle ) );
					nodeChildren[x].y = rootNode.y + ( (100 + (depth * 50)) * Math.cos( nodeChildren[x].angle ) );

					nodeChildren[x].deltaX = function(_x) {return _x}
					nodeChildren[x].deltaY = function(_y) {return _y}
					nodeChildren[x].ring = rootNode.ring / orbitalDepthAdjust(_node);

					flattenedNodes.push(nodeChildren[x]);
					traverseNestedData(nodeChildren[x]);
				}
			}
		}
	}

}
