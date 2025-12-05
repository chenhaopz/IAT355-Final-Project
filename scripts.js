// Global variables
let movieData = [];
let currentGenres = new Set();

// Genre mapping
const genreMap = {
    'action': 'Action', 'adventure': 'Adventure', 'comedy': 'Comedy',
    'crime': 'Crime', 'doc': 'Documentary', 'drama': 'Drama',
    'family': 'Family', 'history': 'History', 'horror': 'Horror',
    'music': 'Music', 'mystery': 'Mystery', 'romance': 'Romance',
    'sci-fi': 'Science Fiction', 'thriller': 'Thriller',
    'war': 'War', 'western': 'Western', 'fantasy': 'Fantasy', 'animation': 'Animation'
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadDataAndInitialize);

// Load CSV data and initialize visualizations
async function loadDataAndInitialize() {
        movieData = await d3.csv("Dataset/data.csv");
        console.log("Data loaded:", movieData.length, "records");
        
        // Process data
        movieData.forEach(d => {
            d.primaryGenre = d.Genres ? d.Genres.split(',')[0].trim() : 'Unknown';
            d.Worldwide = +(d.Worldwide || d.worldwide || d['$Worldwide'] || 0);
            d.Year = +d.Year || 0;
            d.DomesticPercent = +(d['Domestic %'] || 0);
            d.ForeignPercent = +(d['Foreign %'] || 0);
            // Process rating data that convert to 1 decimal place
            let ratingStr = d.Rating || '';
            if (ratingStr.includes('/')) {
                ratingStr = ratingStr.split('/')[0]; // Remove /10 part
            }
            d.Rating = parseFloat(ratingStr) || 0;
            if (d.Rating > 0) {
                d.Rating = Math.round(d.Rating * 10) / 10; // Ensure 1 decimal place
            }
            d.Title = d['Release Group'] || 'Unknown Movie';
        });

        createGrossFundsVisualization();
        changeColour(fundsLink);

        // Initialize year display
        document.getElementById('yearVal').textContent = `2000 - ${document.getElementById("yearRange").value}`;
}

//Unchanged
function changeColour(item){
    switch (item) {   
    case fundsLink:
        noLine();
        showNone()

        document.getElementById("backRight").style.backgroundColor = "#E1DEDB";
        
        const fl = document.getElementById("fundsLink");
        fl.style.textDecoration = "underline";
        fl.style.color = "#0078D7";

        document.getElementById("funds").style.display = "block";
        // Create or update visualization when Gross Funds is clicked
        createGrossFundsVisualization();
        break;

    case placeLink:
        noLine();
        showNone()

        document.getElementById("backRight").style.backgroundColor = "#C2C7E4";
        
        const pl = document.getElementById("placeLink");
        pl.style.textDecoration = "underline";
        pl.style.color = "#0078D7";

        document.getElementById("place").style.display = "block";
        
        // Create or update visualization when Foregin VS Domestic is clicked
        createPlaceVisualization();
        break;

    case timeLink:
        noLine();
        showNone()

        document.getElementById("backRight").style.backgroundColor = "#B4977E";
        
        const tl = document.getElementById("timeLink");
        tl.style.textDecoration = "underline";
        tl.style.color = "#0078D7";

        document.getElementById("time").style.display = "block";
        
        // Create or update visualization when Over the Decades is clicked
        createTimeVisualization();
        break;

    case ratingLink:
        noLine();
        showNone()

        document.getElementById("backRight").style.backgroundColor = "#F3E0BE";
        
        const rl = document.getElementById("ratingLink");
        rl.style.textDecoration = "underline";
        rl.style.color = "#0078D7";

        document.getElementById("rating").style.display = "block";
        createRatingVisualization();
        break;

    default:
        noLine();
        document.getElementById("backRight").style.backgroundColor = "#A47864";
        document.getElementById("fundsLink").style.textDecoration = "underline";
        document.getElementById("funds").style.display = "block";
    }
}


