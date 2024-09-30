import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  constructor(
    public city: string,
    public date: string,
    public icon: string,
    public iconDescription: string,
    public tempF: number,
    public windSpeed: number,
    public humidity: number,
  ) {}
}

// Complete the WeatherService class
class WeatherService {
  private baseURL: string;
  private apiKey: string;

  constructor() {
    this.baseURL = process.env.API_BASE_URL!;
    this.apiKey = process.env.API_KEY!;
  }

  // Build geocode query method
  private buildGeocodeQuery(city: string): string {
    return `${this.baseURL}/geo/1.0/direct?q=${city}&limit=1&appid=${this.apiKey}`;
  }

  // Build weather query method
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `${this.baseURL}/data/2.5/forecast?lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=imperial`;
  }

  // Fetch location data
  private async fetchLocationData(query: string): Promise<Coordinates> {
    const response = await fetch(this.buildGeocodeQuery(query));
    const data = await response.json();
    return this.destructureLocationData(data);
  }

  // Destructure the location data
  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData.lat,
      lon: locationData.lon,
    };
  }

  // Fetch weather data
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const response = await fetch(this.buildWeatherQuery(coordinates));
    return response.json();
  }

  // Parse current weather from the API response
  private parseCurrentWeather(response: any): Weather {
    const currentData = response.list[0];
    return new Weather(
      response.city.name,
      new Date(currentData.dt * 1000).toLocaleDateString(),
      currentData.weather[0].icon,
      currentData.weather[0].description,
      currentData.main.temp,
      currentData.wind.speed,
      currentData.main.humidity,
    );
  }

  // Build forecast array method
  private buildForecastArray(currentWeather: Weather, weatherData: any[]): Weather[] {
    return weatherData.map(data => new Weather(
      currentWeather.city,
      new Date(data.dt * 1000).toLocaleDateString(),
      data.weather[0].icon,
      data.weather[0].description,
      data.main.temp,
      data.wind.speed,
      data.main.humidity,
    ));
  }

  // Get weather for a specific city
  async getWeatherForCity(city: string): Promise<Weather[]> {
    const coordinates = await this.fetchLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);
    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastArray = this.buildForecastArray(currentWeather, weatherData.list.slice(1));
    return [currentWeather, ...forecastArray];
  }
}

export default new WeatherService();
