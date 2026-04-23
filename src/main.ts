import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';
import { DeckBuilderScene } from './scenes/DeckBuilderScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  backgroundColor: '#08080f',
  scene: [MenuScene, GameScene, GameOverScene, DeckBuilderScene],
  parent: document.body,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
    pixelArt: false,
    resolution: window.devicePixelRatio ?? 1,
  } as Phaser.Types.Core.RenderConfig,
};

// Wait for fonts to load before starting the game
document.fonts.ready.then(() => {
  new Phaser.Game(config);
});
