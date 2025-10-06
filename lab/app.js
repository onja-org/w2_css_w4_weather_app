function filterCities() {
    const input = document.getElementById("cityInput").value.toLowerCase();
    const suggestions = document.getElementById("suggestions");
    suggestions.innerHTML = "";
  
    if (!input) {
      suggestions.style.display = "none";
      return;
    }
  
    const matches = weatherData.filter(item =>
      item.city.toLowerCase().startsWith(input)
    );
  
    if (matches.length === 0) {
      suggestions.style.display = "none";
      return;
    }
  
    matches.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item.city;
      li.onclick = () => {
        document.getElementById("cityInput").value = item.city;
        suggestions.innerHTML = "";
        suggestions.style.display = "none";
      };
      suggestions.appendChild(li);
    });
  
    suggestions.style.display = "block";
}
  
function getWeather() {
const city = document.getElementById("cityInput").value.trim().toLowerCase();
const result = weatherData.find(item => item.city.toLowerCase() === city);

const weatherDiv = document.getElementById("weatherInfo");

if (result) {
    weatherDiv.innerHTML = `
    <h2>${result.city}, ${result.country}</h2>
    <p><strong>${result.weather}</strong> - ${result.description}</p>
    <p>🌡️ ${result.temp} °C</p>
    <img src="https://openweathermap.org/img/wn/${result.icon}@2x.png" />
    `;
} else {
    weatherDiv.innerHTML = `<p style="color:red;">City not found in our Madagascar data.</p>`;
}
}

  
document.addEventListener("click", function (e) {
    if (!document.querySelector(".dropdown").contains(e.target)) {
        document.getElementById("suggestions").style.display = "none";
    }
});
  