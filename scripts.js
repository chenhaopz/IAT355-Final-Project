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
    'war': 'War', 'western': 'Western'
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', loadDataAndInitialize);

// Load CSV data and initialize visualizations
async function loadDataAndInitialize() {
        movieData = await d3.csv("./dataset/movies_box_office.csv");
        console.log("Data loaded:", movieData.length, "records");
        
        // Process data
        movieData.forEach(d => {
            d.primaryGenre = d.Genres ? d.Genres.split(',')[0].trim() : 'Unknown';
            d.Worldwide = +(d.Worldwide || d.worldwide || d['$Worldwide'] || 0);
        });
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
        break;

    case timeLink:
        noLine();
        showNone()

        document.getElementById("backRight").style.backgroundColor = "#B4977E";
        
        const tl = document.getElementById("timeLink");
        tl.style.textDecoration = "underline";
        tl.style.color = "#0078D7";

        document.getElementById("time").style.display = "block";
        break;

    case ratingLink:
        noLine();
        showNone()

        document.getElementById("backRight").style.backgroundColor = "#F3E0BE";
        
        const rl = document.getElementById("ratingLink");
        rl.style.textDecoration = "underline";
        rl.style.color = "#0078D7";

        document.getElementById("rating").style.display = "block";
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
    }
}

function genreLine(state){
    const genres = [
        "action", "adventure", "comedy", "crime", "doc", "drama", "family",
        "history", "horror", "music", "mystery", "romance", "sci-fi",
        "thriller", "war", "western"
    ];

    const underline = state === "on";
    genres.forEach(id => {
        document.getElementById(id).style.textDecoration = underline ? "underline" : "none";
        
        document.getElementById(id).style.color = underline ? "#0078D7" : "black";

        underline ? currentGenres.add(id) : currentGenres.delete(id);
    });
    
    if (document.getElementById("funds").style.display === "block") {
        createGrossFundsVisualization();
    }
}

// Create Gross Funds visualization
function createGrossFundsVisualization() {
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
        .style("text-anchor", "middle")
        .text("Average Revenue ($ Millions)");
    
    // Bars with tooltips
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
        .style("position", "absolute")
        .style("background", "white")
        .style("padding", "5px")
        .style("border", "1px solid #ccc")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px")
        .html(`${d.genre}<br/>Avg: $${d.revenue.toFixed(2)}M`);
}

function hideTooltip() {
    d3.select(this).style("fill", "steelblue");
    d3.selectAll(".tooltip").remove();
}