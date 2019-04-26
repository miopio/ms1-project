//SEXUAL MISCONDUCT DOTPLOT HISTOGRAM

// Set the dimensions of the canvas / graph
var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 1000 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

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

    


//SEXUAL MISCONDUCT CASE STUDIES********************************************************************
var margin1 = {top: 10, right: 30, bottom: 30, left: 30},
    width1 = 700 - margin1.left - margin1.right,
    height1 = 200 - margin1.top - margin1.bottom;

//parse the date
//var parseDate = d3.timeParse("%d-%m-%Y");
var parseDate1 = d3.timeParse("%m/%d/%Y");

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
        d.startYear = parseDate1(d.Start)
        d.endYear = parseDate1(d.End)
        d.Name = d.Name
        d.Incident = d.Incident
        d.Date = d.Date
        console.log(d.startYear)
        console.log(d.Incident)
        console.log(d.endYear-d.startYear+1)
    });

console.log(data.length); 

function getpos(event) {
  var e = window.event;
  xtool = e.clientX + "px";
  ytool = e.clientY + "px";
}

    x1.domain([0, d3.max(data, function(d) { return d.startYear; })]);
    g1.append("rect")
      //.attr("class", "bar")
      .attr("fill", "#696969")
      .attr("opacity", 1.0)
      .attr("x", x1(parseDate1("01/01/1970")))
      .attr("height", 50)
      .attr("y", 100)
      .attr("width", x1(parseDate1("01/01/2020")));
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
        .attr("width", function(d) {return x1(d.endYear - d.startYear) + 2;})
        .attr("fill", function(d) {
          if (d.Name == "NA") {
            return "white";
          }
            return "red";
          })
        //.attr("width", function(d) { return x(d.Start); })
        .on("mouseover", function(d){
            tooltip1
              .style("left", x1(100))
              //.style("top", height1 + (+d3.select(this).attr("y")- 500))
              .style("top", height1+2000)
              .style("opacity", .9)
              .style("display", "inline-block")
              .html((d.Date) + "<br>" + (d.Name) + "<br>" + (d.Incident));
        })
        .on("mouseout", function(d){ tooltip1.style("display", "none");})

      g1.selectAll(".caption")
});

// CHART 2*****************************************************************************

var margin1a = {top: 10, right: 30, bottom: 30, left: 30},
    width1a = 700 - margin1a.left - margin1a.right,
    height1a = 200 - margin1a.top - margin1a.bottom;

//parse the date
//var parseDate = d3.timeParse("%d-%m-%Y");
var parseDate1a = d3.timeParse("%m/%d/%Y");

var x1a = d3.scaleTime()
        .domain([new Date(1970, 1, 1), new Date(2020, 12, 31)])
        .rangeRound([0, width1a]);
var x2a = d3.scaleLinear()
    .range([0, width1a]);
var y2a = d3.scaleLinear()
    .domain([0, 23])
    .range([0, height1a]);

// Adds the svg canvas
var svg1a = d3.select("#chart2")
  .append("svg")
    .attr("width", width1a + margin1a.left + margin1a.right)
    .attr("height", height1a + margin1a.top + margin1a.bottom);

// add the tooltip area to the webpage
var tooltip1 = d3.select("#chart2").append("div")
    .attr("class", "tooltip1")
    .style("opacity", 0);

var file1a = "data/caseStudy_Ayala.csv";

var g1a = svg1a.append("g")
    .attr("transform", "translate(" + margin1a.left + "," + margin1a.top + ")");

// Get the data
d3.csv(file1a, function(error, data) {
    data.forEach(function(d) {
        d.startYear = parseDate1(d.Start)
        d.endYear = parseDate1(d.End)
        d.Name = d.Name
        d.Incident = d.Incident
        d.Date = d.Date
        console.log(d.startYear)
        console.log(d.Incident)
        console.log(d.endYear-d.startYear+1)
    });

console.log(data.length); 

function getpos(event) {
  var e = window.event;
  xtool = e.clientX + "px";
  ytool = e.clientY + "px";
}

    x1a.domain([0, d3.max(data, function(d) { return d.startYear; })]);
    g1a.append("rect")
      //.attr("class", "bar")
      .attr("fill", "#696969")
      .attr("opacity", 1.0)
      .attr("x", x1a(parseDate1a("01/01/1970")))
      .attr("height", 50)
      .attr("y", 100)
      .attr("width", x1a(parseDate1a("01/01/2020")));
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

    var bars = g1a.selectAll(".bar")
        .data(data)
      .enter();

      bars.append("rect")
          .attr("class", "bar")
          .attr("x", function(d){return x1a(d.startYear)})
          .attr("height", 50)
          .attr("y", 100)
          //.attr("width", function(d){ return x1(d.end - d.start)})
          .attr("width", function(d) {return x1a(d.endYear - d.startYear) + 3;})
          .attr("fill", function(d) {
            if (d.Name == "NA") {
              return "white";
            }
              return "red";
            })
          //.attr("width", function(d) { return x(d.Start); })
          .on("mouseover", function(d){
              tooltip1
                .style("left", x1a(100))
                //.style("top", height1 + (+d3.select(this).attr("y")- 500))
                .style("top", height1a+2000)
                .style("opacity", .9)
                .style("display", "inline-block")
                .html((d.Date) + "<br>" + (d.Name) + "<br>" + (d.Incident));
          })
          .on("mouseout", function(d){ tooltip1.style("display", "none");})

});

