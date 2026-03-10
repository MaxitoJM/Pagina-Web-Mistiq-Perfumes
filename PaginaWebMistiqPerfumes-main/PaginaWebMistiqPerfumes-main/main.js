import { initCatalogExperience } from './catalog-page.js';
import { initHeroSplashCursor } from './splash-cursor.js';
import { mountSiteShell, setupRevealObserver } from './ui.js';

mountSiteShell('home');
initHeroSplashCursor();
initCatalogExperience({ initialView: 'all' });
setupRevealObserver();