function showNone(){
    document.getElementById("funds").style.display = "none";
    
    document.getElementById("time").style.display = "none";
    
    document.getElementById("place").style.display = "none";
    
    document.getElementById("rating").style.display = "none";
}

function noLine(){
    document.getElementById("fundsLink").style.textDecoration = "none";
    document.getElementById("fundsLink").style.color = "black";
    
    document.getElementById("timeLink").style.textDecoration = "none";
    document.getElementById("timeLink").style.color = "black";
    
    document.getElementById("placeLink").style.textDecoration = "none";
    document.getElementById("placeLink").style.color = "black";
    
    document.getElementById("ratingLink").style.textDecoration = "none";
    document.getElementById("ratingLink").style.color = "black";
}

function genreLinks(genre){
    const element = document.getElementById(genre);

    const hasUnderline = element.style.textDecoration === "underline";

    element.style.textDecoration = hasUnderline ? "none" : "underline";

    element.style.color = hasUnderline ? "black" : "#0078D7";
    
    hasUnderline ? currentGenres.delete(genre) : currentGenres.add(genre);
    
    if (document.getElementById("funds").style.display === "block") {
        createGrossFundsVisualization();
    } else if (document.getElementById("time").style.display === "block") {
        createTimeVisualization();
    } else if (document.getElementById("place").style.display === "block") {
        createPlaceVisualization();
    } else if (document.getElementById("rating").style.display === "block") {
        createRatingVisualization();
    }
}

function genreLine(state){
    const genres = [
        "action", "adventure", "comedy", "crime", "doc", "drama", "family",
        "history", "horror", "music", "mystery", "romance", "sci-fi",
        "thriller", "war", "western", "fantasy", "animation"
    ];

    const underline = state === "on";
    genres.forEach(id => {
        document.getElementById(id).style.textDecoration = underline ? "underline" : "none";
        
        document.getElementById(id).style.color = underline ? "#0078D7" : "black";

        underline ? currentGenres.add(id) : currentGenres.delete(id);
    });
    
    if (document.getElementById("funds").style.display === "block") {
        createGrossFundsVisualization();
    } else if (document.getElementById("time").style.display === "block") {
        createTimeVisualization();
    } else if (document.getElementById("place").style.display === "block") {
        createPlaceVisualization();
    } else if (document.getElementById("rating").style.display === "block") {
        createRatingVisualization();
    }
}

// Gross Funds visualization
function createGrossFundsVisualization() {
    // Hide year slider for this visualization
    document.getElementById("yearRange").classList.add("hidden");
    
    // Clear previous visualization
    const fundsDiv = document.getElementById("funds");
    fundsDiv.querySelector("#funds-visualization")?.remove();
    
    const vizContainer = document.createElement("div");
    vizContainer.id = "funds-visualization";
    vizContainer.className = "visualization-container";
    fundsDiv.appendChild(vizContainer);
    
    // Filter and process data
    let filteredData = movieData.filter(d => d.Worldwide > 0);
    
    if (currentGenres.size > 0) {
        const selectedGenres = Array.from(currentGenres).map(g => genreMap[g]);
        filteredData = filteredData.filter(d => selectedGenres.includes(d.primaryGenre));
    }
    
    // Aggregate data
    const data = Array.from(
        d3.rollup(
            filteredData,
            v => d3.mean(v.map(d => d.Worldwide)) / 1000000,
            d => d.primaryGenre
        ),
        ([genre, revenue]) => ({ genre, revenue })
    ).filter(d => d.revenue > 0)
     .sort((a, b) => b.revenue - a.revenue);
    
    // Chart dimensions
    const margin = { top: 40, right: 30, bottom: 80, left: 80 };
    const width = Math.max(500, vizContainer.clientWidth - margin.left - margin.right);
    const height = 400 - margin.top - margin.bottom;
    
    const svg = d3.select("#funds-visualization")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.genre))
        .range([0, width])
        .padding(0.1);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.revenue) * 1.1])
        .range([height, 0]);
    
    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
    
    svg.append("g")
        .call(d3.axisLeft(yScale).tickFormat(d => `$${d}M`));
    
    // Labels
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .text("Average Revenue ($ Millions)");
    
    // Bars
    svg.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.genre))
        .attr("y", d => yScale(d.revenue))
        .attr("width", xScale.bandwidth())
        .attr("height", d => height - yScale(d.revenue))
        .on("mouseover", showTooltip)
        .on("mouseout", hideTooltip);
}

