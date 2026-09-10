export interface TripPlan {
  known_for: string;
  popular_places: {
    name: string;
    description: string;
    best_time: string;
    category: string;
  }[];
  itinerary: {
    day: number;
    title: string;
    activities: string[];
  }[];
  budget_estimate: string;
  best_time_to_visit: string;
  travel_tips: string[];
}

export interface CountryData {
  name: { common: string; official: string };
  flags: { svg: string; alt: string };
  capital: string[];
  population: number;
  currencies: Record<string, { name: string; symbol: string }>;
  languages: Record<string, string>;
  timezones: string[];
  region: string;
}

/**
 * Fetches basic country data from the REST Countries API.
 */
export const fetchCountryData = async (country: string): Promise<CountryData> => {
  const res = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`);
  if (!res.ok) throw new Error(`Could not find country data for "${country}".`);
  const data = await res.json();
  return data[0] as CountryData; // Return highest match
};

/**
 * Generates a structured trip plan using Groq's Llama model.
 */
export const generateGroqItinerary = async (destination: string, days: number = 3): Promise<TripPlan> => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Missing VITE_GROQ_API_KEY in your environment variables. Please add it to your .env file.");
  }

  const prompt = `You are a premium travel planner for an OTA. Create a ${days}-day trip plan for ${destination}.
You must respond with ONLY a valid raw JSON object exactly matching this structure, with no markdown formatting, no backticks, and no extra text around it.

{
  "known_for": "A 1-2 sentence summary of what this place is known for",
  "popular_places": [
    {
      "name": "Place name",
      "description": "Short description",
      "best_time": "Morning/Afternoon/Evening",
      "category": "Nature/Culture/Food/Entertainment/etc"
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "title": "Theme of the day (e.g., Arrival and City Exploration)",
      "activities": ["Activity 1", "Activity 2", "Activity 3"]
    }
  ],
  "budget_estimate": "Estimated daily budget per person in USD (e.g., '$100 - $150/day')",
  "best_time_to_visit": "Best months to visit and why",
  "travel_tips": ["Practical Tip 1", "Practical Tip 2", "Practical Tip 3"]
}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5, // keep it focused to avoid hallucinations
        response_format: { type: "json_object" } // Enforce JSON
      }),
    });

    const data = await res.json();
    
    if (data.error) {
      throw new Error(`Groq API Error: ${data.error.message}`);
    }

    const text = data.choices[0].message.content;

    try {
      const parsed = JSON.parse(text) as TripPlan;
      return parsed;
    } catch (parseError) {
      // Fallback: Attempt to strip markdown blocks if Groq ignored response_format
      console.warn("Initial JSON parse failed, attempting fallback sanitization.");
      const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
      return JSON.parse(cleaned) as TripPlan;
    }

  } catch (error) {
    console.error("AI Generation failed:", error);
    throw error;
  }
};
