var wrapper = document.querySelector(".wrapper"); 

var start = document.querySelector("#init")

var recentsearches = [

]
var forecast = document.querySelector("#day")


function init(){
    if (JSON.parse(localStorage.getItem('cities'))!==null) {

        recentsearches = JSON.parse(localStorage.getItem('cities'))

    }
    start.textContent = "Search for a city:"
    const textInput = document.createElement('input')
    textInput.id = "City"
    start.appendChild(textInput)
    const btn = document.createElement('button')
    btn.textContent = "Search"
    start.appendChild(btn)
}

wrapper.addEventListener("click", function(event){
    var element = event.target;
    console.log(element);
    event.preventDefault();

    if(element.innerHTML === "Search"){
        console.log('search pressed')
        recentsearches.unshift(document.querySelector('#City').value)
        recentsearches.splice(5)
        localStorage.setItem('cities', JSON.stringify(recentsearches))
        for(var i = 0; i <= 4; i++){
            const btn = document.createElement('button')
            btn.id = 'recentcities'
            btn.textContent = recentsearches[i]
            start.appendChild(btn)
            

        }
        console.log(recentsearches)
    }
    
})
 
function showResults1(event){
    forecast.textContent = "5-Day Forecast:"
}

function showResults(event){
    
}

async function getWeather(cityName,key){
    var url = 'api.openweathermap.org/data/2.5/weather?q={' + cityName + '}&appid={' + key + '}'
 
    const response = await fetch(url)
    if (!response.ok)
}




init()

showResults1()



var APIKey = '8ea4031b309d23bcde8d56cade6b514b';

//var APIKey1 = 