function showTooltip(event, d) {
    d3.select(this).style("fill", "orange");
    d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px")
        .style("height", "fit-content")
        .html(`${d.genre}<br/>Avg: $${d.revenue.toFixed(2)}M`);
}

function hideTooltip() {
    d3.select(this).style("fill", "steelblue");
    d3.selectAll(".tooltip").remove();
}

// Time visualization (Line Chart)
function createTimeVisualization() {
    // Show year slider
    document.getElementById("yearRange").classList.remove("hidden");
    
    // Clear previous visualization
    const timeDiv = document.getElementById("time");
    timeDiv.querySelector("#time-visualization")?.remove();
    
    const vizContainer = document.createElement("div");
    vizContainer.id = "time-visualization";
    vizContainer.className = "visualization-container";
    timeDiv.appendChild(vizContainer);
    
    // Get current year from slider
    const currentYear = parseInt(document.getElementById("yearRange").value);
    
    // Filter data 
    let filteredData = movieData.filter(d => d.Worldwide > 0 && d.Year >= 2000 && d.Year <= currentYear);
    
    // Apply genre filter
    if (currentGenres.size > 0) {
        const selectedGenres = Array.from(currentGenres).map(g => genreMap[g]);
        filteredData = filteredData.filter(d => selectedGenres.includes(d.primaryGenre));
    }
    
    // Group data by genre, year and calculate total revenue
    const nestedData = d3.rollup(
        filteredData,
        v => d3.sum(v.map(d => d.Worldwide)) / 1000000, 
        d => d.primaryGenre,
        d => d.Year
    );
    
    // Convert to array format
    const lineData = Array.from(nestedData, ([genre, yearData]) => {
        const dataPoints = Array.from(yearData, ([year, revenue]) => ({
            year: year,
            revenue: revenue
        })).sort((a, b) => a.year - b.year);
        
        return {
            genre: genre,
            values: dataPoints
        };
    }).filter(d => d.values.length > 0);
    
    // Chart dimensions
    const margin = { top: 40, right: 100, bottom: 60, left: 80 }; 
    const width = Math.max(500, vizContainer.clientWidth - margin.left - margin.right);
    const height = 400 - margin.top - margin.bottom;
    
    const svg = d3.select("#time-visualization")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear()
        .domain([2000, currentYear])
        .range([0, width]);
    
    const maxRevenue = d3.max(lineData, d => d3.max(d.values, v => v.revenue));
    const yScale = d3.scaleLinear()
        .domain([0, maxRevenue * 1.1])
        .range([height, 0]);
    
    // Line generator (straight lines)
    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.revenue));
    
    // Color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    
    svg.append("g")
        .call(d3.axisLeft(yScale).tickFormat(d => `$${d}M`));
    
    // axis labels
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .text("Total Revenue ($ Millions)");
    
    // lines
    svg.selectAll(".genre-line")
        .data(lineData)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", d => line(d.values))
        .style("stroke", d => colorScale(d.genre));
    
    // Dots
    svg.selectAll(".dot")
        .data(lineData.flatMap(d => d.values.map(v => ({...v, genre: d.genre}))))
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.revenue))
        .attr("r", 4)
        .style("fill", d => colorScale(d.genre))
        .on("mouseover", showTimeTooltip)
        .on("mouseout", hideTimeTooltip);

    // Filter out Unknown genre
    const legendData = lineData.filter(d => d.genre !== 'Unknown');
    
    // If all data was Unknown, use the original data to avoid empty legend
    const finalLegendData = legendData.length > 0 ? legendData : lineData;

    // Legend
    const legend = svg.selectAll(".legend")
        .data(finalLegendData)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 10},${i * 20})`);

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => colorScale(d.genre));

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(d => d.genre);
}

function updateYear(value) {
    const currentYear = parseInt(document.getElementById("yearRange").value);
    document.getElementById('yearVal').textContent = `2000 - ${currentYear}`;

    if (document.getElementById("time").style.display === "block") {
        createTimeVisualization();
    } else if (document.getElementById("place").style.display === "block") {
        createPlaceVisualization(); 
    } else if (document.getElementById("rating").style.display === "block") {
        createRatingVisualization();
    }
}

function showTimeTooltip(event, d) {
    d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px")
        .style("height", "fit-content")
        .html(`${d.genre}<br/>Year: ${d.year}<br/>Revenue: $${d.revenue.toFixed(2)}M`);
}

function hideTimeTooltip() {
    d3.selectAll(".tooltip").remove();
}
// Dot visualization
function createPlaceVisualization() {
    // Hide year slider
    document.getElementById("yearRange").classList.remove("hidden");
    
    // Clear previous visualization
    const placeDiv = document.getElementById("place");
    placeDiv.querySelector("#place-visualization")?.remove();
    
    const vizContainer = document.createElement("div");
    vizContainer.id = "place-visualization";
    vizContainer.className = "visualization-container";
    placeDiv.appendChild(vizContainer);

    const currentYear = parseInt(document.getElementById("yearRange").value);
    
    // Filter data 
    let filteredData = movieData.filter(d => {
        const hasDomestic = !isNaN(d.DomesticPercent) && d.DomesticPercent >= 0;
        const hasForeign = !isNaN(d.ForeignPercent) && d.ForeignPercent >= 0;
        const inYearRange = d.Year >= 2000 && d.Year <= currentYear;
        return (hasDomestic || hasForeign) && inYearRange;
    });
    
    // Apply genre filter
    if (currentGenres.size > 0) {
        const selectedGenres = Array.from(currentGenres).map(g => genreMap[g]);
        filteredData = filteredData.filter(d => selectedGenres.includes(d.primaryGenre));
    }
    
    // Aggregate data by primary genre
    const scatterData = Array.from(
        d3.rollup(
            filteredData,
            v => ({
                domesticPercent: d3.mean(v.filter(d => !isNaN(d.DomesticPercent)), d => d.DomesticPercent) || 0,
                foreignPercent: d3.mean(v.filter(d => !isNaN(d.ForeignPercent)), d => d.ForeignPercent) || 0,
                count: v.length
            }),
            d => d.primaryGenre
        ),
        ([genre, data]) => ({
            genre: genre,
            domesticPercent: data.domesticPercent,
            foreignPercent: data.foreignPercent,
            count: data.count
        })
    ).filter(d => d.count > 0);
    
    // Chart setup
    const margin = { top: 40, right: 120, bottom: 60, left: 80 };
    const width = Math.max(500, vizContainer.clientWidth - margin.left - margin.right);
    const height = 700 - margin.top - margin.bottom;
    
    const svg = d3.select("#place-visualization")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales with fixed 0-100% domain (ensure equal axis lengths)
    const chartSize = Math.min(width, height); 
    const xScale = d3.scaleLinear().domain([0, 100]).range([0, chartSize]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([chartSize, 0]);
    
    // Color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(d => `${d}%`));
    
    svg.append("g")
        .call(d3.axisLeft(yScale).tickFormat(d => `${d}%`));
    
    // Axis labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .text("Average Domestic %");
    
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .text("Average Foreign %");
    
    // Reference line
    svg.append("line")
        .attr("class", "reference-line")
        .attr("x1", xScale(0))
        .attr("y1", yScale(0))
        .attr("x2", xScale(100))
        .attr("y2", yScale(100));
    
    // Dots
    svg.selectAll(".scatter-dot")
        .data(scatterData)
        .enter()
        .append("circle")
        .attr("class", "scatter-dot")
        .attr("cx", d => xScale(d.foreignPercent))
        .attr("cy", d => yScale(d.domesticPercent))
        .attr("r", 8)
        .style("fill", d => colorScale(d.genre))
        .on("mouseover", showScatterTooltip)
        .on("mouseout", hideScatterTooltip);
    
    // Filter out Unknown genre
    const legendData = scatterData.filter(d => d.genre !== 'Unknown');

    // Legend
    const legend = svg.selectAll(".legend")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 10},${i * 20})`);

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => colorScale(d.genre));

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(d => d.genre);
}

