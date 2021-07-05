//Create SVG dimensions
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

//Create SVG and append to scatter ID
var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

//Append SVG group and shift by left and top margins
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

//Set initial data
var selectedXAxis = "poverty";

//Function to update x-scale upon selection
function xScale(data, selectedXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[selectedXAxis]) * 0.9,
            d3.max(data, d => d[selectedXAxis]) * 1.1
        ])
        .range([0, width]);
    return xLinearScale;
};

//Function to update x-axis upon selection
function setXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transisition()
        .duration(2000)
        .call(bottomAxis);

    return xAxis;
};

//Function to update circles group upon selection
function setCircles(circlesGroup, newXScale, selectedXAxis) {
    circlesGroup.transistion()
        .duration(2000)
        .attr("cx", d => newXScale(d[selectedXAxis]));

    return circlesGroup;
};

//Function to update tooltip upon selection
function setToolTip(selectedXAxis, circlesGroup) {
    let label;

    if(chosenXAxis === "poverty") {
        label = "Poverty: " 
    }
    else if(chosenXAxis === "age") {
        label = "Age: "
    }
    else {
        label = " Household Income: "
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return(`${d.state}<br>${label}${d[selectedXAxis]}%<br>Lacks Healthcare: ${d.healthcare}`);
        });
    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function (data) {
        toolTip.show(data);
    })
        .on("mouseout", function(data){
            toolTip.hide(data);
        });

    return circlesGroup;
}

//Load data from csv
d3.csv("./assets/data/data.csv").then(function(data){
    console.log(data);

    data.forEach(d => {
        d.obesity = +d.obesity;
        d.smokes = +d.smokes;
        d.healthcare = +d.healthcare;
        d.poverty = +d.poverty;
        d.age = +d.age;
        d.income = +d.income;
    });

    var xLinearScale = xScale(data, selectedXAxis);
    
    var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.healthcare)])
        .range([height, 0]);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    //Append axes to chart
    chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    chartGroup.append("g")
        .call(leftAxis);
    
    //Create circles for scatter plot
    var circlesGroup = chartGroup.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d.poverty))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", "15")
        .attr("fill", "Coral")
        .attr("opacity", "0.75")
    
    //Label circles on scatter plot
    var circlesText = chartGroup.selectAll()
        .data(data)
        .enter()
        .append("text")
        .text(d => (d.abbr))
        .attr("x", d => xLinearScale(d.poverty))
        .attr("y", d => yLinearScale(d.healthcare))
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("fill", "white")
        
    //Initialize tool tip
    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return(`${d.state}<br>Poverty: ${d.poverty}%<br>Lacks Healthcare: ${d.healthcare}`);
        });

    //Create tooltip in chart
    chartGroup.call(toolTip);

    //Create event listeners to display and hide tooltip
    circlesGroup
        .on("mouseover", function(d) {toolTip.show(d, this);
        })
        .on("mouseout", d => {toolTip.hide(d, this);
        });
    
    //Create axes label groups
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (height/2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lack Healthcare (%)");
    
    //Create x axis label group
    var xLabelGroup = chartGroup.append("g")
        .attr("transform", `translate(${width/2}, ${height + margin.top + 20})`)
        .attr("class", "axisText")

    var povertyLabel = xLabelGroup.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .classed("active", true)
        .text("In Poverty (%)");
    
    var ageLabel = xLabelGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .classed("inactive", true)
    .text("Age (Median)");

    var incomeLabel = xLabelGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .classed("inactive", true)
    .text("Household Income (Median)");

}).catch(function(error){
    console.log(error);
});