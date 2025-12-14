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
            const firstGenre = d.Genres ? d.Genres.split(',')[0].trim() : '';
            d.primaryGenre = firstGenre || '';
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
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(el => {
        el.classList.remove('active');
        el.style.textDecoration = "none";
        el.style.color = "";
    });
    
    // Hide all visualizations
    document.querySelectorAll('.visualization-wrapper').forEach(el => {
        el.classList.add('hidden');
    });
    const rightControls = document.querySelector('.right-controls');
    
    switch (item) {
        case fundsLink:
            // Set active menu
            item.classList.add('active');
            item.style.textDecoration = "underline";
            item.style.color = "white";
            rightControls.style.backgroundColor = "#E1DEDB";
            document.getElementById("funds").classList.remove("hidden");
            createGrossFundsVisualization();
            break;
            
        case placeLink:
            item.classList.add('active');
            item.style.textDecoration = "underline";
            item.style.color = "white";
            rightControls.style.backgroundColor = "#C2C7E4";
            document.getElementById("place").classList.remove("hidden");
            createPlaceVisualization();
            break;
            
        case timeLink:
            item.classList.add('active');
            item.style.textDecoration = "underline";
            item.style.color = "white";
            rightControls.style.backgroundColor = "#B4977E";
            document.getElementById("time").classList.remove("hidden");
            createTimeVisualization();
            break;
            
        case ratingLink:
            item.classList.add('active');
            item.style.textDecoration = "underline";
            item.style.color = "white";
            rightControls.style.backgroundColor = "#F3E0BE";
            document.getElementById("rating").classList.remove("hidden");
            createRatingVisualization();
            break;
    }
}
function genreLinks(genre){
    const element = document.getElementById(genre);

    const hasUnderline = element.style.textDecoration === "underline";

    element.style.textDecoration = hasUnderline ? "none" : "underline";

    element.style.color = hasUnderline ? "black" : "#0078D7";
    
    hasUnderline ? currentGenres.delete(genre) : currentGenres.add(genre);
    
    if (!document.getElementById("funds").classList.contains("hidden")) {
        createGrossFundsVisualization();
    } else if (!document.getElementById("time").classList.contains("hidden")) {
        createTimeVisualization();
    } else if (!document.getElementById("place").classList.contains("hidden")) {
        createPlaceVisualization();
    } else if (!document.getElementById("rating").classList.contains("hidden")) {
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
    
    if (!document.getElementById("funds").classList.contains("hidden")) {
        createGrossFundsVisualization();
    } else if (!document.getElementById("time").classList.contains("hidden")) {
        createTimeVisualization();
    } else if (!document.getElementById("place").classList.contains("hidden")) {
        createPlaceVisualization();
    } else if (!document.getElementById("rating").classList.contains("hidden")) {
        createRatingVisualization();
    }
}

// Gross Funds visualization
function createGrossFundsVisualization() {
    // Hide year slider for this visualization
    document.getElementById("yearRange").classList.add("hidden");
    document.querySelector(".year").classList.add("hidden");

    const yearFilterTitle = document.querySelector(".right-controls h3");
    if (yearFilterTitle) {
        yearFilterTitle.classList.add("hidden");
    }
    
    // Clear previous visualization
    const fundsDiv = document.getElementById("funds");
    fundsDiv.querySelector("#funds-visualization")?.remove();
    
    const vizContainer = document.createElement("div");
    vizContainer.id = "funds-visualization";
    vizContainer.className = "visualization-container";
    fundsDiv.appendChild(vizContainer);
    
    // Filter and process data
    let filteredData = movieData.filter(d => d.Worldwide > 0 && d.primaryGenre !== '');
    
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
    const margin = { top: 40, right: 120, bottom: 80, left: 80 };
    const width = Math.max(500, vizContainer.clientWidth - margin.left - margin.right);
    const height = 600 - margin.top - margin.bottom;
    
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
        .style("text-anchor", "middle")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "14px");
    
    svg.append("g")
        .call(d3.axisLeft(yScale).tickFormat(d => `$${d}M`))
        .style("font-size", "14px");
    
    // Labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .text("Average Revenue ($ Millions)");

    svg.append("text")
    .attr("class", "axis-label")
    .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
    .text("Movie Genres");
    
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
        .html(`<strong>${d.genre}</strong><br/>Avg: $${d.revenue.toFixed(2)}M`);
}