function showScatterTooltip(event, d) {
    d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px")
        .style("height", "fit-content")
        .html(`${d.genre}<br/>Domestic: ${d.domesticPercent.toFixed(1)}%<br/>Foreign: ${d.foreignPercent.toFixed(1)}%`);
}

function hideScatterTooltip() {
    d3.selectAll(".tooltip").remove();
}
// Rating vs Revenue visualization (Scatter Plot)
function createRatingVisualization() {
    // Show year slider
    document.getElementById("yearRange").classList.remove("hidden");
    
    // Clear previous visualization
    const ratingDiv = document.getElementById("rating");
    ratingDiv.querySelector("#rating-visualization")?.remove();
    
    const vizContainer = document.createElement("div");
    vizContainer.id = "rating-visualization";
    vizContainer.className = "visualization-container";
    ratingDiv.appendChild(vizContainer);
    
    // Get current year from slider
    const currentYear = parseInt(document.getElementById("yearRange").value);
    
    // Filter data
    let filteredData = movieData.filter(d => 
        d.Rating > 0 && d.Worldwide > 0 && d.Year >= 2000 && d.Year <= currentYear
    );
    
    // Apply genre filter
    if (currentGenres.size > 0) {
        const selectedGenres = Array.from(currentGenres).map(g => genreMap[g]);
        filteredData = filteredData.filter(d => selectedGenres.includes(d.primaryGenre));
    }
    
    // Prepare scatter plot data
    const scatterData = filteredData.map(d => ({
        title: d.Title, 
        genre: d.primaryGenre,
        rating: d.Rating,
        revenue: d.Worldwide / 1000000,
        year: d.Year
    }));
    
    // Chart setup
    const margin = { top: 40, right: 150, bottom: 60, left: 80 };
    const width = Math.max(500, vizContainer.clientWidth - margin.left - margin.right);
    const height = 500 - margin.top - margin.bottom;
    
    const svg = d3.select("#rating-visualization")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear().domain([0, 10]).range([0, width]);
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(scatterData, d => d.revenue) * 1.1])
        .range([height, 0]);
    
    // Color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));
    
    svg.append("g")
        .call(d3.axisLeft(yScale).tickFormat(d => `$${d}M`));
    
    // Axis labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .text("Worldwide Revenue ($ Millions)");
    
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .text("Rating");
    
    // Create dots
    svg.selectAll(".rating-dot")
        .data(scatterData)
        .enter()
        .append("circle")
        .attr("class", "rating-dot")
        .attr("cx", d => xScale(d.rating))
        .attr("cy", d => yScale(d.revenue))
        .attr("r", 4)
        .style("fill", d => colorScale(d.genre))
        .on("mouseover", showRatingTooltip)
        .on("mouseout", hideRatingTooltip);
    
    // Get unique genres and filter out Unknown
    const uniqueGenres = [...new Set(scatterData.map(d => d.genre))].filter(genre => genre !== 'Unknown');
    
    // Create legend data
    const legendData = uniqueGenres.map(genre => ({ genre }));

    // Legend
    const legend = svg.selectAll(".legend")
        .data(legendData)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(${width + 10},${i * 20})`);

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", d => colorScale(d.genre));

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(d => d.genre);
}

function showRatingTooltip(event, d) {
    d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px")
        .style("height", "fit-content")
        .html(`${d.title}<br/>Genre: ${d.genre}<br/>Rating: ${d.rating}<br/>Revenue: $${d.revenue.toFixed(2)}M<br/>Year: ${d.year}`);
}

function hideRatingTooltip() {
    d3.selectAll(".tooltip").remove();
}