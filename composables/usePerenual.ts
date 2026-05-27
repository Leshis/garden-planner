/**
 * composables/usePerenual.ts
 * Streamlined types for our Gemini AI garden layout
 */

export interface GardenPlant {
  id: string; // Changed to string for unique epoch timestamps
  common_name: string;
  scientific_name: string;
  flower_color: string;
  hex_colours: string[];
  flowering_season: string;
  bloom_months: number[];
  hardiness?: string;
  watering?: string;
  propagation_guide?: string;
  propagation_season?: string;
  image?: string; 
  nickname?: string;
}
