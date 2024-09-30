import { Router, type Request, type Response } from 'express';
const router = Router();

import HistoryService from '../../service/historyService.js';

// POST Request with city name to retrieve weather data
router.post('/', async (req: Request, res: Response) => {
  try {
    const cityName = req.body.cityName;

    // Validate that cityName is provided in the request body
    if (!cityName) {
      return res.status(400).json({ error: 'City name is required' });
    }

    // Fetch weather data for the provided city
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=YOUR_API_KEY`);
    
    if (!response.ok) {
      // Handle API errors such as city not found
      return res.status(response.status).json({ error: 'Failed to retrieve weather data' });
    }

    const weatherData = await response.json();

    // Save the city to search history
    await HistoryService.addCity(cityName);

    // Send back the weather data in the response
    return res.status(200).json(weatherData.list);
  } catch (error) {
    // Handle unexpected errors
    return res.status(500).json({ error: 'An error occurred while fetching weather data' });
  }
});


   
// GET search history
router.get('/history', async (_req: Request, _res: Response) => {
  try {
    const cities = await HistoryService.getCities();
    _res.status(200).json(cities);
  } catch (error) {
    _res.status(500).json({ error: 'Failed to retrieve search history' });
  }
});

// BONUS: DELETE city from search history
router.delete('/history/:id', async (req: Request, res: Response) => {
  try {
    const cityId = req.params.id;
    const result = await HistoryService.removeCity(cityId);

    if (result) {
      res.status(200).json({ message: `City with id ${cityId} deleted successfully` });
    } else {
      res.status(404).json({ error: `City with id ${cityId} not found` });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete city from search history' });
  }
});

export default router;