function hideTooltip() {
    d3.select(this).style("fill", "steelblue");
    d3.selectAll(".tooltip").remove();
}

// Time visualization (Line Chart)
function createTimeVisualization() {
    // Show year slider
    document.getElementById("yearRange").classList.remove("hidden");
    document.querySelector(".year").classList.remove("hidden");

    const yearFilterTitle = document.querySelector(".right-controls h3");
    if (yearFilterTitle) {
        yearFilterTitle.classList.remove("hidden");
    }
    
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
    let filteredData = movieData.filter(d => d.Worldwide > 0 && d.Year >= 2000 && d.Year <= currentYear && d.primaryGenre !== '');
    
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
    const margin = { top: 40, right: 120, bottom: 60, left: 100 }; 
    const width = Math.max(500, vizContainer.clientWidth - margin.left - margin.right);
    const height = 650 - margin.top - margin.bottom;
    
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
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
        .style("font-size", "14px");
    
    svg.append("g")
        .call(d3.axisLeft(yScale).tickFormat(d => `$${d}M`))
        .style("font-size", "14px");
    
    // axis labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 10)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .text("Total Revenue ($ Millions)");

    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", `translate(${width / 2}, ${height + margin.bottom - 10})`)
        .text("Year");
    
    // lines
    svg.selectAll(".genre-line")
        .data(lineData)
        .enter()
        .append("path")
        .attr("class", "genre-line")
        .attr("d", d => line(d.values))
        .style("stroke", d => colorScale(d.genre))
        .on("mouseover", function(event, d) {
            d3.select(this)
                .classed("genre-line-highlighted", true);
            
            d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px")
                .style("height", "fit-content")
                .html(`<strong>${d.genre}</strong><br/>Total Revenue: $${d3.sum(d.values, v => v.revenue).toFixed(2)}M`);
        })
        .on("mouseout", function() {
            d3.select(this)
                .classed("genre-line-highlighted", false);
            
            d3.selectAll(".tooltip").remove();
        });
    
    
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
        .on("mouseout", hideTimeTooltip)
        .on("mouseenter", function() {
            d3.event.stopPropagation();
        });


    // Legend
    const legendData = lineData.map(d => ({ genre: d.genre }));
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

function updateYear(value) {
    const currentYear = parseInt(document.getElementById("yearRange").value);
    document.getElementById('yearVal').textContent = `2000 - ${currentYear}`;
    const yearFilterTitle = document.querySelector(".right-controls h3");

    if (!document.getElementById("time").classList.contains("hidden")) {
        createTimeVisualization();
        if (yearFilterTitle) yearFilterTitle.classList.remove("hidden");
    } else if (!document.getElementById("place").classList.contains("hidden")) {
        createPlaceVisualization();
        if (yearFilterTitle) yearFilterTitle.classList.remove("hidden");
    } else if (!document.getElementById("rating").classList.contains("hidden")) {
        createRatingVisualization();
        if (yearFilterTitle) yearFilterTitle.classList.remove("hidden");
    }
}

function showTimeTooltip(event, d) {
    if (event) event.stopPropagation();
    d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px")
        .style("height", "fit-content")
        .html(`<strong>${d.genre}</strong><br/>Year: ${d.year}<br/>Revenue: $${d.revenue.toFixed(2)}M`);
}

function hideTimeTooltip() {
    d3.selectAll(".tooltip").remove();
}
// Dot visualization
function createPlaceVisualization() {
    // Hide year slider
    document.getElementById("yearRange").classList.remove("hidden");
    document.querySelector(".year").classList.remove("hidden");

    const yearFilterTitle = document.querySelector(".right-controls h3");
    if (yearFilterTitle) {
        yearFilterTitle.classList.remove("hidden");
    }
    
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
        const hasGenre = d.primaryGenre !== '';
        return (hasDomestic || hasForeign) && inYearRange && hasGenre;
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
    const height = 650 - margin.top - margin.bottom;
    
    const svg = d3.select("#place-visualization")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    
    // Scales with fixed 0-100% domain (ensure equal axis lengths)
    const chartSize = Math.min(width, height); 
    const xScale = d3.scaleLinear().domain([20, 80]).range([0, chartSize]);
    const yScale = d3.scaleLinear().domain([20, 80]).range([chartSize, 0]);
    
    const xOffset = (width - chartSize) / 2;
    // Color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    
    // Axes
    svg.append("g")
        .attr("transform", `translate(${xOffset},${chartSize})`) 
        .call(d3.axisBottom(xScale).tickFormat(d => `${d}%`))
        .style("font-size", "14px");
    
    svg.append("g")
        .attr("transform", `translate(${xOffset},0)`)
        .call(d3.axisLeft(yScale).tickFormat(d => `${d}%`))
        .style("font-size", "14px");
    
    // Axis labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + xOffset)
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
        .attr("x1", xScale(20) + xOffset)
        .attr("y1", yScale(20))
        .attr("x2", xScale(80) + xOffset)
        .attr("y2", yScale(80));

    // Dots
    svg.selectAll(".scatter-dot")
        .data(scatterData)
        .enter()
        .append("circle")
        .attr("class", "scatter-dot")
        .attr("cx", d => xScale(d.foreignPercent) + xOffset)
        .attr("cy", d => yScale(d.domesticPercent))
        .attr("r", 8)
        .style("fill", d => colorScale(d.genre))
        .on("mouseover", showScatterTooltip)
        .on("mouseout", hideScatterTooltip);

    // Legend
    const legendData = scatterData.map(d => ({ genre: d.genre }));
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
        .html(`<strong>${d.genre}</strong><br/>Domestic: ${d.domesticPercent.toFixed(1)}%<br/>Foreign: ${d.foreignPercent.toFixed(1)}%`);
}

function hideScatterTooltip() {
    d3.selectAll(".tooltip").remove();
}
// Rating vs Revenue visualization (Scatter Plot)
function createRatingVisualization() {
    // Show year slider
    document.getElementById("yearRange").classList.remove("hidden");
    document.querySelector(".year").classList.remove("hidden");

    const yearFilterTitle = document.querySelector(".right-controls h3");
    if (yearFilterTitle) {
        yearFilterTitle.classList.remove("hidden");
    }
    
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
        d.Rating > 0 && d.Worldwide > 0 && d.Year >= 2000 && d.Year <= currentYear && d.primaryGenre !== ''
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
    const margin = { top: 40, right: 120, bottom: 60, left: 100 };
    const width = Math.max(500, vizContainer.clientWidth - margin.left - margin.right);
    const height = 650 - margin.top - margin.bottom;
    
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
        .call(d3.axisBottom(xScale))
        .style("font-size", "14px");
    
    svg.append("g")
        .call(d3.axisLeft(yScale).tickFormat(d => `$${d}M`))
        .style("font-size", "14px");
    
    // Axis labels
    svg.append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 10)
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

    // Legend
    const uniqueGenres = [...new Set(scatterData.map(d => d.genre))];
    const legendData = uniqueGenres.map(genre => ({ genre }));
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
        .html(`<strong>${d.title}</strong><br/>Genre: ${d.genre}<br/>Rating: ${d.rating}<br/>Revenue: $${d.revenue.toFixed(2)}M<br/>Year: ${d.year}`);
}

function hideRatingTooltip() {
    d3.selectAll(".tooltip").remove();
}