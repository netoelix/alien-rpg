/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable max-len */
/* eslint-disable max-lines */

import { medalsCombat } from './medals-combat';
import { medalsExploration } from './medals-exploration';
import { medalsStress } from './medals-stress';
import { medalsSurvival } from './medals-survival';
import { medalsUnique } from './medals-unique';

const Bruno = 'Bruno';
const André = 'André';
const Fernando = 'Fernando (Gelatto)';
const Raissa = 'Raissa';

export const achievements = [
  { id: 'stress_01',
    medal: medalsStress.StressBronzeSingleYellow,
    description: 'Atingir 1 pontos de stress',
    name: 'Só mais um dia de trabalho...',
    character: [{
      name: André,
      date: '16/06/2024',
    },
    {
      name: Fernando,
      date: '16/06/2024',
    },
    {
      name: Bruno,
      date: '22/06/2024',
    },
    {
      name: Raissa,
      date: '17/08/2024',
    }] },
  { id: 'stress_02',
    medal: medalsStress.StressSilverSingleYellow,
    description: 'Atingir 5 pontos de stress',
    name: 'Não estão me pagando o suficiente pra isso',
    character: [{
      name: André,
      date: '22/06/2024',
    },
    {
      name: Fernando,
      date: '22/06/2024',
    },
    {
      name: Bruno,
      date: '22/06/2024',
    },
    {
      name: Raissa,
      date: '17/08/2024',
    }] },
  { id: 'stress_03',
    medal: medalsStress.StressGoldSingleYellow,
    description: 'Atingir 8 pontos de stress',
    name: 'Preciso de férias!!!',
    character: [{
      name: André,
      date: '25/08/2024',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      nname: Raissa,
      date: '25/08/2024',
    }] },
  { id: 'stress_04',
    medal: medalsStress.StressPlatinumSingleYellow,
    description: 'Atingir 10+ pontos de stress',
    name: 'INFERNOOOOO!!!!!',
    character: [{
      name: André,
      date: '25/08/2024',
    },
    {
      name: '',
      date: '',
    },
    {
      name: Raissa,
      date: '06/10/2024',
    }] },
  { id: 'stress_05',
    medal: medalsStress.StressPlatinumTripleGreen,
    description: 'Rolar 3 vezes seguidas um valor de stress entre 1 e 6',
    name: 'Nervos de aço',
    character: [{
      name: André,
      date: '28/09/2024',
    },
    {
      name: Fernando,
      date: '29/06/2024',
    },
    {
      name: '',
      date: '',
    },
    {
      name: Raissa,
      date: '17/08/2024',
    }] },
  { id: 'stress_06',
    medal: medalsStress.StressBronzeSingleRed,
    description: 'Rolar 7 no teste de pânico',
    name: 'Você me da tique, tique nervoso',
    character: [{
      name: André,
      date: '22/06/2024',
    },
    {
      name: Fernando,
      date: '22/06/2024',
    },
    {
      name: Bruno,
      date: '22/06/2024',
    },
    {
      name: Raissa,
      date: '17/08/2024',
    }] },
  { id: 'stress_07',
    medal: medalsStress.StressBronzeDoubleRed,
    description: 'Rolar 8 no teste de pânico',
    name: 'Parkinson?',
    character: [{
      name: André,
      date: '22/06/2024',
    },
    {
      name: '',
      date: '',
    },
    {
      name: Bruno,
      date: '06/07/2024',
    },
    {
      name: Raissa,
      date: '17/08/2024',
    }] },
  { id: 'stress_08',
    medal: medalsStress.StressBronzeTripleRed,
    description: 'Rolar 9 no teste de pânico',
    name: 'Mão de alface',
    character: [{
      name: André,
      date: '29/06/2024',
    },
    {
      name: Fernando,
      date: '29/06/2024',
    },
    {
      name: Bruno,
      date: '22/06/2024',
    }] },
  { id: 'stress_09',
    medal: medalsStress.StressSilverSingleRed,
    description: 'Rolar 10 no teste de pânico',
    name: 'Batatinha frita 1, 2, 3',
    character: [{
      name: André,
      date: '29/06/2024',
    },
    {
      name: '',
      date: '',
    },
    {
      name: Bruno,
      date: '06/07/2024',
    },
    {
      name: Raissa,
      date: '17/08/2024',
    }] },
  { id: 'stress_10',
    medal: medalsStress.StressSilverDoubleRed,
    description: 'Rolar 11 no teste de pânico',
    name: 'Não é esse tipo de cobertura, Tábata!',
    character: [{
      name: André,
      date: '22/06/2024',
    },
    {
      name: '',
      date: '',
    },
    {
      name: Bruno,
      date: '06/07/2024',
    },
    {
      name: Raissa,
      date: '25/08/2024',
    }] },
  { id: 'stress_11',
    medal: medalsStress.StressSilverTripleRed,
    description: 'Rolar 12 no teste de pânico',
    name: 'AAAAAAAHHHHH!!!',
    character: [{
      name: André,
      date: '25/08/2024',
    },
    {
      name: Bruno,
      date: '06/10/2024',
    },
    {
      name: '',
      date: '',
    },
    {
      name: Raissa,
      date: '25/08/2024',
    }] },
  { id: 'stress_12',
    medal: medalsStress.StressGoldSingleRed,
    description: 'Rolar 13 no teste de pânico',
    name: 'Run bitch, RUN!!',
    character: [{
      name: André,
      date: '06/10/2024',
    },
    {
      name: Bruno,
      date: '06/10/2024',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'stress_13',
    medal: medalsStress.StressGoldDoubleRed,
    description: 'Rolar 14 no teste de pânico',
    name: 'Vem tranquilo',
    character: [{
      name: André,
      date: '25/08/2024',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'stress_14',
    medal: medalsStress.StressGoldTripleRed,
    description: 'Rolar 15+ no teste de pânico',
    name: 'Qual o sentido da vida?',
    character: [{
      name: André,
      date: '06/10/2024',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'stress_15',
    medal: medalsStress.StressPlatinumTripleBlack,
    description: 'Adquirir algum Trauma mental permanente',
    name: 'Ala psiquiátrica',
    character: [{
      name: André,
      date: '06/10/2024',
    },
    {
      name: '',
      date: '',
    },
    {
      name: Raissa,
      date: '06/10/2024',
    }] },
  { id: 'stress_16',
    medal: medalsStress.StressPlatinumTripleGreen,
    description: 'Rolar 2 vezes seguidas um valor de stress entre 1 e 6 e falhar na terceira',
    name: 'Nervos de água',
    character: [{
      name: André,
      date: '06/07/2024',
    },
    {
      name: '',
      date: '',
    },
    {
      name: Bruno,
      date: '06/07/2024',
    }] },
  { id: 'stress_17',
    medal: medalsStress.StressPlatinumTripleGreen,
    description: 'Rolar o mesmo resultado de um pânico ativo e ter que subir para o próximo nível.',
    name: 'Fora de controle',
    character: [{
      name: André,
      date: '06/07/2024',
    },
    {
      name: '',
      date: '',
    },
    {
      name: Bruno,
      date: '06/07/2024',
    }] },
  { id: 'stress_18',
    medal: medalsStress.StressPlatinumTripleGreen,
    description: 'Aquirir em uma sessão 2+ pontos de stress decorrente de várias rolagens de pânico.',
    name: 'for (let stress = 6; stress < 15; stress++)',
    character: [{
      name: André,
      date: '06/07/2024',
    },
    {
      name: '',
      date: '',
    },
    {
      name: Bruno,
      date: '06/07/2024',
    },
    {
      name: Raissa,
      date: '25/08/2024',
    }] },
  { id: 'eliminations_01',
    medal: medalsCombat.CombatBronzeDoubleRed,
    description: 'Elimine 1 humano',
    name: 'O primeiro a gente nunca esquece...',
    character: [{
      name: André,
      date: '16/06/2024',
    },
    {
      name: Fernando,
      date: '16/06/2024',
    },
    {
      name: Bruno,
      date: '22/06/2024',
    }] },
  { id: 'eliminations_02',
    medal: medalsCombat.CombatSilverDoubleRed,
    description: 'Elimine 10 humanos',
    name: 'Assassino de aluguel',
    character: [{
      name: André,
      date: '22/06/2024',
    },
    {
      name: Fernando,
      date: '22/06/2024',
    },
    {
      name: Bruno,
      date: '22/06/2024',
    }] },
  { id: 'eliminations_03',
    medal: medalsCombat.CombatGoldDoubleRed,
    description: 'Elimine 100 humanos',
    name: 'Serial killer',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_04',
    medal: medalsCombat.CombatPlatinumDoubleRed,
    description: 'Elimine 1000 humanos',
    name: 'Genocida',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_05',
    medal: medalsCombat.CombatBronzeTripleRed,
    description: 'Elimine 3 em um único ataque',
    name: '3 coelhos com uma cajadada só',
    character: [{
      name: '',
      date: '',
    },
    {
      name: Fernando,
      date: '22/06/2024',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_06',
    medal: medalsCombat.CombatSilverTripleRed,
    description: 'Elimine 5 em um único ataque',
    name: 'Pentakill!',
    character: [{
      name: '',
      date: '',
    },
    {
      name: Fernando,
      date: '22/06/2024',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_07',
    medal: medalsCombat.CombatGoldTripleRed,
    description: 'Elimine 10 em um único ataque',
    name: 'Strike!',
    character: [{
      name: '',
      date: '',
    },
    {
      name: Fernando,
      date: '03/08/2024',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_08',
    medal: medalsCombat.CombatPlatinumTripleRed,
    description: 'Elimine 20 em um único ataque',
    name: 'Tudo friamente calculado',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_09',
    medal: medalsCombat.CombatSilverTripleRed,
    description: 'Elimine alguém durante um momento intimo',
    name: 'Viúva negra',
    character: [{
      name: André,
      date: '07/09/2024',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_xenomorph_01',
    medal: medalsCombat.CombatBronzeTripleBlack,
    description: 'Elimine 1 Xenomorfo',
    name: 'Tem certeza que ele morreu?',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_xenomorph_02',
    medal: medalsCombat.CombatSilverTripleBlack,
    description: 'Elimine 5 Xenomorfos',
    name: 'Acho que to pegando o jeito',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_xenomorph_03',
    medal: medalsCombat.CombatGoldTripleBlack,
    description: 'Elimine 10 Xenomorfos',
    name: 'Agente da Carrocinha',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_xenomorph_04',
    medal: medalsCombat.CombatPlatinumTripleBlack,
    description: 'Elimine 50 Xenomorfos',
    name: 'Predador',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_neomorph_01',
    medal: medalsCombat.CombatBronzeDoubleBlack,
    description: 'Elimine 1 Neomorfo',
    name: 'Bronze',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_neomorph_02',
    medal: medalsCombat.CombatSilverDoubleBlack,
    description: 'Elimine 5 Neomorfos',
    name: 'Prata',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_neomorph_03',
    medal: medalsCombat.CombatGoldDoubleBlack,
    description: 'Elimine 10 Neomorfos',
    name: 'Ouro',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_neomorph_04',
    medal: medalsCombat.CombatPlatinumDoubleBlack,
    description: 'Elimine 20 Neomorfos',
    name: 'Diamante',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_local_fauna_01',
    medal: medalsCombat.CombatBronzeSingleYellow,
    description: 'Elimine 1 animal',
    name: 'Greenhorn',
    character: [{
      name: André,
      date: '29/06/2024',
    },
    {
      name: Fernando,
      date: '29/06/2024',
    },
    {
      name: Bruno,
      date: '06/07/2024',
    },
    {
      name: Raissa,
      date: '17/08/2024',
    }] },
  { id: 'eliminations_local_fauna_02',
    medal: medalsCombat.CombatSilverSingleYellow,
    description: 'Elimine 10 animais',
    name: 'Decorando a parede',
    character: [{
      name: André,
      date: '03/08/2024',
    },
    {
      name: Fernando,
      date: '03/08/2024',
    },
    {
      name: Bruno,
      date: '03/08/2024',
    }] },
  { id: 'eliminations_local_fauna_03',
    medal: medalsCombat.CombatGoldSingleYellow,
    description: 'Elimine 100 animais',
    name: 'Caçador profissional',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_local_fauna_04',
    medal: medalsCombat.CombatPlatinumSingleYellow,
    description: 'Elimine 1000 animais',
    name: 'Terror do ibama',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_mechanical_01',
    medal: medalsCombat.CombatBronzeSingleBlack,
    description: 'Elimine 1 sintético',
    name: 'Catador de latinhas',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_mechanical_02',
    medal: medalsCombat.CombatSilverSingleBlack,
    description: 'Elimine 5 sintéticos',
    name: 'Detetive Del Spooner',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_mechanical_03',
    medal: medalsCombat.CombatGoldSingleBlack,
    description: 'Elimine 10 sintéticos',
    name: 'T-800',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_mechanical_04',
    medal: medalsCombat.CombatPlatinumSingleBlack,
    description: 'Elimine 50 sintéticos',
    name: 'John Connor',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_innocents_01',
    medal: medalsCombat.CombatBronzeSingleRed,
    description: 'Elimine 1 inocente',
    name: 'Foi um acidente!',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_innocents_02',
    medal: medalsCombat.CombatSilverSingleRed,
    description: 'Elimine 10 inocentes',
    name: 'Eles ficam entrando na linha de tiro',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_innocents_03',
    medal: medalsCombat.CombatGoldSingleRed,
    description: 'Elimine 100 inocentes',
    name: 'Como é que eu vou explicar isso?',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'eliminations_innocents_04',
    medal: medalsCombat.CombatPlatinumSingleRed,
    description: 'Elimine 1000 inocentes',
    name: 'Num estalar de dedos',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'exploration_01',
    medal: medalsExploration.ExplorationBronzeSingleGreen,
    description: 'Viajar 1 parsec',
    name: 'Proxima Centauri',
    character: [{
      name: André,
      date: '29/06/2024',
    },
    {
      name: Fernando,
      date: '29/06/2024',
    },
    {
      name: Bruno,
      date: '29/06/2024',
    },
    {
      name: Raissa,
      date: '17/08/2024',
    }] },
  { id: 'exploration_02',
    medal: medalsExploration.ExplorationSilverSingleGreen,
    description: 'Viajar 10 parsecs',
    name: 'Maia',
    character: [{
      name: André,
      date: '28/07/2024',
    },
    {
      name: Fernando,
      date: '28/07/2024',
    },
    {
      name: Bruno,
      date: '28/07/2024',
    },
    {
      name: Raissa,
      date: '17/08/2024',
    }] },
  { id: 'exploration_03',
    medal: medalsExploration.ExplorationGoldSingleGreen,
    description: 'Viajar 100 parsecs',
    name: 'Colonia',
    character: [{
      name: André,
      date: '12/10/2024',
    },
    {
      name: Fernando,
      date: '12/10/2024',
    },
    {
      name: Bruno,
      date: '12/10/2024',
    }] },
  { id: 'exploration_04',
    medal: medalsExploration.ExplorationPlatinumSingleGreen,
    description: 'Viajar 1000 parsecs',
    name: 'Beagle point',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'exploration_star_systems_01',
    medal: medalsExploration.ExplorationBronzeSingleYellow,
    description: 'Viajar 1 sistema estelar',
    name: 'Explorador',
    character: [{
      name: André,
      date: '16/06/2024',
    },
    {
      name: Fernando,
      date: '16/06/2024',
    },
    {
      name: Bruno,
      date: '16/06/2024',
    },
    {
      name: Raissa,
      date: '17/08/2024',
    }] },
  { id: 'exploration_star_systems_02',
    medal: medalsExploration.ExplorationSilverSingleYellow,
    description: 'Viajar 10 sistemas estelares',
    name: 'Cartógrafo',
    character: [{
      name: André,
      date: '12/10/2024',
    },
    {
      name: Bruno,
      date: '12/10/2024',
    },
    {
      name: Fernando,
      date: '12/10/2024',
    }] },
  { id: 'exploration_star_systems_03',
    medal: medalsExploration.ExplorationGoldSingleYellow,
    description: 'Viajar 50 sistemas estelares',
    name: 'Desbravador',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'exploration_star_systems_04',
    medal: medalsExploration.ExplorationPlatinumSingleYellow,
    description: 'Viajar 150 sistemas estelares',
    name: 'Pioneiro',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'exploration_star_systems_05',
    medal: medalsExploration.ExplorationPlatinumTripleYellow,
    description: 'Visitar um de cada tipo de sistema estelar',
    name: 'Complecionista',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'exploration_planets_01',
    medal: medalsExploration.ExplorationBronzeSingleRed,
    description: 'Pousar em 1 planeta',
    name: 'Um pequeno passo para o homem...',
    character: [{
      name: André,
      date: '16/06/2024',
    },
    {
      name: Fernando,
      date: '16/06/2024',
    },
    {
      name: Bruno,
      date: '16/06/2024',
    },
    {
      name: Raissa,
      date: '17/08/2024',
    }] },
  { id: 'exploration_planets_02',
    medal: medalsExploration.ExplorationSilverSingleRed,
    description: 'Pousar em 5 planetas',
    name: 'Deixando o rastro',
    character: [{
      name: André,
      date: '12/10/2024',
    },
    {
      name: Fernando,
      date: '12/10/2024',
    },
    {
      name: Bruno,
      date: '12/10/2024',
    }] },
  { id: 'exploration_planets_03',
    medal: medalsExploration.ExplorationGoldSingleRed,
    description: 'Pousar em 10 planetas',
    name: 'Plutão não conta',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'exploration_planets_04',
    medal: medalsExploration.ExplorationPlatinumSingleRed,
    description: 'Pousar em 50 planetas',
    name: 'Em busca do planeta perfeito',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'exploration_planets_05',
    medal: medalsExploration.ExplorationPlatinumTripleRed,
    description: 'Pousar em um de cada tipo de planeta',
    name: 'Até em gigantes gasosos?',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'special_exploration_01',
    medal: medalsUnique.UniqueGoldSingleBlack,
    description: 'Encontrar com os Engenheiros',
    name: 'De frente com o criador',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'special_exploration_02',
    medal: medalsUnique.UniqueSilverTripleBlack,
    description: 'Visitar todos os planetas dos filmes',
    name: 'Cinefilo',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'special_eliminations_01',
    medal: medalsUnique.UniquePlatinumTripleBlack,
    description: 'Elimine uma Rainha Alien',
    name: 'Xeque-mate?',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'special_eliminations_02',
    medal: medalsUnique.UniqueGoldDoubleBlack,
    description: 'Eliminar um Engenheiro',
    name: 'Kratos?',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'special_eliminations_03',
    medal: medalsUnique.UniquePlatinumDoubleBlack,
    description: 'Eliminar um de cada tipo de Xenomorfo',
    name: 'Preenchendo o albúm de figurinhas',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'special_eliminations_04',
    medal: medalsUnique.UniquePlatinumSingleBlack,
    description: 'Eliminar um de cada tipo de Neomorfo',
    name: '',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'xenomorph_attacks_01',
    medal: medalsCombat.CombatBronzeSingleBlack,
    description: "Receber um ataque 'Bocada na cabeça'",
    name: 'Beijo Apaixonado',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'xenomorph_attacks_02',
    medal: medalsCombat.CombatBronzeSingleBlack,
    description: "Receber um ataque 'Olhar hipnotizante'",
    name: 'Conexão de Almas',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'xenomorph_attacks_03',
    medal: medalsCombat.CombatBronzeSingleBlack,
    description: "Receber um ataque 'Brincando com a presa'",
    name: 'Preliminares',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'xenomorph_attacks_04',
    medal: medalsCombat.CombatBronzeSingleBlack,
    description: "Receber um ataque 'Agarrão mortal'",
    name: 'Dom vs Sub',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'xenomorph_attacks_05',
    medal: medalsCombat.CombatBronzeSingleBlack,
    description: "Receber um ataque 'Ferrão da Cauda'",
    name: 'Não é so o tamnho da varinha, mas a habilidade do bruxo',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'xenomorph_attacks_06',
    medal: medalsCombat.CombatBronzeSingleBlack,
    description: "Receber um ataque 'Capturar para a colmeia'",
    name: 'Ninho de amor',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'xenomorph_attacks_07',
    medal: medalsCombat.CombatBronzeSingleBlack,
    description: "Receber um ataque 'Sangue ácido'",
    name: 'Não se meche, vou buscar o papel',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'sintetic_01',
    medal: medalsSurvival.SurvivalBronzeSingleBlack,
    description: 'Morra como um sintético',
    name: 'Pane no sistema alguém me desconfigurou',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'sintetic_02',
    medal: medalsSurvival.SurvivalSilverSingleBlack,
    description: 'Perder uma parte do corpo jogando como sintético',
    name: 'Caindo aos pedaços',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_dangerous_01',
    medal: medalsSurvival.SurvivalBronzeSingleRed,
    description: 'Morrer sufocado',
    name: 'Último suspiro',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_dangerous_02',
    medal: medalsSurvival.SurvivalBronzeSingleRed,
    description: 'Morrer afogado',
    name: 'Glub Glub Glub',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_dangerous_03',
    medal: medalsSurvival.SurvivalBronzeSingleRed,
    description: 'Morrer por radiação',
    name: 'Alta exposição',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_dangerous_04',
    medal: medalsSurvival.SurvivalBronzeSingleRed,
    description: 'Morrer por doença',
    name: 'Só uma gripezinha',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_dangerous_05',
    medal: medalsSurvival.SurvivalBronzeSingleRed,
    description: 'Morrer por envenenamento',
    name: 'Veneno de cobra',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_dangerous_06',
    medal: medalsSurvival.SurvivalBronzeSingleRed,
    description: 'Morrer por queimadura',
    name: 'Ta pegando fogo bixo!',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_dangerous_07',
    medal: medalsSurvival.SurvivalBronzeSingleRed,
    description: 'Morrer em explosão',
    name: 'Você está por toda parte... literalmente',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_dangerous_08',
    medal: medalsSurvival.SurvivalBronzeSingleRed,
    description: 'Morrer por dano de queda',
    name: 'Há 7 palmos',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_dangerous_09',
    medal: medalsSurvival.SurvivalBronzeSingleRed,
    description: 'Morrer no vácuo do espaço',
    name: 'No espaço, ninguém pode te ouvir gritar',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_dangerous_10',
    medal: medalsSurvival.SurvivalBronzeSingleRed,
    description: 'Morrer pelo status "congelando"',
    name: 'Tinha espaço na porta',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_dangerous_11',
    medal: medalsSurvival.SurvivalBronzeSingleRed,
    description: 'Morrer como consequência do status "exausto"',
    name: 'Descanso eterno',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_dangerous_12',
    medal: medalsSurvival.SurvivalBronzeSingleRed,
    description: 'Morrer pelo status "desidratado"',
    name: 'Carne seca',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_dangerous_13',
    medal: medalsSurvival.SurvivalBronzeSingleRed,
    description: 'Morrer pelo status "faminto"',
    name: 'Jejum Inter...minavel',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_dangerous_14',
    medal: medalsSurvival.SurvivalBronzeSingleYellow,
    description: 'Adquirir pelo menos uma vez o status "congelando"',
    name: 'Leva um casaco!',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_dangerous_15',
    medal: medalsSurvival.SurvivalBronzeSingleYellow,
    description: 'Adquirir pelo menos uma vez o status "exausto"',
    name: 'Mas ainda é segunda-feira, capitão',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_dangerous_16',
    medal: medalsSurvival.SurvivalBronzeSingleYellow,
    description: 'Adquirir pelo menos uma vez o status "desidratado"',
    name: 'água a 1,5km',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_dangerous_17',
    medal: medalsSurvival.SurvivalBronzeSingleYellow,
    description: 'Adquirir pelo menos uma vez o status "faminto"',
    name: 'Tábata Pelegrini',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_01',
    medal: medalsSurvival.SurvivalPlatinumTripleGreen,
    description: 'Sobreviva a um confronto com um xenomorfo com apenas 1 ponto de vida restante.',
    name: 'Escapou por um Fio',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_02',
    medal: medalsUnique.UniquePlatinumTripleBlack,
    description: 'Elimine uma colônia inteira de xenomorfos sem sofrer nenhuma baixa.',
    name: 'Limpeza Profunda',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_03',
    medal: medalsUnique.UniquePlatinumTripleYellow,
    description: 'Escape de uma nave prestes a explodir.',
    name: 'Escapadinha Espacial',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_04',
    medal: medalsUnique.UniqueGoldTripleYellow,
    description: 'Sobreviva a um abraço carinhoso de um Facehugger sem ser infectado.',
    name: 'Com as vacinas em dia',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_05',
    medal: medalsUnique.UniquePlatinumSingleGreen,
    description: 'Tenha três lesões críticas consecutivas contra você e sobreviva.',
    name: 'Maré de Azar',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_06',
    medal: medalsUnique.UniquePlatinumTripleBlack,
    description: 'Experimente carne de Alien e não vomite.',
    name: 'Gourmet Intergaláctico',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_07',
    medal: medalsUnique.UniqueGoldSingleGreen,
    description: 'Salve um companheiro de equipe de um ataque alienígena em um momento crítico.',
    name: 'Espírito de Equipe',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_08',
    medal: medalsUnique.UniquePlatinumTripleGreen,
    description: 'Priorize salvar civis inocentes em uma missão, mesmo que isso signifique colocar sua própria vida em risco.',
    name: 'Humanidade em Primeiro Lugar',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_09',
    medal: medalsUnique.UniquePlatinumTripleYellow,
    description: 'Resolva um conflito com uma facção através de negociações pacíficas, evitando um confronto armado.',
    name: 'Negociação Diplomática',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_10',
    medal: medalsUnique.UniqueGoldTripleRed,
    description: 'Descubra uma traição entre os próprios fuzileiros, revelando um espião infiltrado ou um conspirador.',
    name: 'É o ciano!!!',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_11',
    medal: medalsUnique.UniquePlatinumTripleRed,
    description: 'Execute uma ordem difícil, mas necessária, que vá contra seus princípios morais em prol da sobrevivência da equipe.',
    name: 'Coração de Ferro',
    character: [{
      name: André,
      date: '28/09/2024',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_12',
    medal: medalsUnique.UniqueSilverDoubleGreen,
    description: 'Desative uma armadilha usando apenas habilidades humanas, sem depender de tecnologia avançada.',
    name: 'Eu confio no meu taco',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_13',
    medal: medalsUnique.UniquePlatinumTripleYellow,
    description: 'Mantenha a sanidade mental após enfrentar horrores cósmicos e sobreviver a um encontro direto com a Rainha Alien.',
    name: 'Bobo da Corte',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_14',
    medal: medalsUnique.UniqueSilverTripleGreen,
    description: 'Una-se a outras facções para enfrentar uma ameaça maior em uma batalha épica.',
    name: 'Deixando as diferenças de lado',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_15',
    medal: medalsUnique.UniquePlatinumTripleBlack,
    description: 'Matar um cientista',
    name: 'Dessa vez não!!!!',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_16',
    medal: medalsUnique.UniquePlatinumTripleRed,
    description: 'Seja responsável parcial ou integralmente por uma catástrofe nuclear',
    name: 'New Chernobyl',
    character: [{
      name: André,
      date: '22/06/2024',
    },
    {
      name: Fernando,
      date: '22/06/2024',
    },
    {
      name: Bruno,
      date: '22/06/2024',
    }] },
  { id: 'other_group_17',
    medal: medalsUnique.UniquePlatinumTripleGreen,
    description: 'Protagonize uma cena cinematográfica na campanha',
    name: 'Traga um oscar para esse jogador',
    character: [{
      name: André,
      date: '25/08/2024',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_18',
    medal: medalsUnique.UniquePlatinumTripleGreen,
    description: 'Tente protagonizar uma cena cinematográfica na campanha e falhe miseravelmente',
    name: 'Traga dois oscar para caso ele perca o primeiro',
    character: [{
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_19',
    medal: medalsUnique.UniqueGoldTripleGreen,
    description: 'Finalize uma missão complexa sem nenhuma baixa oficial',
    name: 'Entrar e sair, sem casualidades',
    character: [{
      name: '',
      date: '',
    },
    {
      name: Fernando,
      date: '07/09/2024',
    },
    {
      name: '',
      date: '',
    }] },
  { id: 'other_group_19',
    medal: medalsUnique.UniqueBronzeSingleBlack,
    description: 'Perca um personagem',
    name: 'Descanse em paz',
    character: [{
      name: André,
      date: '06/10/2024',
    },
    {
      name: Fernando,
      date: '12/10/24',
    },
    {
      name: '',
      date: '',
    }] },
];
