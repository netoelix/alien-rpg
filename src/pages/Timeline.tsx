import Description from '../components/TimeLineDescription';
import { timelines } from '../assets/data/timeline';
import { TimeLineContainer } from '../styles/TimeLineStyle';

function Timeline() {
  return (
    <TimeLineContainer>
      <section className="time-line-container">
        {
          timelines.map(({ dateTime, location, mission, descrition, esquad }, index) => (
            <article className="time-lide-content" key={ index }>
              <header className="time-line-folder">
                <div>
                  <h3>{dateTime}</h3>
                  <h3>{location}</h3>
                </div>
              </header>
              <Description
                mission={ mission }
                descrition={ descrition }
                esquad={ esquad }
              />
            </article>
          ))
        }
      </section>
    </TimeLineContainer>
  );
}

export default Timeline;
