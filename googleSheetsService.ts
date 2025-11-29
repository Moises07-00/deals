import { User, Contact, Message, Post, Photo } from '../types';

export interface DBData {
  users: User[];
  contacts: Contact[];
  messages: Message[];
  posts: Post[];
  photos: Photo[];
}

const sanitizeUrl = (url: string): string => {
  if (!url) return '';
  let cleanUrl = url.trim();
  // Remove any trailing whitespace or hidden characters
  cleanUrl = cleanUrl.replace(/[\u200B-\u200D\uFEFF]/g, '');
  
  // If user pasted the editor URL by mistake, try to fix it
  if (cleanUrl.includes('/edit')) {
    cleanUrl = cleanUrl.split('/edit')[0] + '/exec';
  }
  return cleanUrl;
};

export const fetchFromSheets = async (scriptUrl: string): Promise<DBData | null> => {
  try {
    const url = sanitizeUrl(scriptUrl);
    
    // IMPORTANT FIX: 
    // We removed the 'headers' object. Sending 'Content-Type' on a GET request 
    // triggers a CORS Preflight (OPTIONS) check which Google Apps Script DOES NOT handle,
    // causing the connection to fail even if the URL is correct.
    const response = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      // No headers ensures this is a "Simple Request"
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching from Google Sheets:", error);
    return null;
  }
};

export const syncToSheets = async (scriptUrl: string, data: DBData): Promise<boolean> => {
  try {
    const url = sanitizeUrl(scriptUrl);
    
    // IMPORTANT: 'no-cors' mode is required for Google Apps Script POST requests
    // to avoid CORS errors in the browser.
    // DOWNSIDE: We cannot read the response (it is opaque). We assume success if no network error occurs.
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors', 
      headers: {
        'Content-Type': 'text/plain', // Avoids preflight OPTIONS request
      },
      body: JSON.stringify({
        type: 'SYNC_ALL',
        payload: data
      })
    });
    
    return true;
  } catch (error) {
    console.error("Error syncing to Google Sheets:", error);
    return false;
  }
};