/*  .attr("class", "axis axis--x")
  .attr("transform", "translate(0," + height1 + ")")
  .style("stroke", "white")
  .call(d3.axisBottom(x1)); */

/*function getpos(event) {
  var e = window.event;
  x = e.clientX + "px";
  y = e.clientY + "px";
}

getpos(); //run wherever you call
tooltip.style.left = x;
tooltip.style.top = y; */

// CHART 3 EQUITY *****************************************************************************
// Set the dimensions of the canvas / graph
/*var margin2 = {top: 10, right: 30, bottom: 30, left: 30},
    width2 = 1000 - margin2.left - margin2.right,
    height2 = 800 - margin2.top - margin2.bottom;

//parse the date
//var parseDate = d3.timeParse("%d-%m-%Y");
var parseDate2 = d3.timeParse("%Y");

// Set the ranges
var x = d3.scaleLinear()
    .rangeRound([0, width])
    .domain([1980, 2018]); 
var x3 = d3.scaleTime()
    .rangeRound([0,width2])
    .domain([new Date(2000, 1, 1), new Date(2018, 12, 31)])
var y3 = d3.scaleLinear()
    .range([height2, 0]);

// Adds the svg canvas
var svg2 = d3.select("#chart5")
  .append("svg")
    .attr("width", width2 + margin2.left + margin2.right)
    .attr("height", height2 + margin2.top + margin2.bottom)
  .append("g")
    .attr("transform",
              "translate(" + margin2.left + "," + margin2.top + ")");

var file2 = "data/Columnbia_equity_divisions.csv"


// Get the data
d3.csv(file2, function(error, data) {
    data.forEach(function(d) {
        d.Year = parseDate(d.Year)
        d.NYUs = d["NYU Science"]
        d.NYUss = d["NYU Social Science"]
        d.NYUh = d["NYU Humanities"]
        d.Cs = d["Columbia Science"]
        d.Css = d["Columbia Social Science"]
        d.Ch = d["Columbia Humanities"]
        console.log(d.Cs)
    });

    console.log(data.length);

    var color = d3.scaleOrdinal(d3.schemeCategory10);

  var xAxis2 = d3.axisBottom()
  .scale(x3);

  var yAxis2 = d3.axisLeft()
  .scale(y3)

  var line = d3.line()
  .x(function(d){
    return x3(d.Year)
  })
  .y(function(d){
    return y3(d.percent)
  })
  .curve(d3.curveBasis);

  var svg = d3.select("chart5").append("svg")
  .attr("width",w + margin.left + margin.right)
  .attr("height",h + margin.top + margin.bottom)
  // .style("background-color","lightGreen")
  .append("g")
  .attr("transform","translate("+margin.left +","+margin.top+")")

  color.domain(d3.keys(data[0]).filter(function(key){
    console.log("key",key)
    return key!=="date";

  }))

  var category = color.domain().map(function(name){
    return {
      name:name,
      values:data.map(function(d){
        return {
          date:d.Year,
          percent:+d[name]
        };
      })
    };
  });

  x3.domain(d3.extent(data,function(d){
    return d.date;
  }));
  y3.domain([d3.min(category,function(c){
    return d3.min(c.values,function(v){
      return v.percent
    })
  }),d3.max(category,function(c){
    return d3.max(c.values,function(v){
      return v.percent;
    })
  })])


  var legend = svg2.selectAll("g")
  .data(category)
  .enter()
  .append("g")
  .attr("class","legend");

  legend.append("rect")
  .attr("x",width2-20)
  .attr("y",function(d,i){
    return i * 20;
  })
  .attr("width",10)
  .attr("height",10)
  .style("fill",function(d){
    return color(d.name);
  });

  legend.append("text")
  .attr("x",width2-8)
  .attr("y",function(d,i){
    return (i * 20) + 9;
  })
  .text(function(d){
    return d.name;
  });

  svg2.append("g")
  .attr("class","x axis")
  .attr("transform","translate(0,"+height2+")")
  .call(xAxis2);

  svg2.append("g")
  .attr("class","y axis")
  .call(yAxis2)
  .append("text")
  .attr("transform","rotate(-90)")
  .attr("y",6)
  .attr("dy",".71em")
  .style("text-anchor","end")
  .style("fill","black")
  .text("Temperature (ºF)");

  var city = svg2.selectAll(".city")
  .data(category)
  .enter().append("g")
  .attr("class","city");

  city.append("path")
  .attr("class","line")
  .attr("d",function(d){
    return line(d.values);
  })
  .style("stroke",function(d){
    return color(d.name)
  });

  city.append("text")
  .datum(function(d){

    return{
      name:d.name,
      value:d.values[d.values.length -1]
    };
  })
  .attr("transform",function(d){
    return "translate(" + x3(d.value.date)+","+y3(d.value.percent)+")";
  })
  .attr("x",3)
  .attr("dy",".35")
  .text(function(d){
    return d.name;
  });

  var mouseG = svg2.append("g") // this the black vertical line to folow mouse
  .attr("class","mouse-over-effects");

  mouseG.append("path")
  .attr("class","mouse-line")
  .style("stroke","black")
  .style("stroke-width","1px")
  .style("opacity","0");

  var lines = document.getElementsByClassName("line");
  var mousePerLine = mouseG.selectAll(".mouse-per-line")
  .data(category)
  .enter()
  .append("g")
  .attr("class","mouse-per-line");

  mousePerLine.append("circle")
  .attr("r",7)
  .style("stroke",function(d){
    return color(d.name);
  })
  .style("fill", "none")
  .style("stroke-width", "1px")
  .style("opacity", "0");

  mousePerLine.append("text")
  .attr("transform","translate(10,3)");

  mouseG.append("rect")
  .attr("width",width2)
  .attr("height",height2)
  .attr("fill","none")
  .attr("pointer-events","all")
  .on("mouseout",function(){
    d3.select(".mouse-line").style("opacity","0");
    d3.selectAll(".mouse-per-line circle").style("opacity","0");
    d3.selectAll(".mouse-per-line text").style("opacity","0")
  })
  .on("mouseover",function(){
    d3.select(".mouse-line").style("opacity","1");
    d3.selectAll(".mouse-per-line circle").style("opacity","1");
    d3.selectAll(".mouse-per-line text").style("opacity","1")

  })
  .on("mousemove",function(){

    var mouse = d3.mouse(this);
    console.log("Mouse:",mouse);
    d3.select(".mouse-line")
    .attr("d",function(){
      var d = "M" + mouse[0] +"," + height2;
      d+=" " +mouse[0] + "," + 0;
      return d;
    })
    // .attr("d",function(){
    //   var d = "M" + w +"," + mouse[1];
    //   d+=" " +0 + "," + mouse[1];
    //   return d;
    // });

    d3.selectAll(".mouse-per-line")
    .attr("transform",function(d,i){
      console.log(width2/(mouse[0]));
      var xDate = x3.invert(mouse[0]),
      bisect =d3.bisector(function(d){ return d.date;}).right;
      idx = bisect(d.values,xDate);
      console.log("xDate:",xDate);
      console.log("bisect",bisect);
      console.log("idx:",idx)

      var beginning = 0,
       end = lines[i].getTotalLength(),
      target = null;

      console.log("end",end);

      while(true){
        target = Math.floor((beginning+end)/2)
        console.log("Target:",target);
        pos = lines[i].getPointAtLength(target);
        console.log("Position",pos.y);
        console.log("What is the position here:",pos)
        if((target ===end || target == beginning) && pos.x !==mouse[0]){
          break;
        }

        if(pos.x > mouse[0]) end = target;
        else if(pos.x < mouse[0]) beginning = target;
        else break; // position found
      }
      d3.select(this).select("text")
      .text(y3.invert(pos.y).toFixed(1))
      .attr("fill",function(d){
        return color(d.name)
      });
      return "translate(" +mouse[0]+","+pos.y+")";

    });



  });


});//d3.csv */
