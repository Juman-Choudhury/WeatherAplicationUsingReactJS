import React, { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import { WiHumidity, WiStrongWind, WiBarometer } from "react-icons/wi";
import { FaTemperatureFull } from "react-icons/fa6";
import InfoCard from "./component/metaInfo";
import Cities from "./component/cities";

const Weather = () => {
  const [cities, setCities] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [searchCity, setSearchCity] = useState("Nalbari");
  const [weatherInfo, setWeatherInfo] = useState({
    city: "",
    country: "",
    status: "",
    temp: null,
    minTemp: null,
    maxTemp: null,
    feelsLike: null,
    humidity: null,
    windSpeed: null,
    pressure: null,
    dateTime: "",
    icon: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  // Kelvin → Celsius
  const toC = (k) => (k - 273.15).toFixed(1);

  // Capitalize each word, trim extra spaces
  const capitalizeInput = (s) =>
       s
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");

  // Format Unix + timezone → human date
  const formatUnixTimestamp = (dt, tz) =>
    new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    }).format(new Date((dt + tz) * 1000));

  // Fetch weather for a given city
  const getWeather = async (city = searchCity) => {
    setLoading(true);
    setError(null);
    const apiKey = import.meta.env.VITE_API_KEY;

    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`
      );
      const data = await res.json();

      if (data.cod && data.cod !== 200) {
        throw new Error(data.message || "City not found");
      }

      const region = new Intl.DisplayNames(["en"], { type: "region" }).of(
        data.sys.country
      );

      setWeatherInfo({
        city: data.name,
        country: region,
        status: data.weather[0].main,
        temp: toC(data.main.temp),
        minTemp: toC(data.main.temp_min),
        maxTemp: toC(data.main.temp_max),
        feelsLike: toC(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        pressure: data.main.pressure,
        dateTime: formatUnixTimestamp(data.dt, data.timezone),
        icon: data.weather[0].icon,
      });
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Debounced Nominatim lookup
  const searchCityBasedOnUserInput = async () => {
    const query = capitalizeInput(userInput);
    if (!query) return;
    if (query === searchCity && query !== "Nalbari") return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5`,
        { headers: { "User-Agent": "YourApp/1.0 (you@you.com)" } }
      );
      const data = await res.json();
      const names = [
        ...new Set(data.filter((d) => d.name).map((d) => d.name).concat(query)),
      ];
      setCities(names);
    } catch (err) {
      console.error("Geocode error:", err);
    }
  };
  
  // Called when user picks a city from dropdown or presses Enter
  const handleSearch = (city) => {
    console.log(city);
    
    const val = city || userInput.trim();
    if (!val) return;
    setUserInput(val);
    setSearchCity(val);
    setCities([]);
    
  };

  // Effect: debounce userInput → city suggestions
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(searchCityBasedOnUserInput, 800);
    return () => clearTimeout(debounceRef.current);
  }, [userInput]);

  // Effect: fetch weather when searchCity changes
  useEffect(() => {
    if (searchCity) getWeather(searchCity);
  }, [searchCity]);


  return (
    <section className="weater-main container">
      <div className="user-input">
        <FaSearch className="search-icon" aria-hidden onClick={()=>handleSearch(userInput)}/>
        <input
          type="text"
          placeholder="Search your city here..."
          aria-label="Search city"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch(userInput);
          }}
        />

        {cities.length > 0 && userInput && (
          <ul>
            {cities.map((c) => (
              <Cities key={c} city={c} getCity={handleSearch} />
            ))}
          </ul>
        )}
      </div>

      {loading ? (
        <div className="overall-loading">Loading weather data...</div>
      ) : error ? (
        <div className="overall-loading">Error: {error}</div>
      ) : weatherInfo.city ? (
        <>
          <div className="weather-data">
            <div className="main-weather--data">
              <div className="city-name">
                {weatherInfo.city}, {weatherInfo.country}
              </div>
              <div className="city-date">{weatherInfo.dateTime}</div>
              <div className="city-weather--status">
                {weatherInfo.status}
              </div>
              <div className="weather-icon">
                <img
                  src={`https://openweathermap.org/img/wn/${weatherInfo.icon}@2x.png`}
                  alt={weatherInfo.status}
                  className="weather-icon"
                />
              </div>
              <div className="city-temp">{weatherInfo.temp}°C</div>
              <div className="city-minMax--temp">
                <span>min: {weatherInfo.minTemp}°C</span>
                <span>max: {weatherInfo.maxTemp}°C</span>
              </div>
            </div>
          </div>

          <div className="meta-info--card">
            <InfoCard
              icon={FaTemperatureFull}
              label="Feels Like"
              value={weatherInfo.feelsLike}
              unit="°C"
            />
            <InfoCard
              icon={WiHumidity}
              label="Humidity"
              value={weatherInfo.humidity}
              unit="%"
            />
            <InfoCard
              icon={WiStrongWind}
              label="Wind Speed"
              value={weatherInfo.windSpeed}
              unit=" m/s"
            />
            <InfoCard
              icon={WiBarometer}
              label="Pressure"
              value={weatherInfo.pressure}
              unit=" hPa"
            />
          </div>
        </>
      ) : null}
    </section>
  );
};

export default Weather;
