var eightyPercent = 0.8;
var sixtyPercent = 0.6;
var tenPercent = 0.1;
var fivePercent = 0.05;
var aTinyBit = 0.02;
var half = 0.5;

var selectedCities = [];
var capitalCitiesList = [];
var capitalCityButtons;
var httpResponseData;
var cityANDtemp_pairs = [];
//var graphCanvasWidth = 800;
//var graphCanvasHeight = 500;
var maxCitiesChoice = 7;
var myCanvas;

function doNothing(){}

window.addEventListener("load", start, false);
function start(){
    document.getElementById("showGraph").addEventListener("click", showGraph, false);
}

      function resizeCanvas() {
        // Set up temporary canvas
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = myCanvas.width;
        tempCanvas.height = myCanvas.height;
        tmpCtx = tempCanvas.getContext('2d');

        // Copy to temporary canvas
        tmpCtx.drawImage(myCanvas, 0, 0);

        // Resize original canvas
        myCanvas.width = window.innerWidth;
        myCanvas.height = window.innerHeight/2;

        // Copy back to resized canvas
        ctx = myCanvas.getContext('2d');
        ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, myCanvas.width, myCanvas.height);
      }

function drawANDlabel_bars(dataSet){
    var ctx = myCanvas.getContext("2d");
    var maximumMagnitudeTemperature = 0;
    for (var i=0; i < dataSet.length; i++){
        if (Math.abs(dataSet[i].temperature) > Math.abs(maximumMagnitudeTemperature))
            maximumMagnitudeTemperature = Math.abs(dataSet[i].temperature);
    }
    var referencePoint = new point(myCanvas.width/2, aTinyBit*myCanvas.height);
    var oneDegreeDistance = (sixtyPercent * myCanvas.width/2) / maximumMagnitudeTemperature;
    for (var i=0; i < dataSet.length; i++){
        var barHeight = eightyPercent * myCanvas.height/dataSet.length;
        if (dataSet[i].temperature >= 0){
            var width = oneDegreeDistance * dataSet[i].temperature;
            var position = new point(referencePoint.x, referencePoint.y + i*myCanvas.height/dataSet.length);
        }
        if (dataSet[i].temperature < 0){
            var width = Math.abs(oneDegreeDistance * dataSet[i].temperature);
            var position = new point(referencePoint.x - width, referencePoint.y + i*myCanvas.height/dataSet.length);
        }
        ctx.fillStyle = "blue";
        ctx.fillRect(position.x, position.y, width, barHeight);
        ctx.fillStyle = "red";
        ctx.font = barHeight/3 + "px Georgia";
        ctx.fillText(dataSet[i].name + " =  " + dataSet[i].temperature.toFixed(2) + "  Celsius", 
                     aTinyBit*myCanvas.width, position.y + barHeight/2);    
    }
}

function showGraph(){
    document.getElementById("showGraph").disabled = true;
    for (var i=0; i < selectedCities.length; i++){
        getSpecifiedJSONdata(selectedCities[i]);
    }
    document.getElementById("graphArea").innerHTML = "";
    myCanvas = document.createElement("CANVAS");
    myCanvas.width = window.innerWidth;
    myCanvas.height = window.innerHeight/2;

          window.addEventListener('resize', resizeCanvas, false);

    myCanvas.style.border = "blue 1px solid";
    document.getElementById("graphArea").appendChild(myCanvas);
    var alertOutput = "";
    for (var i=0; i < cityANDtemp_pairs.length; i++){
        alertOutput += "cityANDtemp_pairs[" + i + "] = " + cityANDtemp_pairs[i].name + 
                       ";   " + cityANDtemp_pairs[i].temperature.toFixed(2) + "\n";
    }
    alertOutput += "\n" + "cityANDtemp_pairs.length = " + cityANDtemp_pairs.length;
    alertOutput += "\n" + "highest temperature = " + 
                    highestTemperature(cityANDtemp_pairs).toFixed(2);
    alertOutput += "\n" + "lowest temperature = " + 
                    lowestTemperature(cityANDtemp_pairs).toFixed(2);
//    alert(alertOutput);
    drawANDlabel_bars(cityANDtemp_pairs);
}

function reset(){
    selectedCities = [];
    cityANDtemp_pairs = [];
    document.getElementById("graphArea").innerHTML = "";
    for (var i=0; i < capitalCityButtons.length; i++){
        capitalCityButtons[i].disabled = false;
    }
    document.getElementById("showGraph").disabled = false;
}

