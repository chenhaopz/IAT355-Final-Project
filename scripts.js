

function changeColour(item){
    switch (item) {   
    case fundsLink:
        noLine();
        showNone()

        document.getElementById("backRight").style.backgroundColor = "#E1DEDB";
        
        document.getElementById("fundsLink").style.textDecoration = "underline";

        document.getElementById("funds").style.display = "block";
        break;

    case placeLink:
        noLine();
        showNone()

        document.getElementById("backRight").style.backgroundColor = "#C2C7E4";
        
        document.getElementById("placeLink").style.textDecoration = "underline";

        document.getElementById("place").style.display = "block";
        break;

    case timeLink:
        noLine();
        showNone()

        document.getElementById("backRight").style.backgroundColor = "#B4977E";
        
        document.getElementById("timeLink").style.textDecoration = "underline";

        document.getElementById("time").style.display = "block";
        break;

    case ratingLink:
        noLine();
        showNone()

        document.getElementById("backRight").style.backgroundColor = "#F3E0BE";
        
        document.getElementById("ratingLink").style.textDecoration = "underline";

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
    
    document.getElementById("timeLink").style.textDecoration = "none";
    
    document.getElementById("placeLink").style.textDecoration = "none";
    
    document.getElementById("ratingLink").style.textDecoration = "none";
}

function genreLinks(genre){
    document.getElementById(genre).style.textDecoration = "underline";
}

function genreLine(state){
  const genres = [
    "action", "adventure", "comedy", "crime", "doc", "drama", "family",
    "history", "horror", "music", "mystery", "romance", "sci-fi",
    "thriller", "war", "western"
  ];

  if(state == "on"){
    genres.forEach(id => document.getElementById(id).style.textDecoration = "underline");
  }else{
    genres.forEach(id => document.getElementById(id).style.textDecoration = "none");
  }
  
}


