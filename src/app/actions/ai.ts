"use server";

import OpenAI from 'openai';

// Define the structure of our heatmap data
// 7 days (0 = Monday, 6 = Sunday) x 24 hours (0-23)
export type HeatmapData = {
  [day: string]: {
    [hour: string]: number; // Score between 0.0 and 1.0
  }
};

export async function getBestTimeToPost(context?: string): Promise<HeatmapData> {
  const apiKey = process.env.OPENAI_API_KEY;

  // Fallback: If no API key is provided, return a highly realistic mock schedule
  if (!apiKey || apiKey === '') {
    return generateMockHeatmap();
  }

  try {
    const openai = new OpenAI({ apiKey });

    const prompt = `
      You are an expert social media analyst. 
      Generate a "best time to post" heatmap schedule for a typical social media account.
      ${context ? `Context about the account: ${context}` : ''}
      
      Respond ONLY with a valid JSON object. 
      The JSON object must have keys "0" through "6" representing days of the week (0 = Monday, 6 = Sunday).
      Each day must be an object with keys "0" through "23" representing hours of the day (in local time).
      The value for each hour must be a number between 0.0 (worst time) and 1.0 (best time).
      
      Make the data realistic: higher engagement during commutes, lunch breaks, and evenings.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // fast, efficient model
      messages: [
        { role: "system", content: "You are a helpful assistant that only outputs valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (content) {
      return JSON.parse(content) as HeatmapData;
    }
    
    return generateMockHeatmap();
  } catch (error) {
    console.error("Failed to generate AI heatmap:", error);
    // Graceful fallback on error
    return generateMockHeatmap();
  }
}

function generateMockHeatmap(): HeatmapData {
  const data: HeatmapData = {};
  
  for (let day = 0; day < 7; day++) {
    data[day.toString()] = {};
    const isWorkday = day < 5;
    
    for (let hour = 0; hour < 24; hour++) {
      const isWorkHour = hour >= 9 && hour <= 17;
      const isPeakHour = (hour === 10 || hour === 14 || hour === 15);
      
      let score = 0;
      if (isWorkday && isPeakHour) score = 1.0; 
      else if (isWorkday && isWorkHour) score = 0.5;
      else if (!isWorkday && (hour === 11 || hour === 12)) score = 0.7;
      
      data[day.toString()][hour.toString()] = score;
    }
  }
  
  return data;
}
