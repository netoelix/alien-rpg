import Description from '../components/TimeLineDescription';
import { timelines } from '../assets/data/timeline';
import { TimeLineContainer } from '../styles/TimeLineStyle';

function Timeline() {
  return (
    <TimeLineContainer>
      <div className="time-line-container">
        {
          timelines.map(({ dateTime, location, mission, descrition, esquad }, index) => (
            <section className="time-lide-content" key={ index }>
              <div className="time-line-folder">
                <div>
                  <h3>{dateTime}</h3>
                  <h3>{location}</h3>
                </div>
              </div>
              <Description
                mission={ mission }
                descrition={ descrition }
                esquad={ esquad }
              />
            </section>
          ))
        }
      </div>
    </TimeLineContainer>
  );
}

export default Timeline;
