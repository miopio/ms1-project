//SEXUAL MISCONDUCT DOTPLOT HISTOGRAM

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

//function update(){

//var t = d3.transition()
//      .duration(1000);

var file = "data/sexualMisconduct_science.csv"

// Get the data
d3.csv(file, function(error, data) {
    data.forEach(function(d) {
        d.Year = parseDate(d.Year)
        d.Name = d.Name
        d.Outcome = d.Outcome
        d.Color = d.Color
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
                  color: p.Color,
                  link: p["Link(s)"],
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
        .style("fill", function(d){ return d.color; })
        //.on("mouseover", function(d, i){console.log(value[i])})
        .on("mouseover", tooltipOn)
        //.on("click", tooltipOff)
        .on("mouseout", tooltipOff)
        .on("click", function(d){
          window.open(d.link)
        })
        .transition()
          .duration(500)
          .attr("r", function(d) {
          return (d.length==0) ? 0 : d.radius; })

    binContainerEnter.merge(binContainer)
        .attr("transform", d => `translate(${x(d.x0)}, ${height})`)
  });//d3.csv
//};//update

/*function color(d){
  d3.select(this)
    .classed("selected", false)
    .style("fill", d.color)
}*/

function tooltipOn(d) {
  //x position of parent g element
  let gParent = d3.select(this.parentElement)
  let translateValue = gParent.attr("transform")

  let gX = translateValue.split(",")[0].split("(")[1] * 50
  //let gX = translateValue.split(",")[0].split
  let gY = height + (+d3.select(this).attr("cy")- 1500)

  d3.select(this)
    .classed("selected", true)
    .style("opacity", .5)
  tooltip.transition()
       .duration(200)
       .style("opacity", .9);
  tooltip.html("<b>" + d.name + "</b>" + "</br>" + d.value + "</br>" + d.institution + "</br>" + d.discipline + "</br>" + "<a href= '" + d.link + "''>" + "Details" + 
    "</a>")
  //tooltip.html("Hellohellohello")
    .style("left", gX/200 + "px")
    .style("top", gY/3 + "px")
    //console.log(d.Name + "and" + d.Outcome)
    //console.log(this.Name);
}//tooltipOn

function tooltipOff(d) {
  d3.select(this)
      .classed("selected", false)
      .style("fill", function(d){ return d.color; })
      .style("opacity", 1)
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

//Legend
    var ordinal = d3.scaleOrdinal()
      .domain(["no action", "resigned/retired", "demoted/reprimanded", "suspended", "fired", "lawsuit settled/monetary punishment", "banned from premesis", "death"])
      .range(["#fe0000", "#f7931e", "#f8a395", "#e41a72", "#fcd107", "#f365e7", "#a0581c", "#a90aa1", "#e6d3a5"]);

    var legend = svg.append("g")
        .attr("font-family", "futura-pt")
        .attr("font-size", 10)
        .attr("fill", "#fff")
        .attr("text-anchor", "end")
        .attr("class", ordinal)
      .selectAll("g")
      .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("circle")
        .attr("cx", 19)
        .attr("cy", 19);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { return d; }); 

          

//draw everything
//update();



//SEXUAL MISCONDUCT CASE STUDIES
var margin1 = {top: 10, right: 30, bottom: 30, left: 30},
    width1 = 700 - margin1.left - margin1.right,
    height1 = 500 - margin1.top - margin1.bottom;

//parse the date
//var parseDate = d3.timeParse("%d-%m-%Y");
var parseDate = d3.timeParse("%Y");

// Set the ranges
/*var x = d3.scaleLinear()
    .rangeRound([0, width1])
    .domain([1980, 2018]); */
/*var x1 = d3.scaleTime()
    .rangeRound([0,width1])
    .domain([new Date(1970, 1, 1), new Date(2018, 12, 31)])
var y1 = d3.scaleLinear()
    .range([0, height1]);*/

var x1 = d3.scaleTime()
        .domain([new Date(1970, 1, 1), new Date(2020, 12, 31)])
        .rangeRound([0, width1]);
var x2 = d3.scaleLinear()
    .range([0, width1]);
var y2 = d3.scaleLinear()
    .domain([0, 23])
    .range([0, height1]);

// Adds the svg canvas
var svg1 = d3.select("#chart1")
  .append("svg")
    .attr("width", width1 + margin1.left + margin1.right)
    .attr("height", height1 + margin1.top + margin1.bottom);

// add the tooltip area to the webpage
var tooltip1 = d3.select("#chart1").append("div")
    .attr("class", "tooltip1")
    .style("opacity", 0);

var file1 = "data/misconduct_caseStudies.csv";

var g1 = svg1.append("g")
    .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

// Get the data
d3.csv(file1, function(error, data) {
    data.forEach(function(d) {
        d.startYear = parseDate(d.Start)
        d.endYear = parseDate(d.End)
        d.Name = d.Name
        d.Incident = d.Incident
        d.Date = d.Date
        console.log(d.startYear)
        console.log(d.Incident)
        console.log(d.endYear-d.startYear+1)
    });

console.log(data.length);

    x1.domain([0, d3.max(data, function(d) { return d.startYear; })]);
    g1.append("rect")
      //.attr("class", "bar")
      .attr("fill", "#696969")
      .attr("opacity", 1.0)
      .attr("x", x1(parseDate(1970)))
      .attr("height", 50)
      .attr("y", 100)
      .attr("width", x1(parseDate(2020)));
    //x1.domain(d3.extent(data, function(d) { return d.End; }));
    //y.domain(data.map(function(d) { return d.Name; })).padding(0.1);

   /*g1.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height1 + ")")
        .style("stroke", "white")
        //.call(d3.axisBottom(x).ticks(5).tickFormat(function(d) { return parseInt(d / 1000); }).tickSizeInner([-height1]));
*/
    //g1.append("g1")
    //    .attr("class", "y axis")
    //    .call(d3.axisLeft(y));

    g1.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d){return x1(d.startYear)})
        .attr("height", 50)
        .attr("y", 100)
        //.attr("width", function(d){ return x1(d.end - d.start)})
        .attr("width", function(d) {return x1(d.endYear - d.startYear) + 1;})
        //.attr("width", function(d) { return x(d.Start); })
        .on("mouseover", function(d){
            tooltip1
              .style("left", d3.event.pageX +100 + "px")
              .style("top", height1 + (+d3.select(this).attr("y")- 1000))
              .style("opacity", .9)
              .style("display", "inline-block")
              .html((d.Date) + "<br>" + (d.Name) + "<br>" + (d.Incident));
        })
        .on("mouseout", function(d){ tooltip1.style("display", "none");})
});

svg1.append("g")
  .attr("class", "axis axis--x")
  .attr("transform", "translate(0," + height1 + ")")
  .style("stroke", "white")
  .call(d3.axisBottom(x1)); 