function displaySelectedCities(){
    var out = "selected cities are: \n\n";
    for (var k = 0; k < selectedCities.length; k++){
        out += selectedCities[k] + "\n";
    }
//    alert(out);
}

function seeSelectedCitiesData(){
    var alertOutput = "\n";
    for (var i=0; i < cityANDtemp_pairs.length; i++){
        alertOutput += "cityANDtemp_pairs[" + i + "] = " + cityANDtemp_pairs[i].name + 
                       ";   " + cityANDtemp_pairs[i].temperature.toFixed(2) + "\n";
    }
//    alert(alertOutput);
}

function getSpecifiedJSONdata(city) {
    htmldata = "http://api.openweathermap.org/data/2.5/weather?q=" + 
               city +
               "&APPID=e5ad443bc533ac62f15e6b83655ca6b7";
    var parsedData;
    
    var xhttp = new XMLHttpRequest();
    xhttp.open("GET", htmldata, false);
    xhttp.send();
    httpResponseData = xhttp.responseText;
    parsedData = JSON.parse(httpResponseData);
    var cityDataObject = new cityData(parsedData.name, parsedData.main.temp - 273);
    document.getElementById("dataDisplayArea").innerHTML = 
            "&nbsp;&nbsp; (incoming data: &nbsp;" + 
            parsedData.name + ",  " + parsedData.main.temp.toFixed(2) + ": Kelvin)";
    cityANDtemp_pairs.push(cityDataObject);
} // end of: getSpecifiedJSONdata()

function cityData(name, temperature) {
    this.name = name; 
    this.temperature = temperature;
    this.changeName = function (newName) {
        this.cityName = newName;
    };
}

function addCapitalCityButtons(){
    var xmlhttp = new XMLHttpRequest();
    var myURL = "countriesAndCapitalCitiesV2.json";
    var jsonData;

    document.getElementById("showCapitalCityButtons").disabled = true;
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            jsonData = JSON.parse(xmlhttp.responseText);
            setCapitalCitiesList();
            addTheButtons();
        }
    };
    xmlhttp.open("GET", myURL, true);
    xmlhttp.send();
    
    function setCapitalCitiesList(){
        for (var i=0; i < jsonData.length; i++){
            capitalCitiesList.push(jsonData[i].capital);
        }
       capitalCitiesList.sort();
    }
    function addTheButtons(){
        var buttonsPerRow = 10;
        var number_ofRows;
        capitalCityButtons = [];
        var theButtonsText = [];
        var myTable = document.createElement("TABLE");
        var rows = [];
        var rowCells = [buttonsPerRow];    

        document.getElementById("tablePosition").innerHTML = "";
        number_ofRows = Math.ceil(capitalCitiesList.length / buttonsPerRow);
        document.getElementById("tablePosition").appendChild(myTable);
        for (var i=0; i < number_ofRows; i++){
            rows.push(myTable.insertRow(-1));
        }
        var counter = 0;
        for (var j=0; j < number_ofRows; j++){
            for (var i=0; i < buttonsPerRow; i++){
                capitalCityButtons.push(document.createElement("button"));
                theButtonsText.push( document.createTextNode(capitalCitiesList[counter]) );
                capitalCityButtons[counter].appendChild(theButtonsText[counter]);
                rowCells[i] = rows[j].insertCell(i);
                rowCells[i].appendChild(capitalCityButtons[counter]);
                capitalCityButtons[counter].addEventListener("click", bindClick(counter));
                capitalCityButtons[counter].setAttribute("class", "btn btn-primary");
                counter++;
            }
        }
        function bindClick(j){ return function(){
                                            if (selectedCities.length < maxCitiesChoice){
                                                selectedCities.push(capitalCitiesList[j]);
                                                capitalCityButtons[j].disabled = true;
                                            } else {
                                                alert("choices limit reached");
                                            }
                                      };
        }
    }
} // end of: addIngredientButtons()

window.addEventListener("load", addAction_toAddCapitalCityButtons, false);

function addAction_toAddCapitalCityButtons(){
    document.getElementById("showCapitalCityButtons").addEventListener("click", addCapitalCityButtons, false);
}

function point(x, y){
    this.x = x;
    this.y = y;
}

