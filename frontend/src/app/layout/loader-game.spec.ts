import { hits } from './loader-game';

describe('hits', () => {
  const player = { x: 48, y: 100, w: 30, h: 30 };

  it('détecte un obstacle qui chevauche le joueur', () => {
    expect(hits(player, { x: 60, y: 110, w: 20, h: 24 })).toBe(true);
  });

  it('ignore un obstacle éloigné ou à peine frôlé', () => {
    expect(hits(player, { x: 200, y: 110, w: 20, h: 24 })).toBe(false);
    expect(hits(player, { x: 76, y: 110, w: 20, h: 24 })).toBe(false); // 2 px de recouvrement < marge
  });

  it('laisse passer un joueur qui saute au-dessus', () => {
    expect(hits({ ...player, y: 40 }, { x: 55, y: 106, w: 20, h: 24 })).toBe(false);
  });
});
