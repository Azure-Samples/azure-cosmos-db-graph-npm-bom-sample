
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    g = svg.append("g").attr("transform", "translate(50,0)");

var curr_view_mode = 'cluster';
var tree = d3.tree().size([height - 400, width - 160]);
var cluster = d3.cluster().size([height, width - 160]);

var stratify = d3.stratify()
    .parentId(function(d) { return d.id.substring(0, d.id.lastIndexOf(".")); });

d3.csv("bom/csv", function(error, data) {
  if (error) throw error;

  var root = stratify(data)
      .sort(function(a, b) { return (a.height - b.height) || a.id.localeCompare(b.id); });

  cluster(root);

  var link = g.selectAll(".link")
      .data(root.descendants().slice(1))
      .enter().append("path")
      .attr("class", "link")
      .attr("d", diagonal);

  var node = g.selectAll(".node")
      .data(root.descendants())
      .enter().append("g")
      .attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  node.append("circle").attr("r", 2.5);

  node.append("text")
      .attr("dy", 3)
      .attr("x", function(d) { return d.children ? 20 : 4; })
      .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
      .text(function(d) { return d.id.substring(d.id.lastIndexOf(".") + 1); });

  //d3.selectAll("input").on("change", radio_button_changed);
  d3.selectAll("h3").on("click", radio_button_changed);

  d3.selectAll("text").on("click", function(){
    library_click(this);
  });

  d3.selectAll("text").on("mouseover", function(){
    library_mouseover(this);
  });

  d3.selectAll("text").on("mouseout", function(){
    library_mouseout(this);
  });

  var timeout = setTimeout(function() {
    d3.select("input[value=\"tree\"]")
        .property("checked", true)
        .dispatch("change");
  }, 1000);

  function radio_button_changed() {
    console.log('radio_button_changed; curr: ' + curr_view_mode);
    if (curr_view_mode === 'tree') {
      curr_view_mode = 'cluster';
    }
    else {
      curr_view_mode = 'tree';
    }
    console.log('radio_button_changed; now: ' + curr_view_mode);

    //timeout = clearTimeout(timeout);
    (curr_view_mode === "tree" ? tree : cluster)(root);
    var t = d3.transition().duration(750);
    node.transition(t).attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });
    link.transition(t).attr("d", diagonal);
  }
});

function diagonal(d) {
  return "M" + d.y + "," + d.x
      + "C" + (d.parent.y + 100) + "," + d.x
      + " " + (d.parent.y + 100) + "," + d.parent.x
      + " " + d.parent.y + "," + d.parent.x;
}

function reset_text_font() {
  d3.selectAll("text")
      .style("font-size", "14px")
      .style("font-weight", "plain")
      .style("fill", "#555");
}

function library_click(t) { 
  var bom_id = t.innerHTML;
  console.log('library_click: ' + bom_id);
  window.location.href = "/lib/" + bom_id;
}

function library_mouseover(t) { 
  var bom_id = t.innerHTML;
  var url = 'bom/tooltip/' + bom_id.replace("/", "|");
  console.log('library_mouseover: ' + bom_id);
  $("#lib_info").text('' + bom_id + ' ...');

  $.get(url, function(lib_obj) {
    try {
      var tooltip_info = lib_obj['tooltip_info'];
      $("#lib_info").text(tooltip_info);
    }
    catch(e) {
      console.log(e);
    } 
  });
}

function library_mouseout(t) { 
  $("#lib_info").text("");
}

function bom_btn_click() {
  document.getElementById("bom_form").submit();
}

$(document).ready(function() {
  console.log('ready in bom_view.js');
});
