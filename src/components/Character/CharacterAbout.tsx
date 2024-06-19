import { AboutCharacter } from '../../styles/AboutStyle';

interface CharacterAboutProps {
  about: string | undefined;
}

function CharacterAbout({ about }: CharacterAboutProps) {
  if (!about) {
    return null;
  }

  const sentences = about.split('.').filter((sentence) => sentence
    .trim() !== '').map((sentence, index) => (
      <p key={ index }>
        {sentence.trim()}
        .
      </p>
  ));

  return (
    <AboutCharacter>
      {sentences}
    </AboutCharacter>
  );
}

export default CharacterAbout;
