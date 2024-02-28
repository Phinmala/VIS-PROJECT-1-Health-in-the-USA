d3.csv("national_health_data.csv").then(function(data) {
    console.log(data);
}).catch(function(error) {
    console.error('Error loading the CSV file:', error);
});

let stateCountyMap = {};
let currentAttributeX = null;
let currentAttributeY = null;
let topojsonData;
let combinedGeoJSONData;

let currentAttribute1 = 'defaultAttribute1';
let currentAttribute2 = 'defaultAttribute2';

let healthData;
let usCounties;

const urbanRuralMapping = {
    'Rural': '1',
    'Small City': '3',
    'Urban': '4',
    'Suburban': '2'
  };
  
  Promise.all([
    d3.csv("./national_health_data.csv").then(data => healthData = data),
    d3.json("./counties.json").then(data => usCounties = data)
  ]).then(() => {
    console.log("GEODATA LOADED");
    let geojsonData = topojson.feature(usCounties, usCounties.objects.counties);
    geojsonData.features.forEach(feature => {
      const featureFips = String(feature.id);
      const healthInfo = healthData.find(d => String(d.cnty_fips) === featureFips);
  
      if (healthInfo) {
        if (healthInfo.urban_rural_status) {
          healthInfo.urban_rural_status = urbanRuralMapping[healthInfo.urban_rural_status];
        }
        Object.assign(feature.properties, healthInfo);
      }
    });
    console.log(geojsonData.features.slice(0, 5));
    combinedGeoJSONData = geojsonData;
  });
  
