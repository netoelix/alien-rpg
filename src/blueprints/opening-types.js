export const openingNames = {
  door: 'Porta',
  armoredDoor: 'Porta blindada',
  airlock: 'Porta estanque',
  shutter: 'Porta de enrolar',
  window: 'Janela',
  fortifiedWindow: 'Janela fortificada',
  slimWindow: 'Janela fina',
};
export const isWindow = (type) => ['window', 'fortifiedWindow', 'slimWindow'].includes(type);
