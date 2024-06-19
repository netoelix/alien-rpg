interface CharacterImgProps {
  images: string;
  characterName: string;
}

function CharacerImg({ images, characterName }: CharacterImgProps) {
  return <img src={ images } alt={ characterName } className="image" />;
}

export default CharacerImg;