const tickValues = {
    'poverty_perc': [0, 5, 10, 15, 20, 25, 30, 35, 40, 45],
    'median_household_income': [0, 20000, 40000, 60000, 80000, 100000, 120000, 140000, 160000],
    'education_less_than_high_school_percent': [0, 10, 20, 30, 40, 50, 60, 70, 80],
    'air_quality': [0, 2, 4, 6, 8, 10, 12, 14, 16],
    'park_access': [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    'percent_inactive': [0, 5, 10, 15, 20, 25, 30, 35, 40],
    'percent_smoking': [0, 5, 10, 15, 20, 25, 30, 35, 40, 45],
    'elderly_percentage': [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
    'number_of_hospitals': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 30, 40, 50, 60, 70, 80],
    'number_of_primary_care_physicians': [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30],
    'percent_no_heath_insurance': [0, 4, 8, 12, 16, 20, 24, 28, 32, 36],
    'percent_high_blood_pressure': [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
    'percent_coronary_heart_disease': [0, 2, 4, 6, 8, 10, 12, 14, 16],
    'percent_stroke': [0, 1, 2, 3, 4, 5, 6, 7, 8],
    'percent_high_cholesterol': [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    'urban_rural_status' : [0,1,2,3,4]
};

const axisTitles = {
    poverty_perc: "Poverty Percentage (%)",
    median_household_income: "Median Household Income ($)",
    education_less_than_high_school_percent: "Education Less Than High School (%)",
    air_quality: "Air Quality (Annual PM2.5 Level)",
    park_access: "Park Access (%)",
    percent_inactive: "Physical Inactivity (%)",
    percent_smoking: "Smoking Rate (%)",
    urban_rural_status: "Urban-Rural Classification",
    elderly_percentage: "Elderly Population (%)",
    number_of_hospitals: "Number of Hospitals",
    number_of_primary_care_physicians: "Number of Primary Care Physicians",
    percent_no_heath_insurance: "Uninsured Rate (%)",
    percent_high_blood_pressure: "High Blood Pressure Rate (%)",
    percent_coronary_heart_disease: "Coronary Heart Disease Rate (%)",
    percent_stroke: "Stroke Rate (%)",
    percent_high_cholesterol: "High Cholesterol Rate (%)"
    };

    
function interpolateColors(colorInterpolator, steps) {
    const colors = [];
    const step = 1 / (steps - 1);
    for (let i = 0; i < steps; i++) {
      colors.push(colorInterpolator(i * step));
    }
    return colors;
  }
  let customColorRange = [
    '#eff3ff', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', 
    '#2171b5', '#08519c', '#08306b', '#041843', '#030b12',
    '#030b12', '#030b12', '#030b12', '#030b12', '#030b12',
    '#030b12', '#030b12', '#030b12', '#030b12'
  ];
  
  let colorScaleForHospitals = d3.scaleQuantize()
    .domain([0, 10]) 
    .range(customColorRange);
  let colorScales = {
      'poverty_perc': d3.scaleQuantize().domain([0, 45]).range(interpolateColors(d3.interpolateBlues, 9)),
      'median_household_income': d3.scaleQuantize().domain([0, 160000]).range(interpolateColors(d3.interpolateBlues, 9)),
      'education_less_than_high_school_percent': d3.scaleQuantize().domain([0, 80]).range(interpolateColors(d3.interpolateBlues, 9)),
      'air_quality': d3.scaleQuantize().domain([0, 16]).range(interpolateColors(d3.interpolateBlues, 9)),
      'park_access': d3.scaleQuantize().domain([0, 100]).range(interpolateColors(d3.interpolateBlues, 11)),
      'percent_inactive': d3.scaleQuantize().domain([0, 40]).range(interpolateColors(d3.interpolateBlues, 9)),
      'percent_smoking': d3.scaleQuantize().domain([0, 45]).range(interpolateColors(d3.interpolateBlues, 10)),
      'elderly_percentage': d3.scaleQuantize().domain([0, 60]).range(interpolateColors(d3.interpolateBlues, 13)),
      'number_of_hospitals': colorScaleForHospitals,
      'number_of_primary_care_physicians': colorScaleForHospitals,
      'percent_no_heath_insurance': d3.scaleQuantize().domain([0, 36]).range(interpolateColors(d3.interpolateBlues, 10)),
      'percent_high_blood_pressure': d3.scaleQuantize().domain([0, 60]).range(interpolateColors(d3.interpolateBlues, 13)),
      'percent_coronary_heart_disease': d3.scaleQuantize().domain([0, 16]).range(interpolateColors(d3.interpolateBlues, 9)),
      'percent_stroke': d3.scaleQuantize().domain([0, 8]).range(interpolateColors(d3.interpolateBlues, 9)),
      'percent_high_cholesterol': d3.scaleQuantize().domain([0, 50]).range(interpolateColors(d3.interpolateBlues, 11)),
      'urban_rural_status': d3.scaleQuantize().domain([1, 4]).range(['#ffffcc', '#a1dab4', '#41b6c4', '#2c7fb8'])  
  };
  
d3.csv("national_health_data.csv").then(function(data) {
    const attributes = Object.keys(data[0]).filter(attr => attr !== "cnty_fips" && attr !== "display_name");
    const formattedAttributes = attributes.map(attr => attr.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));
    populateDropdown("#attribute1", formattedAttributes);
    populateDropdown("#attribute2", formattedAttributes);
    initChartsAndMaps();
});

function initChartsAndMaps() {
    initChart("#chart1");
    initChart("#chart2");
    initScatterplot("#scatterplot");
    initMap("#map1");
    initMap("#map2");
}

function initChart(selector) {
    const margin = {top: 20, right: 30, bottom: 50, left: 70};
    const width = 450 - margin.left - margin.right, 
          height = 350 - margin.top - margin.bottom; 

    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);
    

    const svg = d3.select(selector)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    svg.append("g")
       .attr("transform", `translate(0,${height})`) 
       .call(d3.axisBottom(xScale));

    svg.append("g")
       .call(d3.axisLeft(yScale));
}



function initScatterplot(selector) {
    console.log("INIT SCATTER")
    const margin = { top: 20, right: 30, bottom: 50, left: 70 }, 
    width = 450 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

    d3.select(selector).select("svg").remove();

    const svg = d3.select(selector)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear().range([0, width]);
    const yScale = d3.scaleLinear().range([height, 0]);

    svg.append("g")
       .attr("transform", `translate(0,${height})`) 
       .call(d3.axisBottom(xScale));

    svg.append("g")
       .call(d3.axisLeft(yScale));
}

function initMap(selector) {
    console.log("INIT MAP")
    const projection = d3.geoAlbersUsa()
        .scale(700) 
        .translate([650/2, 325/2]);
    const pathGenerator = d3.geoPath().projection(projection);
    const svg = d3.select(selector)
        .append("svg")
        .attr("width", 750)
        .attr("height", 325);

    svg.selectAll(".county")
        .data(combinedGeoJSONData.features)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("d", pathGenerator)
        .attr('fill', 'none') 
        .attr('stroke', '#000'); 

    const svgWidth = 650, svgHeight = 325;
    const legendWidth = 200, legendHeight = 40;
    const legendX = svgWidth - legendWidth + 70; 
    const legendY = svgHeight - legendHeight - 60;

    svg.append('line')
        .attr('class', 'legend-placeholder-line')
        .attr('x1', legendX)
        .attr('y1', legendY + legendHeight / 2)
        .attr('x2', legendX + legendWidth)
        .attr('y2', legendY + legendHeight / 2)
        .attr('stroke', '#000')
        .attr('stroke-width', 2);

    
    const numberOfTicks = 10; 
    for (let i = 0; i <= numberOfTicks; i++) {
        svg.append('line')
            .attr('class', 'legend-placeholder-tick')
            .attr('x1', legendX + i * (legendWidth / numberOfTicks))
            .attr('y1', legendY + legendHeight / 2 - 5) 
            .attr('x2', legendX + i * (legendWidth / numberOfTicks))
            .attr('y2', legendY + legendHeight / 2 + 5) 
            .attr('stroke', '#000')
            .attr('stroke-width', 1);
    }
}


const urbanRuralMappingChart = {
    'Rural': 1,
    'Small City': 3,
    'Urban': 4,
    'Suburban': 2
  };
function prepareDataForChart(data, attribute) {

    const filteredData = data.filter(d => d[attribute] !== "-1");
    if (attribute === 'urban_rural_status') {
        return filteredData.map(d => ({ key: d[attribute], value: urbanRuralMappingChart[d[attribute]] }));
    } else {
        return filteredData.map(d => +d[attribute]);
    }
        

}

function prepareDataForChart2(data, attribute){

    const filteredData = data.filter(d => d[attribute] !== "-1");
    if (attribute === 'urban_rural_status') {
        return filteredData.map(d => ({ key: d[attribute], value: urbanRuralMappingChart[d[attribute]] }));
    } else {
        return filteredData.map(d => ({ key: d[attribute], value: parseFloat(d[attribute])}));
    }

}

function prepareBarChart(data,attribute){

            const counts = d3.rollup(data, v => v.length, d => d[attribute]);
            console.log("counts DATA: " + counts);
            const countsArray = Array.from(counts, ([key, value]) => ({ key, value }));
            console.log("counts array: " + JSON.stringify(countsArray.slice(0, 5), null, 2));
            return countsArray;
}

function prepareDataForScatterplot(data, attributeX, attributeY) {
    
    console.log("PREP SCATTER DATA");
    const preparedDataX = prepareDataForChart2(data, attributeX);
    console.log("PREP X: "+ preparedDataX);
    const preparedDataY = prepareDataForChart2(data, attributeY);
    console.log("PREP Y: "+ preparedDataY);
    const mergedData = preparedDataX.map((d, i) => ({
        x: d.value,
        y: i < preparedDataY.length ? preparedDataY[i].value : null
    })).filter(d => d.y !== null && !isNaN(d.x) && !isNaN(d.y));
    console.log("MERGED: "+ mergedData);
    console.log("MERGED DATA: " + JSON.stringify(mergedData.slice(0, 5), null, 2));

    return mergedData;
}



function renderHistogram(selector, data, attribute) {
    const margin = {top: 10, right: 30, bottom: 50, left: 70};
    const width = 450 - margin.left - margin.right, 
          height = 350 - margin.top - margin.bottom; 
    d3.select(selector).select("svg").remove();


    const svg = d3.select(selector)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
      
      const x = d3.scaleLinear()
      .domain([0, d3.max(tickValues[attribute])])
      .range([0, width]);
  
  
    const histogram = d3.histogram()
        .value(d => d)
        .domain(x.domain())
        .thresholds(tickValues[attribute]);

    const bins = histogram(data);

    const y = d3.scaleLinear()
    .domain([0, d3.max(bins, d => d.length)])
    .range([height, 0]);

    const minHeight = 5;

    svg.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
            .attr("x", d => x(d.x0) + 1)
            .attr("y", d => Math.min(height - 5, y(d.length))) 
            .attr("width", d => x(d.x1) - x(d.x0))
            .attr("height", d => Math.max(5, height - y(d.length))) 
            .style("fill", "steelblue");
        

    const xAxis = d3.axisBottom(x)
    .tickValues(tickValues[attribute])
    .tickFormat(d => {
        if (attribute === 'number_of_hospitals' && d >= 1 && d <= 10) {
        return ''; 
        } else {
        return d3.format(".2s")(d); 
        }
    });

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(xAxis);
    

    svg.append("g")
        .call(d3.axisLeft(y));
          

    svg.append("text")
    .attr("transform", `translate(${width / 2},${height + margin.top + 30})`)
    .text(axisTitles[attribute] || attribute)

    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
   .text("Number of Counties"); 
}

function renderBarChart(selector, data) {
    const margin = {top: 10, right: 30, bottom: 50, left: 70};
    const width = 450 - margin.left - margin.right, 
          height = 350 - margin.top - margin.bottom; 
     d3.select(selector).select("svg").remove();
    const svg = d3.select(selector)
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .range([0, width])
      .domain(data.map(d => d.key))
      .padding(0.1);

    const y = d3.scaleLinear()
                .range([height, 0]) 
                .domain([0, d3.max(data, d => d.value)]); 

    svg.selectAll(".bar")
       .data(data)
       .enter().append("rect")
         .attr("class", "bar")
         .attr("x", d => x(d.key))
         .attr("width", x.bandwidth())
         .attr("y", d => y(d.value))
         .attr("height", d => height - y(d.value)) 
         .style("fill", "steelblue");


    svg.append("g")
       .attr("transform", `translate(0,${height})`) 
       .call(d3.axisBottom(x));

    svg.append("g")
       .call(d3.axisLeft(y));

       svg.append("text")
       .attr("transform", `translate(${width / 2},${height + margin.top + 30})`) 
       .style("text-anchor", "middle")
       .text("Urban-Rural Classification");

    svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 - margin.left)
       .attr("x", 0 - (height/2))
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .text("Number of Counties");
}

