import { calendar } from "./google.service.js";

export async function createEvent(eventData) {
  const event = {
    summary: eventData.summary,
    description: eventData.description,
    start: { dateTime: eventData.start, timeZone: "America/Mexico_City" },
    end: { dateTime: eventData.end, timeZone: "America/Mexico_City" },
    attendees: eventData.attendees || [],
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    requestBody: event,
  });

  return response.data;
}
