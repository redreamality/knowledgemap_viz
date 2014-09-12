//Constants for the SVG
var width = 3200,
    height = 1800;
    
var nodes = [],
    clinks = [],
    linkedByIndex = {};

//Set up the colour scale
var color = d3.scale.category20();

//Set up the force layout
var force = d3.layout.force()
    .charge(-520)
    .linkDistance(500)
    .size([width, height]);

//Append a SVG to the body of the html page. Assign this SVG as an object to svg
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g");

var node_drag = d3.behavior.drag()
        .on("dragstart", dragstart)
        .on("drag", dragmove)
        .on("dragend", dragend);
    function dragstart(d, i) {
        force.stop() // stops the force auto positioning before you start dragging
    }
    function dragmove(d, i) {
        d.px += d3.event.dx;
        d.py += d3.event.dy;
        d.x += d3.event.dx;
        d.y += d3.event.dy;
    }
    function dragend(d, i) {
        d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        force.resume();
    }
    function releasenode(d) {
        d.fixed = false // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
        force.resume();
    }    

// // 最后务必清除    
// var div = d3.select("body").append("script")
// .attr("type", "application/json")
// .attr("id", "rawjson"); 

// var div2 = d3.select("body").append("div"); 




 

// require json file for data source
d3.text("json_test3_1.json", "text/plain",function(error, data) {
    // Creates the graph data structure out of the json data
    // div.html(data);
    graph = JSON.parse(data)
    
//-------------highlight when mouse hover----------

    // Toggle stores whether the highlighting is on
    var toggle = 0;
    // Create an array logging what is connected to what
    var linkedByIndex = {};
    for (i = 0; i < graph.nodes.length; i++) {
        linkedByIndex[i + "," + i] = 1;
    };
    graph.links.forEach(function (d) {
        linkedByIndex[d.source + "," + d.target] = 1;
    });
    // This function looks up whether a pair are neighbours
    function neighboring(a, b) {
        return linkedByIndex[a.index + "," + b.index];
    }
    function connectedNodes() {
        if (toggle == 0) {
            // Reduce the opacity of all but the neighbouring nodes
            d = d3.select(this).node().__data__;
            node.style("opacity", function (o) {
                return neighboring(d, o) | neighboring(o, d) ? 1 : 0.1;
            });
            link.style("opacity", function (o) {
                return d.index==o.source.index | d.index==o.target.index ? 1 : 0.1;
            });
            // Reduce the op
            toggle = 1;
        } else {
            // Put them back to opacity=1
            node.style("opacity", 1);
            link.style("opacity", 1);
            toggle = 0;
        }
    }   
//-------------highlight when mouse hover----------
    

    
    
    force.nodes(graph.nodes)
      .links(graph.links)
      .start();

          
    //Create all the line svgs but without locations yet
    var link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke",
        function(a) {
        if (a.color == "red") {
            return "#9966CC"
        } else {
            
                return "#FF0033"
            }
        });
        // .style("stroke-width", function(d) { 
        // return Math.sqrt(5*d.weight); 
        // });
        
        //Do the same with the circles for the nodes - no     
    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")     
        .attr("class", "node")
        .call(force.drag)
        .on('click', connectedNodes) //Added highlight 
        .on('dblclick', releasenode)
        .call(node_drag); //Added pindown
        
    node.append("image").attr("xlink:href",
        // "e.png"
        function(a) {
            return a.type == "entity" ? "e.png": "c.png"
         }
         )
         .attr("width", "16px")
         .attr("height", "16px")
            


    node.append("text")
        .attr("dx", 10)
        .attr("dy", ".35em")
        .text(function(d) { return d.id });

    //Now we are giving the SVGs co-ordinates - the force layout is generating the co-ordinates which this code is using to update the attributes of the SVG elements    
    force.on("tick", function() {
        link.attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
            
        d3.selectAll("image")
          .attr("x", function (d) {return d.x-8;})//减掉图片大小的一半，相对位置用不了
          .attr("y", function (d) { return d.y-8; });

        d3.selectAll("text")
          .attr("x", function (d) {return d.x;})
          .attr("y", function (d) {return d.y;});
    });

  });

  
function removesingle() {
    var c = [];
    
    var b = svg.selectAll(".node").data(clinks).filter(function(f) {
        var e = clinks.filter(function(d) {
            return d.target == f
        });
        if (e.length == 1) {
            c.push(e[0]);
            return true
        } else {
            if (e.length == 2 && e[0].source == e[1].source) {
                c.push(e[0]);
                c.push(e[1]);
                return true
            }
        }
    });
    var a = svg.selectAll(".link").data(clinks).filter(function(d) {
        return c.indexOf(d) != -1
    });
    b.remove();
    a.remove();
    force.start()
}  
  
// // Read the data from the raw-json element;
// var raw_json = document.getElementById('rawjson');

// // div2.html(raw_json.innerHTML)
// graph2 = JSON.parse(raw_json.innerHTML);



