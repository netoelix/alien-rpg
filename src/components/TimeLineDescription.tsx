import React from 'react';

interface DescriptionProps {
  mission: string | undefined;
  descrition: string;
  esquad: string | undefined;
}

function Description({ mission, descrition, esquad }: DescriptionProps) {
  const hideTextBetweenSlashes = (text) => {
    const segments = text.split(/(\/.*?\/)/g);

    return segments.map((segment, index) => {
      if (segment.startsWith('/') && segment.endsWith('/')) {
        return (
          <span key={ index } style={ { backgroundColor: 'black', color: 'black' } }>
            {segment.replace(/\//g, '')}
          </span>
        );
      }
      // Retorna o segmento não oculto
      return segment;
    });
  };

  const descriptionWithBreaksAndHiddenWords = descrition.split('.')
    .map((sentence, sentenceIndex, sentenceArray) => {
      const processedSentence = hideTextBetweenSlashes(sentence);

      return (
        <p key={ sentenceIndex }>
          {processedSentence}
          {sentenceIndex < sentenceArray.length - 1 ? '.' : ''}
          {sentenceIndex < sentenceArray.length - 1 && <br />}
        </p>
      );
    });

  console.log(descriptionWithBreaksAndHiddenWords);

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
        {descriptionWithBreaksAndHiddenWords}
      </div>
    </div>
  );
}

export default Description;
