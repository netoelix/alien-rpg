import { useState } from 'react';
import { EventContainer, EventDate, TimelineText,
  TimelineContainer, TimelineLine } from '../styles/TimelineStyle';
import galaxyMap from '../assets/galaxy-map.jpg';

import { timelines } from '../assets/timeline';

function Timeline() {
  const [openEvents, setOpenEvents] = useState<string | null>(null);

  const handleClick = (dateTime: string, location: string) => {
    const eventKey = `${dateTime}-${location}`;
    setOpenEvents((prevEventKey) => (prevEventKey === eventKey ? null : eventKey));
  };

  return (
    <TimelineText>
      <img src={ galaxyMap } alt="" />
      <div className="blur-background">
        <h1>Timeline</h1>
        <TimelineContainer>
          <TimelineLine />
          {
        timelines.map(({ dateTime, location, descrition }) => {
          const eventKey = `${dateTime}-${location}`;
          const isOpen = openEvents === eventKey;

          return (
            <EventContainer
              key={ eventKey }
              className="event-container"
              onClick={ () => handleClick(dateTime, location) }
            >
              <EventDate
                style={ { backgroundColor: isOpen ? '#f5c518' : 'white' } }
                className="event-date"
              >
                { `${dateTime} - ${location}` }
                <div className={ `description-text ${isOpen ? 'open' : ''}` }>
                  <p className="text-resume">{descrition}</p>
                </div>
              </EventDate>
            </EventContainer>
          );
        })
      }
        </TimelineContainer>
      </div>
    </TimelineText>
  );
}

export default Timeline;