function renderScatterplot(selector, data, attributeX, attributeY) {
    const margin = {top: 10, right: 30, bottom: 50, left: 80};
    const width = 450 - margin.left - margin.right, 
    height = 350 - margin.top - margin.bottom; 

    d3.select(selector).select("svg").remove();

    const svg = d3.select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
                     .domain([
                        d3.min(tickValues[attributeX] || data.map(d => d[attributeX])),
                        d3.max(tickValues[attributeX] || data.map(d => d[attributeX]))
                     ])
                     .range([0, width]);

    const yScale = d3.scaleLinear()
                     .domain([
                        d3.min(tickValues[attributeY] || data.map(d => d[attributeY])),
                        d3.max(tickValues[attributeY] || data.map(d => d[attributeY]))
                     ])
                     .range([height, 0]);
    svg.selectAll(".dot")
       .data(data)
       .enter().append("circle")
       .attr("class", "dot")
       .attr("r", 3.5)
       .attr("cx", d => xScale(d["x"]))
       .attr("cy", d => yScale(d["y"]))
       .style("fill", "#69b3a2");
 
    const xAxis = d3.axisBottom(xScale).tickValues(tickValues[attributeX]);
    const yAxis = d3.axisLeft(yScale).tickValues(tickValues[attributeY]);             

const customTickFormat = (d, i, attribute) => {
    if (attribute === 'urban_rural_status') {
      const urbanRuralStatusLabels = ['0', 'Rural', 'Suburban', 'Small City', 'Urban'];
      return urbanRuralStatusLabels[i];
    } else if (attribute === 'number_of_hospitals' && d >= 1 && d <= 10) {
      return ""; 
    } else {
      return d; 
    }
  };
  
  if (attributeX === 'urban_rural_status' || attributeX === 'number_of_hospitals') {
    xAxis.tickFormat((d, i) => customTickFormat(d, i, attributeX));
  }
  if (attributeY === 'urban_rural_status' || attributeY === 'number_of_hospitals') {
    yAxis.tickFormat((d, i) => customTickFormat(d, i, attributeY));
  }
  
    svg.append("g")
       .attr("transform", `translate(0, ${height})`)
       .call(xAxis);

    svg.append("g")
       .call(yAxis);

    svg.append("text")
    .attr("transform", `translate(${width / 2},${height + margin.top + 30})`) 
    .style("text-anchor", "middle")
    .text(axisTitles[attributeX]); 

    svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text(axisTitles[attributeY]);

}