function highestTemperature(list){
    var highest = list[0].temperature;
    for (var i=1; i < list.length; i++){
        if (list[i].temperature > highest){
            highest = list[i].temperature;
        }
    }
    return highest;
}
function lowestTemperature(list){
    var lowest = list[0].temperature;
    for (var i=1; i < list.length; i++){
        if (list[i].temperature < lowest){
            lowest = list[i].temperature;
        }
    }
    return lowest;
}

function allPositives(list){
    var out = "hallo from 'allPositives()' \n";
    out += "list.length = " + list.length + "\n";
    var allPositives = true;
    var i = 0;
    out += "allPositives = " + allPositives + "\n";
    out += "i = " + i + "\n";
    out += "list[i].temperature = " + "\n";
//    alert(out);
    while ( (allPositives === true) && (i < list.length) ){
        if (list[i].temperature < 0) allPositives = false;
        i++;
    }
//    out += "allPositives = " + allPositives + "\n";
    return allPositives;
}

function allNegatives(list){
    var out = "hallo from 'allNegatives()' \n";
    out += "list.length = " + list.length;
//    alert(out);
    var allNegatives = true;
    var i = 0;
    while ( (allNegatives === true) && (i < list.length) ){
        if (list[i].temperature > 0) allNegatives = false;
        i++;
    }
    return allNegatives;
}


// legacy code follows
//////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
//function loadData() {
//    //GET City Value from user
////    cityval = document.getElementById('thecity').value;
//    htmldata = "http://api.openweathermap.org/data/2.5/weather?q=" + 
//               selectedCities[0] +
//               "&mode=html&APPID=e5ad443bc533ac62f15e6b83655ca6b7";
////    htmldata = "http://api.openweathermap.org/data/2.5/weather?q=London&APPID=e5ad443bc533ac62f15e6b83655ca6b7";
////    htmldata = "http://api.openweathermap.org/data/2.5/weather?q=London&mode=html&APPID=e5ad443bc533ac62f15e6b83655ca6b7";
//    //STORE City in the string
////    htmldata = "http://api.openweathermap.org/data/2.5/weather?q=" + cityval + "&mode=html&APPID=e5ad443bc533ac62f15e6b83655ca6b7";
//    //htmldata = "http://api.openweathermap.org/data/2.5/weather?q=" + cityval + "&mode=html&APPID=afe24dbc851567b6dd99613b06c61f1f";
////    htmldata = "someWeatherData.json";
//    
//  var xhttp = new XMLHttpRequest();
//  xhttp.onreadystatechange = function() {
//      if (xhttp.readyState === 4 && xhttp.status === 200) {
//          httpResponseData = xhttp.responseText;
//          document.getElementById("demo").innerHTML = httpResponseData;
//          var parsedData = JSON.parse(httpResponseData);
//          document.getElementById("testOutputArea").innerHTML = parsedData.base + "<br>" + parsedData.name;
//          document.getElementById("testOutputArea").innerHTML = "HALLO WORLD!!";
//      }
//  };
//  xhttp.open("GET", htmldata, true);
//  xhttp.send();
//}
//
//function getSpecifiedJSONdata_oldVerion(city) {
//    htmldata = "http://api.openweathermap.org/data/2.5/weather?q=" + 
//               city +
//               "&APPID=e5ad443bc533ac62f15e6b83655ca6b7";
//    var parsedData;
//    
//    var xhttp = new XMLHttpRequest();
//    xhttp.onreadystatechange = function() {
//        if (xhttp.readyState === 4 && xhttp.status === 200) {
//            httpResponseData = xhttp.responseText;
//            document.getElementById("testOutputArea").innerHTML = httpResponseData;
//            parsedData = JSON.parse(httpResponseData);
//            var temperature = (parseFloat(parsedData.main.temp) - 273).toFixed(2);
//            document.getElementById("testOutputArea").innerHTML = 
//                    "city: " + parsedData.name + 
//                    "&nbsp;&nbsp;&nbsp;&nbsp; temperature: " + 
//                    temperature;
//            var cityDataObject = new cityData(parsedData.name, parsedData.main.temp - 273);
//            cityANDtemp_pairs.push(cityDataObject);
//        }
//    };
//    xhttp.open("GET", htmldata, true);
//    xhttp.send();
//} // end of: getSpecifiedJSONdata_oldVerion()
