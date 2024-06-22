interface DescriptionProps {
  mission: string | undefined;
  descrition: string;
  esquad: string | undefined;
}

function Description({ mission, descrition, esquad }: DescriptionProps) {
  return (
    <div className="time-line-resume">
      <div className="time-line-header-mission">
        <h1>{mission}</h1>
        <h2>
          {esquad}
        </h2>
      </div>
      <div className="time-line-description">
        <div />
        <p>{descrition}</p>
      </div>
    </div>
  );
}

export default Description;