function decideVisualizationType(attribute) {
    const histograms = ['poverty_perc', 'median_household_income', 'education_less_than_high_school_percent', 
                        'air_quality', 'percent_inactive', 'percent_smoking', 'elderly_percentage', 
                        'percent_no_heath_insurance', 'percent_high_blood_pressure', 
                        'percent_coronary_heart_disease', 'percent_stroke', 'percent_high_cholesterol', 'number_of_hospitals', 
                        'number_of_primary_care_physicians', 'park_access'];
    const barCharts = ['urban_rural_status'];
   
    if (histograms.includes(attribute)) {
        return "histogram"
    } else if (barCharts.includes(attribute)) {
        return "barChart"
    } else {
        console.log("Visualization type for " + attribute + " is not determined.");
    }
}

function populateDropdown(selector, options, isStateDropdown = false) {
    const select = d3.select(selector);
    select.selectAll('option').remove(); 
    select.append('option').text('-');

    options.forEach(option => {
        select.append('option').text(option);
    });
}



function renderChoroplethMap(containerSelector, geoData, attribute) {
    const urbanRuralColors = {
        1: '#eff3ff', // Rural
        2: '#bdd7e7', // Suburban
        3: '#6baed6', // Small City
        4: '#2171b5'  // Urban
    };

    let colorScale;
    if (attribute === 'urban_rural_status') {
        colorScale = d => urbanRuralColors[d.properties[attribute]];
    } else {
            colorScale = colorScales[attribute];
    }

    const projection = d3.geoAlbersUsa()
        .scale(700) 
        .translate([650/2, 325/2]);

    const pathGenerator = d3.geoPath().projection(projection);

    const svg = d3.select(containerSelector)
        .append("svg")
        .attr("width", 750)
        .attr("height", 325);

        svg.selectAll(".county")
        .data(geoData.features)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("d", pathGenerator)
        .attr('fill', d => attribute === 'urban_rural_status' ? urbanRuralColors[d.properties[attribute]] : colorScale(d.properties[attribute]));

    const svgWidth = 650, svgHeight = 325;
    const legendWidth = 200, legendHeight = 40;
    const legendX = svgWidth - legendWidth + 70; 
    const legendY = svgHeight - legendHeight - 60;

    if (attribute === 'urban_rural_status') {
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${legendX +35}, ${legendY - 35} )`);

        Object.entries(urbanRuralColors).forEach((entry, i) => {
            const [key, color] = entry;
            legend.append('rect')
                .attr('x', 0)
                .attr('y', i * 25)
                .attr('width', 20)
                .attr('height', 20)
                .style('fill', color);

            legend.append('text')
                .attr('x', 30)
                .attr('y', i * 25 + 15)
                .text({
                    1: 'Rural',
                    2: 'Suburban',
                    3: 'Small City',
                    4: 'Urban'
                }[key]);
        });
    }else if (attribute === 'number_of_hospitals') {
        const defs = svg.append("defs");
        const linearGradient = defs.append("linearGradient")
            .attr("id", "hospitalGradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");
        customColorRange.slice(0, 10).forEach((color, i, array) => {
            linearGradient.append("stop")
                .attr("offset", `${(i / (array.length - 1)) * 100}%`)
                .attr("stop-color", color);
        });
        svg.append("rect")
            .attr("width", legendWidth)
            .attr("height", 20)
            .style("fill", "url(#hospitalGradient)")
            .attr("transform", `translate(${legendX}, ${legendY})`);
    
        const customLegendScale = d3.scaleLinear()
            .domain([0, 9]) 
            .range([0, legendWidth]);
    
        const tickValues = d3.range(0, 10); 
        const customLegendAxis = d3.axisBottom(customLegendScale)
            .tickValues(tickValues)
            .tickFormat(d => (d === 9 ? '10+' : d));
    
        svg.append("g")
            .attr("class", "legend axis")
            .attr("transform", `translate(${legendX}, ${legendY + 20})`)
            .call(customLegendAxis);
    }else if (attribute === 'number_of_primary_care_physicians') {
        const defs = svg.append("defs");
        const linearGradient = defs.append("linearGradient")
            .attr("id", "primaryCareGradient")
            .attr("x1", "0%")
            .attr("x2", "100%")
            .attr("y1", "0%")
            .attr("y2", "0%");
    
        customColorRange.slice(0, 10).forEach((color, i, array) => {
            linearGradient.append("stop")
                .attr("offset", `${(i / (array.length - 1)) * 100}%`)
                .attr("stop-color", color);
        });

        svg.append("rect")
            .attr("width", legendWidth)
            .attr("height", 20)
            .style("fill", "url(#primaryCareGradient)")
            .attr("transform", `translate(${legendX}, ${legendY})`);

        const customLegendScale = d3.scaleLinear()
            .domain([0, 9])
            .range([0, legendWidth]);
    
        const tickValues = d3.range(0, 10); 
        const customLegendAxis = d3.axisBottom(customLegendScale)
            .tickValues(tickValues)
            .tickFormat(d => (d === 9 ? '10+' : d)); 
    
        svg.append("g")
            .attr("class", "legend axis")
            .attr("transform", `translate(${legendX}, ${legendY + 20})`)
            .call(customLegendAxis);
    }
    
    else {
        const defs = svg.append("defs");
        const linearGradient = defs.append("linearGradient")
        .attr("id", "gradient")
        .attr("x1", "0%")
        .attr("x2", "100%")
        .attr("y1", "0%")
        .attr("y2", "0%");

        colorScale.range().forEach((color, i, array) => {
        linearGradient.append("stop")
        .attr("offset", `${i / (array.length - 1) * 100}%`)
        .attr("stop-color", color);
});
svg.append("rect")
    .attr("width", legendWidth)
    .attr("height", 20)
    .style("fill", "url(#gradient)")
    .attr("transform", `translate(${legendX}, ${legendY})`);

const tickValuesForAttribute = tickValues[attribute];
const legendDomain = [d3.min(tickValuesForAttribute), d3.max(tickValuesForAttribute)];
const legendScale = d3.scaleLinear()
    .domain(legendDomain)
    .range([0, legendWidth]);

const legendAxis = d3.axisBottom(legendScale)
    .tickValues(tickValuesForAttribute)
    .tickFormat(d3.format(".2s"));

svg.append("g")
    .attr("class", "legend axis")
    .attr("transform", `translate(${legendX}, ${legendY + 20})`)
    .call(legendAxis);

    }
}



function updateScatterplotWithCurrentAttributes() {
    if (currentAttributeX && currentAttributeY) { 
        d3.csv("national_health_data.csv").then(function(data) {
            console.log("HELLO");
            const scatterPreparedData = prepareDataForScatterplot(data, currentAttributeX, currentAttributeY);
            console.log("BYE");
            console.log("scatter prep data: " + scatterPreparedData);
            d3.select("#scatterplot svg").remove();
            renderScatterplot("#scatterplot", scatterPreparedData, currentAttributeX, currentAttributeY);
        });
    }
}


d3.select("#attribute1").on("change", function() {
    const selectedAttributeFormatted = d3.select(this).property("value");
    if(selectedAttributeFormatted == "-"){
        d3.select("#chart1 svg").remove();
        initChart("#chart1");
        d3.select("#scatterplot svg").remove();
        initScatterplot("#scatterplot");
        d3.select('#map1 svg').remove();
        initMap("#map1");
    }
    else{
    const selectedAttribute = selectedAttributeFormatted.toLowerCase().replace(/ /g, "_");
    currentAttributeX = selectedAttributeFormatted.toLowerCase().replace(/ /g, "_");
    updateScatterplotWithCurrentAttributes();
    const chartType = decideVisualizationType(selectedAttribute);
    d3.csv("national_health_data.csv").then(function(data) {
        let preparedData;
        if (['urban_rural_status'].includes(selectedAttribute)) {
            preparedData = prepareBarChart(data, selectedAttribute);
        }
        else{
            preparedData = prepareDataForChart(data, selectedAttribute);
        }
        d3.select("#chart1 svg").remove();

        if (chartType === "histogram") {
            renderHistogram("#chart1", preparedData,selectedAttribute);
        } else if (chartType === "barChart") {
            renderBarChart("#chart1", preparedData);
        }
        console.log(d3.select('#map1 svg').size())
        d3.select('#map1 svg').remove();
        renderChoroplethMap('#map1', combinedGeoJSONData, selectedAttribute)
    });
    }
});

d3.select("#attribute2").on("change", function() {
    const selectedAttributeFormatted = d3.select(this).property("value");
    if(selectedAttributeFormatted == "-"){
        d3.select("#chart2 svg").remove();
        initChart("#chart2");
        d3.select("#scatterplot svg").remove();
        initScatterplot("#scatterplot");
        d3.select('#map2 svg').remove();
        initMap("#map2");
    }
    else{
    const selectedAttribute = selectedAttributeFormatted.toLowerCase().replace(/ /g, "_");
    currentAttributeY = selectedAttributeFormatted.toLowerCase().replace(/ /g, "_");
    updateScatterplotWithCurrentAttributes();
    const chartType = decideVisualizationType(selectedAttribute);
    d3.csv("national_health_data.csv").then(function(data) {
        let preparedData;
        if (['urban_rural_status'].includes(selectedAttribute)) {
            preparedData = prepareBarChart(data, selectedAttribute);
        }
        else{
            preparedData = prepareDataForChart(data, selectedAttribute);
        }
        d3.select("#chart2 svg").remove();

        if (chartType === "histogram") {
            renderHistogram("#chart2", preparedData,selectedAttribute);
        } else if (chartType === "barChart") {
            renderBarChart("#chart2", preparedData);
        }
        console.log(d3.select('#map2 svg').size())
        d3.select('#map2 svg').remove();
        renderChoroplethMap('#map2', combinedGeoJSONData, selectedAttribute)
    });
}
    
});
