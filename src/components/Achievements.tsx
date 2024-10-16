import { useState } from 'react';
import { AchievementsContainer } from '../styles/AchievementsStyle';

interface Achievement {
  medal: string | undefined;
  character: any;
  name: string;
  description: string;
}

interface AchievementsProps {
  achievements: Achievement[];
  characterIndex: number;
}

function Achievements({ achievements, characterIndex }: AchievementsProps) {
  const [medalTypeFilter, setMedalTypeFilter] = useState('');
  const [rankFilter, setRankFilter] = useState('');
  const [dateOrder, setDateOrder] = useState('');

  const extractMedalInfo = (medal: string) => {
    let processedMedal = medal;
    if (medal.includes('http://') || medal.includes('https://')) {
      const urlParts = medal.split('/');
      const fileName = urlParts[urlParts.length - 1];
      processedMedal = fileName.split('-').slice(0, -1).join('-');
    }
    processedMedal = processedMedal.replace(/_/g, '=').replace(/-/g, ' ').replace(/%20/g, ', ');

    console.log(processedMedal);

    if (!processedMedal) {
      console.log('Medal is undefined or null');
      return { type: '', rank: '', stripeCount: '', color: '' };
    }
    const parts = processedMedal.split(', ');
    if (parts.length < 4) {
      console.log('Medal string does not contain all expected parts');
      return { type: '', rank: '', stripeCount: '', color: '' };
    }
    const info = {
      type: parts[0].split('=')[1] || '',
      rank: parts[1].split('=')[1] || '',
      stripeCount: parts[2].split('=')[1] || '',
      color: parts[3].split('=')[1]?.split('.')[0] || '',
    };
    console.log(info);

    return info;
  };

  const filteredAchievements = achievements.filter((achievement) => {
    if (!achievement.medal) return false;
    const { type, rank } = extractMedalInfo(achievement.medal);
    return (!medalTypeFilter || type === medalTypeFilter)
    && (!rankFilter || rank === rankFilter);
  });

  function convertDateToISO(dateString: string) {
    const parts = dateString.split('/');
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  return (
    <AchievementsContainer
      className="player-achievements"
    >
      <div className="inputs-container">
        <label htmlFor="medalType">Selecione uma categoria:</label>
        <select
          id="medalType"
          value={ medalTypeFilter }
          onChange={ (e) => setMedalTypeFilter(e.target.value) }
        >
          <option value="">Todos os Tipos</option>
          <option value="Combat">Combate</option>
          <option value="Stress">Estresse</option>
          <option value="Exploration">Exploração</option>
          <option value="Survival">Sobrevivência</option>
          <option value="Unique">Único</option>
        </select>

        <label htmlFor="rankFilter">Selecione um rank:</label>
        <select
          id="rankFilter"
          value={ rankFilter }
          onChange={ (e) => setRankFilter(e.target.value) }
        >
          <option value="">Todos os Ranks</option>
          <option value="Bronze">Bronze</option>
          <option value="Silver">Prata</option>
          <option value="Gold">Ouro</option>
          <option value="Platinum">Platina</option>
        </select>
        <label htmlFor="dateOrder">Ordenar por data:</label>
        <select
          id="dateOrder"
          value={ dateOrder }
          onChange={ (e) => setDateOrder(e.target.value) }
        >
          <option value="">Selecione</option>
          <option value="newest">Mais recente primeiro</option>
          <option value="oldest">Mais antigo primeiro</option>
        </select>
      </div>
      <div className="info-achievements">
        {filteredAchievements.sort((a, b) => {
          const stringA = a.character[characterIndex].date;
          const stringB = b.character[characterIndex].date;
          const stringAISO = convertDateToISO(stringA);
          const stringBISO = convertDateToISO(stringB);
          const dateANumber = new Date(stringAISO).getTime();
          const dateBNumber = new Date(stringBISO).getTime();
          const dateA = dateANumber;
          const dateB = dateBNumber;

          if (dateOrder === 'newest') {
            return dateB - dateA;
          } if (dateOrder === 'oldest') {
            return dateA - dateB;
          }

          return 0;
        }).map((achievement, index) => (
          <div key={ index } className="achievements">
            <h3>{achievement.name}</h3>
            <p>{achievement.description}</p>
            <p>{achievement.character[characterIndex].date}</p>
            <div className="achievements-img">
              <img src={ achievement.medal } alt={ achievement.description } />
            </div>
          </div>
        ))}
      </div>
    </AchievementsContainer>
  );
}

export default Achievements;
