import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

// Define a City class with name and id properties
class City {
  id: string;
  name: string;

  constructor(name: string) {
    this.id = uuidv4(); // Generate a unique ID for each city
    this.name = name;
  }
}

// Complete the HistoryService class
class HistoryService {
  private filePath: string;

  constructor() {
    // Use import.meta.url to get the current directory in ES modules
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
      
    // Define the path to the searchHistory.json file
    this.filePath = path.join(__dirname, 'data', 'searchHistory.json');
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, "[]", 'utf8');  // Initialize with an empty array
      console.log(`File created at: ${this.filePath}`);
    } else {
      console.log(`File already exists at: ${this.filePath}`);
    }
  }

  // Define a read method that reads from the searchHistory.json file
  private async read(): Promise<City[]> {
    return new Promise((resolve, reject) => {
      fs.readFile(this.filePath, 'utf-8', (err, data) => {
        if (err) {
          reject(`Error reading file: ${err.message}`);
        } else {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (err) {
            reject(`Error parsing JSON: ${err}`);
          }
        }
      });
    });
  }

  // Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.writeFile(this.filePath, JSON.stringify(cities, null, 2), 'utf-8', (err) => {
        if (err) {
          reject(`Error writing file: ${err.message}`);
        } else {
          resolve();
        }
      });
    });
  }

  // Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  public async getCities(): Promise<City[]> {
    try {
      const cities = await this.read();
      console.log('cities', cities);
      return cities;
    } catch (err) {
      console.error(err);
      return [];
    }
  }

  // Define an addCity method that adds a city to the searchHistory.json file
  public async addCity(cityName: string): Promise<City> {
    try {
      const cities = await this.getCities();
      const newCity = new City(cityName);
      cities.push(newCity);
      await this.write(cities);
      return newCity;
    } catch (err) {
      console.error(`Error adding city: ${err}`);
      throw new Error('Failed to add city');
    }
  }

  // Define a removeCity method that removes a city from the searchHistory.json file
  public async removeCity(id: string): Promise<boolean> {
    try {
      const cities = await this.getCities();
      const updatedCities = cities.filter((city) => city.id !== id);

      if (cities.length === updatedCities.length) {
        return false; // No city found with the given id
      }

      await this.write(updatedCities);
      return true; // City successfully removed
    } catch (err) {
      console.error(`Error removing city: ${err}`);
      throw new Error('Failed to remove city');
    }
  }
}

export default new HistoryService();
