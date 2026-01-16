
/**
 * Calls your Custom Model API (e.g., Flask/YOLO backend)
 */
export const analyzeWithCustomModel = async (url: string, base64Data: string, mimeType: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Data,
        mime_type: mimeType
      }),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return !!data.hazardous_fire;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      console.error("Connection Refused: Ensure your Flask app is running and CORS is enabled.");
      throw new Error("CONNECTION_REFUSED");
    }
    console.error("Custom model API error:", error);
    throw error;
  }
};
