import { createContext, useContext } from 'react';

export const CampaignContext = createContext(null);

export function useCampaign() {
  const campaign = useContext(CampaignContext);
  if (!campaign) throw new Error('Campanha não selecionada.');
  return campaign;
}

export const ArchiveContext = createContext([]);
export const useArchiveModels = () => useContext(ArchiveContext);
