
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

var rateById = d3.map();

var quantize = d3.scaleQuantize()
    .domain([-5, 48])
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

var projection = d3.geoAlbers();
    //.scale(985)
    //.center([5,63.5]);
    //.translate([width / 2, height / 2]);


d3.queue()
    .defer(d3.json, "./json/CAN_adm1_1_5.json")
    .defer(d3.tsv, "./data/athletes.tsv", function(d) { rateById.set(d.id, +d.athletes); })
    .await(ready);

function ready(error, can) {
  if (error) throw error;

  //projection.fitSize([width, height], topojson.feature(can, can.objects.CAN_adm1).features);

  var canF = topojson.feature(can, can.objects.CAN_adm1);

  var path = d3.geoPath()
    .projection(projection.fitSize([width, height], canF));

  svg.append("g")
      .attr("class", "states")
    .selectAll("path")
      .data(canF.features)
    .enter().append("path")
      .attr("class", function(d) {return quantize(rateById.get(d.properties.ID_1)); })
      .attr("d", path)
      .style("stroke-width", 0.5);
  criaTooltip();
  hookTooltip();

  function criaTooltip()
  {
    tooltip = d3.select("body")
      .append("div")
  
    //   .style("vertical-align", "middle")
      .classed("myTip", true)
      .html("Canadá");
  }



  function hookTooltip()
  {
    var svg = d3.select(".states").selectAll("path")
  
    .on("mouseover", function(d){
      var tip = d3.select("div.myTip");
      var k;
      var nAtletas = rateById.get(d.properties.ID_1);

      k = d.properties.NAME_1+(d.properties.VARNAME_1 != "" ? "<br>" + d.properties.VARNAME_1 : "") +
          (nAtletas > 0 ? "<br>Athletes/Athètes: "+ rateById.get(d.properties.ID_1).toLocaleString() : "");

      tip.html(k);
      d3.selectAll("path").filter(function(dd) {
        return dd.properties.ID_1 == d.properties.ID_1;
      }).style("stroke-width", "2");
/*      
      d3.selectAll(".microrregiao")
        .filter(function(dd){
          switch (cl.status) {
            case "populacao":
            case "brasil": 
            case "microrregiao": return d.properties.CD_GEOCMI==dd.properties.CD_GEOCMI;
          }
        })
        .style("fill", SELECIONADO);
 */
      return tooltip.style("visibility", "visible");})
  
    .on("mousemove", function(){
      return tooltip.style("top", (d3.event.pageY-20)+"px")
        .style("left",(d3.event.pageX+25)+"px");})
  
    .on("mouseout", function(d){
/*
      d3.selectAll(".microrregiao")
        .filter(function(dd){ return this.style.fill == SELECIONADO})
        .style("fill", function(dd){
          switch(cl.status) {
            case "populacao":
            case "brasil":
            case "microrregiao": return cor(hashDados[dd.properties.CD_GEOCMI]);
          }
      });
 */
      d3.selectAll("path").filter(function(dd) {
        return dd.properties.ID_1 == d.properties.ID_1;
      }).style("stroke-width", "0.5");

      return tooltip.style("visibility", "hidden");})
    .on("click", function(d){
      return;
    });
  }

/*
  svg.append("path")
      .datum(topojson.mesh(can, can.objects.CAN_adm1, function(a, b) { return a !== b; }))
      .attr("class", "states")
      .attr("d", path);
  */
}
