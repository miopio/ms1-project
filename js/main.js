// Set the dimensions of the canvas / graph
var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 700 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

//parse the date
//var parseDate = d3.timeParse("%d-%m-%Y");
var parseDate = d3.timeParse("%Y");

// Set the ranges
/*var x = d3.scaleLinear()
    .rangeRound([0, width])
    .domain([1980, 2018]); */
var x = d3.scaleTime()
    .rangeRound([0,width])
    .domain([new Date(1980, 1, 1), new Date(2018, 12, 31)])
var y = d3.scaleLinear()
    .range([height, 0]);

// Adds the svg canvas
var svg = d3.select("#chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

// add the tooltip area to the webpage
var tooltip = d3.select("#chart").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

function update(){

var t = d3.transition()
      .duration(1000);

 var file = "data/sexualMisconduct_science.csv"

// Get the data
d3.csv(file, function(error, data) {
    data.forEach(function(d) {
        d.Year = parseDate(d.Year)
        d.Name = d.Name
        d.Outcome = d.Outcome
        console.log(d.Year)
        console.log(d.Name)
        console.log(d.Outcome);
    });

console.log(data.length);
    // Scale the range of the data
    //x.domain(d3.extent(data, function(d) { return d.Year; }));
    y.domain([0, data.length]);


    // Set up the binning parameters for the histogram
    var nbins = data.length;

    var histogram = d3.histogram()
      .domain(x.domain())
      .thresholds(x.ticks(nbins))
      .value(function(d) { return d.Year;} )

    // Compute the histogram
    //var bins = histogram(data);
    const bins = histogram(data).filter(d => d.length>0)

 //g container for each bin
    let binContainer = svg.selectAll(".gBin")
      .data(bins);

    binContainer.exit().remove()

    let binContainerEnter = binContainer.enter()
      .append("g")
        .attr("class", "gBin")
        .attr("transform", d => `translate(${x(d.x0)}, ${height})`)

    //need to populate the bin containers with data the first time
    binContainerEnter.selectAll("circle")
        .data(d => d.map((p, i) => {
          return {idx: i,
                  name: p.Name,
                  value: p.Outcome,
                  institution: p["Institution and/or Professional Society"],
                  discipline: p["Discipline or Domain"],
                  //radius: (x(d.x1)-x(d.x0))/2
                  radius: (x(d.x1)-x(d.x0))*1.5
                }
        }))
      .enter()
      .append("circle")
        .attr("class", "enter")
        .attr("cx", 0) //g element already at correct x pos
        .attr("cy", function(d) {
            return - d.idx * 2 * d.radius - d.radius; })
        .attr("r", 0)
        //.on("mouseover", function(d, i){console.log(value[i])})
        .on("mouseover", tooltipOn)
        .on("mouseout", tooltipOff)
        .transition()
          .duration(500)
          .attr("r", function(d) {
          return (d.length==0) ? 0 : d.radius; })

    binContainerEnter.merge(binContainer)
        .attr("transform", d => `translate(${x(d.x0)}, ${height})`)
  });//d3.csv
};//update

function tooltipOn(d) {
  //x position of parent g element
  let gParent = d3.select(this.parentElement)
  let translateValue = gParent.attr("transform")

  let gX = translateValue.split(",")[0].split("(")[1]
  let gY = height + (+d3.select(this).attr("cy")- 1500)

  d3.select(this)
    .classed("selected", true)
    .style("fill", "red")
  tooltip.transition()
       .duration(200)
       .style("opacity", .9);
  tooltip.html("<b>" + d.name + "</b>" + "</br>" + d.value + "</br>" + d.institution + "</br>" + d.discipline)
  //tooltip.html("Hellohellohello")
    .style("left", gX/200 + "px")
    .style("top", gY/10 + "px")
    //console.log(d.Name + "and" + d.Outcome)
    //console.log(this.Name);
}//tooltipOn

function tooltipOff(d) {
  d3.select(this)
      .classed("selected", false)
      .style("fill", "#FF9999");
    tooltip.transition()
         .duration(500)
         .style("opacity", 0);
}//tooltipOff



// add x axis
svg.append("g")
  .attr("class", "axis axis--x")
  .attr("transform", "translate(0," + height + ")")
  .style("stroke", "white")
  .call(d3.axisBottom(x));

//draw everything
update();

//update with new data every 3sec
/*d3.interval(function() {
  update();
}, 3000);*/


