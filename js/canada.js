
/*
 * Creates svg object and uses width & height from <svg> declaration
 */
var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    tooltip,
    BorderNormal = 0.5,
    BorderStrong = 2,
/*
 * Creates mapping between provice ID (1 to 13) to the number of athletes in each province
 */
    rateById = d3.map(),
/*
 * Will use a Quantize scale for the coloring scheme, max# of athletes is 48, min 0
 * domain is set to [-5, 48] though to create some leeway room at the beginning of the scale
 * range is set to 9, as colors are defined in CSS as q?-9 where ? ranges from 0 to 8
 */
    quantize = d3.scaleQuantize()
    .domain([-5, 48])
    .range(d3.range(9).map(function(i) { return "q" + i + "-9"; })),
/*
 * Uses Albers projection, probably adequate for a Canada map
 */
    projection = d3.geoAlbers();
/*
 * Reads map and athletes data
 */
d3.queue()
    .defer(d3.json, "./json/CAN_adm1_1_5.json")
    .defer(d3.tsv, "./data/athletes.tsv", function(d) { rateById.set(d.id, +d.athletes); })
    .await(ready);
/*
 * Map plotting callback
 */
function ready(error, can) {
  if (error) throw error;

  //projection.fitSize([width, height], topojson.feature(can, can.objects.CAN_adm1).features); //ignore: Will fitsize when map is projected
/*
 * Gets Canada map features
 */
  var canF = topojson.feature(can, can.objects.CAN_adm1);
/*
 * Projects map
 */
  var path = d3.geoPath()
    .projection(projection.fitSize([width, height], canF));
/*
 * Add svg object with map data
 */
  svg.append("g")
      .attr("class", "states")
    .selectAll("path")
      .data(canF.features)
    .enter().append("path")
      .attr("class", function(d) {return quantize(rateById.get(d.properties.ID_1)); }) // Class will be used to color each region q0-9 to q8-9
      .attr("d", path)
      .style("stroke-width", BorderNormal);
  createTooltip(); // Creates map tooltip object. It starts as a hidden object defined by the myTip class

  function createTooltip()
  {
    tooltip = d3.select("body")
      .append("div")
  
    //   .style("vertical-align", "middle")
      .classed("myTip", true)
      .html("Canadá");
    hookTooltip(); // Creates the hooks for the tooltips
  }

/*
 * Describe behaviours for mouseover, mousemove, mouseout and click
 */
  function hookTooltip()
  {
    var svg = d3.select(".states").selectAll("path")
  
    .on("mouseover", function(d){
      var tip = d3.select("div.myTip");
      var k;
      var nAthletes = rateById.get(d.properties.ID_1);
/*
 * English name - French name (or only name if VARNAME_1 == "") and #of Athletes
 */
      k = d.properties.NAME_1+(d.properties.VARNAME_1 != "" ? "<br>" + d.properties.VARNAME_1 : "") +
          (nAthletes > 0 ? "<br>Athletes/Athètes: "+ rateById.get(d.properties.ID_1).toLocaleString() : "");
      tip.html(k);
/*
 * Hightlight provice borders
 */
      d3.selectAll("path").filter(function(dd) {
        return dd.properties.ID_1 == d.properties.ID_1;
      }).style("stroke-width", BorderStrong);
/*
 * Makes sure that tooltip is visible
 */
      return tooltip.style("visibility", "visible");})
  
    .on("mousemove", function(){
/*
 * Hovers the tooltip ~20px higher and 25px left of the mouse.
 */
      return tooltip.style("top", (d3.event.pageY-20)+"px")
        .style("left",(d3.event.pageX+25)+"px");})
  
    .on("mouseout", function(d){
/*
 * Provice borders back to normal
 */
      d3.selectAll("path").filter(function(dd) {
        return dd.properties.ID_1 == d.properties.ID_1;
      }).style("stroke-width", BorderNormal);
/*
 * and hides the tooltip
 */
      return tooltip.style("visibility", "hidden");}) // Hides the tooltip when finished
/*
 * Nothing to do on click at this moment
 */
    .on("click", function(d){
      return;
    });
  }
}
