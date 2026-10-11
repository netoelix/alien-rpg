import { StarGrid } from '../components/StarGrid.jsx';
import { useCampaign } from '../context/CampaignContext.jsx';
import { Breadcrumbs, Eyebrow, RouteLink } from '../components/Common.jsx';

export function MapPage() {
  const { campaign, timelines } = useCampaign();
  return (
    <>
      <Breadcrumbs>Navegação estelar</Breadcrumbs>
      <Eyebrow>Cartografia / um quadrado = um parsec</Eyebrow>
      <h1>Mapa de {campaign.title}</h1>
      <p className="map-note">
        Cartografia em construção: Sol cadastrado como origem. Os demais sistemas oficiais aguardam
        conferência de coordenadas. As rotas ainda não estão traçadas.
      </p>
      <StarGrid campaign={campaign} />
      <details>
        <summary>Mapa oficial de referência</summary>
        <img
          src="/assets/galaxy-map.jpg"
          alt="Mapa oficial Stars of the Middle Heavens"
          style={{ width: '100%' }}
        />
      </details>
      <details>
        <summary>Paradas registradas na campanha ({timelines.length})</summary>
        {timelines.map((mission, index) => (
          <p key={index}>
            <RouteLink to={'mission/' + index}>
              {mission.dateTime} · {mission.location} · {mission.mission}
            </RouteLink>
          </p>
        ))}
      </details>
    </>
  );
}
