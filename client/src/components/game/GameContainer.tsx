import { useEffect, useRef } from 'react';

export default function GameContainer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create a container for the game that maintains aspect ratio
    const gameContainer = containerRef.current;
    const canvas = document.createElement('canvas');
    canvas.id = 'gameCanvas';
    
    // Create and expose the canvas context globally
    const context = canvas.getContext('2d');
    if (!context) {
      console.error('Could not get canvas context');
      return;
    }
    window.c = context;
    
    gameContainer.appendChild(canvas);

    // Create the overlapping div needed for transitions
    const overlappingDiv = document.createElement('div');
    overlappingDiv.id = 'overlappingDiv';
    overlappingDiv.style.cssText = `
      background-color: black;
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      opacity: 0;
      pointer-events: none;
      z-index: 10;
    `;
    gameContainer.appendChild(overlappingDiv);

    // Create dialogue box
    const dialogueBox = document.createElement('div');
    dialogueBox.id = 'characterDialogueBox';
    dialogueBox.style.cssText = `
      background-color: white;
      height: 140px;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      border-top: 4px black solid;
      display: none;
      padding: 12px;
      cursor: pointer;
    `;
    gameContainer.appendChild(dialogueBox);

    const updateCanvasSize = () => {
      const containerWidth = gameContainer.clientWidth;
      const containerHeight = gameContainer.clientHeight;
      const gameAspectRatio = 16/9;

      let width = containerWidth;
      let height = containerWidth / gameAspectRatio;

      if (height > containerHeight) {
        height = containerHeight;
        width = containerHeight * gameAspectRatio;
      }

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      canvas.width = 1024;
      canvas.height = 576;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Define scripts to load in order
    const scripts = [
      // Third party dependencies
      { src: 'https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js', global: true },
      { src: 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.9.1/gsap.min.js', global: true },
      
      // Game data (these need to be loaded first and made global)
      { src: '/memewars/data/collisions.js', global: true },
      { src: '/memewars/data/battleZones.js', global: true },
      { src: '/memewars/data/characters.js', global: true },
      { src: '/memewars/data/attacks.js', global: true },
      { src: '/memewars/data/monsters.js', global: true },
      { src: '/memewars/data/audio.js', global: true },
      { src: '/memewars/data/guilds.js', global: true },
      
      // Core game classes and utilities (need to be global)
      { src: '/memewars/js/utils.js', global: true },
      { src: '/memewars/classes.js', global: true },
      
      // Game logic modules
      { src: '/memewars/data/playerState.js' },
      { src: '/memewars/battleScene.js' },
      { src: '/memewars/guildSelect.js' },
      { src: '/memewars/index.js' },
    ];

    const loadScript = (scriptData: { src: string, global?: boolean }) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = scriptData.src;
        
        if (!scriptData.global) {
          script.type = 'module';
        }
        
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    // Add image preloader before script loading
    const preloadImages = async () => {
      const imagePaths = [
        '/memewars/img/map.png',
        '/memewars/img/foregroundObjects.png',
        '/memewars/img/playerDown.png',
        '/memewars/img/playerUp.png',
        '/memewars/img/playerLeft.png',
        '/memewars/img/playerRight.png',
        '/memewars/img/villager/Idle.png',
        '/memewars/img/oldMan/Idle.png',
        '/memewars/img/Pellet Town.png', // Add map image
        // Add any other image paths your game uses
      ];

      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = (e) => {
            console.error(`Failed to load image: ${src}`, e);
            reject(e);
          };
          img.src = src;
        });
      };

      try {
        const loadedImages = await Promise.all(imagePaths.map(loadImage));
        // Store images both by path and by filename
        window.gameImages = loadedImages.reduce((acc, img, i) => {
          const path = imagePaths[i];
          acc[path] = img;
          // Also store by filename for backwards compatibility
          const filename = path.split('/').pop() || path;
          acc[filename] = img;
          return acc;
        }, {} as Record<string, HTMLImageElement>);
      } catch (error) {
        console.error('Failed to load images:', error);
      }
    };

    const initGame = async () => {
      try {
        // First preload images
        await preloadImages();
        
        // Then load scripts
        for (const script of scripts) {
          await loadScript(script);
        }

        setTimeout(() => {
          if (window.initGame) {
            window.initGame();
          }
        }, 100);

      } catch (error) {
        console.error('Error initializing game:', error);
      }
    };

    initGame();

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      scripts.forEach(({src}) => {
        const script = document.querySelector(`script[src="${src}"]`);
        if (script) {
          document.body.removeChild(script);
        }
      });
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      if (overlappingDiv.parentNode) {
        overlappingDiv.parentNode.removeChild(overlappingDiv);
      }
      if (dialogueBox.parentNode) {
        dialogueBox.parentNode.removeChild(dialogueBox);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none border border-cyan-500/20" />
    </div>
  );
}

// Update type definitions
declare global {
  interface Window {
    initGame?: () => void;
    collisions?: number[];
    battleZonesData?: number[];
    charactersMapData?: number[];
    audio?: any;
    gsap?: any;
    Boundary?: any;
    Sprite?: any;
    Monster?: any;
    Character?: any;
    rectangularCollision?: (args: any) => boolean;
    checkForCharacterCollision?: (args: any) => void;
    c?: CanvasRenderingContext2D;
    gameImages?: Record<string, HTMLImageElement>;
  }
} 