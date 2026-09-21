import { ChangeEvent, CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Check, ChevronDown, Film, LockKeyhole, Music2, Sparkles, VolumeX } from 'lucide-react';
import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

// Change this one line to make the universe yours.
const RECIPIENT_NAME = 'Nourine';

type FragmentId = 'dawn' | 'tide' | 'wish';
type Memory = { caption: string; image?: string };

const fragments: { id: FragmentId; name: string; hint: string }[] = [
  { id: 'dawn', name: 'The Dawn Shard', hint: 'Hidden where new days begin' },
  { id: 'tide', name: 'The Tidal Shard', hint: 'Listen for the pull of the moon' },
  { id: 'wish', name: 'The Wish Shard', hint: 'Found wherever a brave heart hopes' },
];

const wishes = [
  'May every door that opens for you lead somewhere extraordinary.',
  'May you always remember how much light you bring into a room.',
  'May the next chapter surprise you in the gentlest, wildest ways.',
];

const HAPPY_BIRTHDAY_TUNE = [
  [392, 0.28], [392, 0.28], [440, 0.55], [392, 0.55], [523.25, 0.55], [493.88, 0.95],
  [392, 0.28], [392, 0.28], [440, 0.55], [392, 0.55], [587.33, 0.55], [523.25, 0.95],
  [392, 0.28], [392, 0.28], [783.99, 0.55], [659.25, 0.55], [523.25, 0.55], [493.88, 0.55], [440, 0.95],
  [698.46, 0.28], [698.46, 0.28], [659.25, 0.55], [523.25, 0.55], [587.33, 0.55], [523.25, 1.1],
] as const;

function scheduleHappyBirthday(context: AudioContext, destination: AudioNode, startTime: number) {
  let cursor = startTime;

  HAPPY_BIRTHDAY_TUNE.forEach(([frequency, duration]) => {
    const oscillator = context.createOscillator();
    const noteGain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = frequency;
    noteGain.gain.setValueAtTime(0.0001, cursor);
    noteGain.gain.exponentialRampToValueAtTime(0.11, cursor + 0.025);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, cursor + duration - 0.04);
    oscillator.connect(noteGain).connect(destination);
    oscillator.start(cursor);
    oscillator.stop(cursor + duration);
    cursor += duration + 0.035;
  });

  return cursor - startTime;
}

function makeStars(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: `${(index * 37 + 9) % 100}%`,
    top: `${(index * 61 + 5) % 88}%`,
    size: `${(index % 3) + 2}px`,
    duration: `${2.2 + (index % 5) * .55}s`,
  }));
}

function StarField({ count = 35 }: { count?: number }) {
  const stars = useMemo(() => makeStars(count), [count]);
  return (
    <div className="stars" aria-hidden="true">
      {stars.map((star) => (
        <span
          className="star"
          key={star.id}
          style={{ left: star.left, top: star.top, '--size': star.size, '--duration': star.duration } as CSSProperties}
        />
      ))}
    </div>
  );
}

function PortalBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <span className="portal-burst" aria-hidden="true">
      {Array.from({ length: 18 }, (_, index) => (
        <span
          className="burst-particle"
          key={index}
          style={{ '--angle': `${index * 20}deg`, animationDelay: `${index * .025}s` } as CSSProperties}
        />
      ))}
    </span>
  );
}

function Dragon() {
  return (
    <div className="dragon" aria-label="A friendly dragon crosses the sky">
      <span className="dragon-wing one" />
      <span className="dragon-wing two" />
      <span className="dragon-head" />
      <span className="dragon-body" />
      <span className="dragon-tail" />
    </div>
  );
}

function Companion() {
  return (
    <div className="companion-wrap" aria-label="Your glowing companion, Lumen">
      <div className="companion">
        <div className="companion-aura" />
        <div className="companion-body" />
        <div className="companion-face" />
        <div className="companion-crown" />
      </div>
      <p className="companion-speech">“I have been waiting for you, {RECIPIENT_NAME}.”</p>
    </div>
  );
}

function Fireworks() {
  const bursts = useMemo(() => Array.from({ length: 28 }, (_, index) => ({
    id: index,
    left: `${8 + ((index * 31) % 84)}%`,
    top: `${10 + ((index * 17) % 48)}%`,
    angle: `${index * 27}deg`,
    distance: `${50 + (index % 4) * 22}px`,
    delay: `${(index % 8) * .08}s`,
  })), []);
  return (
    <div aria-hidden="true">
      {bursts.map((burst) => (
        <span
          className="firework"
          key={burst.id}
          style={{
            left: burst.left,
            top: burst.top,
            '--angle': burst.angle,
            '--distance': burst.distance,
            animationDelay: burst.delay,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}

function Intro({ onEnter }: { onEnter: () => void }) {
  const [burst, setBurst] = useState(false);
  const enter = () => {
    setBurst(true);
    onEnter();
    window.setTimeout(() => setBurst(false), 900);
  };
  return (
    <section className="scene intro" id="beginning">
      <StarField count={54} />
      <div className="moon" aria-hidden="true" />
      <div className="scene-inner intro-content">
        <p className="scene-kicker">A private universe, addressed to</p>
        <h1 className="scene-title"><span className="gold-text">{RECIPIENT_NAME}</span><br />of the stars</h1>
        <p className="scene-copy">Tonight, the ordinary sky has made room for something extraordinary. There is a path waiting in the dark.</p>
        <button className="portal-button" onClick={enter} data-testid="button-enter-portal" aria-label="Enter the magical portal">
          <Sparkles size={27} strokeWidth={1.2} />
          <PortalBurst active={burst} />
        </button>
        <p className="portal-label">Touch the portal to begin</p>
      </div>
      <button className="scroll-cue" onClick={onEnter} data-testid="button-scroll-journey" aria-label="Scroll to begin">
        <ChevronDown size={15} /> follow the light
      </button>
    </section>
  );
}

function Journey() {
  return (
    <section className="scene galaxy" id="journey">
      <Dragon />
      <div className="scene-inner journey-layout">
        <div>
          <p className="scene-kicker">Chapter one · the crossing</p>
          <h2 className="scene-title journey-title">The sky <em>knows</em> your name.</h2>
          <p className="scene-copy">Every star in this corridor has a story. Tonight, they are spelling out a new one — the one that begins with <span className="name-shimmer">{RECIPIENT_NAME}</span>.</p>
          <p className="scene-copy">Keep walking. Lumen, your small and loyal guide, is carrying the map.</p>
        </div>
        <Companion />
      </div>
    </section>
  );
}

function Quest({ collected, onCollect, onUnlock }: { collected: FragmentId[]; onCollect: (id: FragmentId) => void; onUnlock: () => void }) {
  const complete = collected.length === fragments.length;
  return (
    <section className="scene quest" id="quest">
      <div className="scene-inner quest-layout">
        <div className="quest-copy">
          <p className="scene-kicker">Chapter two · a tiny quest</p>
          <h2 className="scene-title">Find what the stars hid.</h2>
          <p className="scene-copy">Three fragments fell from the anniversary constellation. Gather them, and the old castle will open its gates to your gift.</p>
          <div className="fragment-list">
            {fragments.map((fragment) => {
              const isCollected = collected.includes(fragment.id);
              return (
                <button
                  className={`fragment-card ${isCollected ? 'collected' : ''}`}
                  key={fragment.id}
                  onClick={() => onCollect(fragment.id)}
                  disabled={isCollected}
                  data-testid={`button-collect-${fragment.id}`}
                >
                  <span className="fragment-orb" />
                  <span className="fragment-meta">
                    <span className="fragment-name">{fragment.name}</span>
                    <span className="fragment-hint">{isCollected ? 'Safely tucked in the map' : fragment.hint}</span>
                  </span>
                  {isCollected ? <span className="check-mark"><Check size={12} /></span> : <Sparkles size={15} color="var(--gold)" />}
                </button>
              );
            })}
          </div>
          <button className="unlock-button" onClick={onUnlock} disabled={!complete} data-testid="button-unlock-gift">
            {complete ? 'Open the castle gates' : `${collected.length} of 3 fragments found`}
          </button>
        </div>
        <div className="quest-illustration" aria-hidden="true">
          <div className="quest-orbit" />
          <div className="quest-key"><span>{complete ? 'the path is lit' : 'listen closely'}</span></div>
        </div>
      </div>
    </section>
  );
}

function Castle() {
  return (
    <section className="scene castle" id="castle">
      <div className="scene-inner castle-layout">
        <div className="castle-drawing" aria-label="A moonlit castle awaits">
          <div className="castle-moon" />
          <div className="castle-silhouette" />
        </div>
        <div className="castle-copy">
          <p className="scene-kicker">Chapter three · arrival</p>
          <h2 className="scene-title">Welcome to the place wishes go.</h2>
          <p className="scene-copy">Beyond the final hill, the castle has been keeping your anniversary surprise safe. Its windows are lit for you alone.</p>
          <p className="arrival-note">You made it, {RECIPIENT_NAME}. The best part is just beyond the courtyard.</p>
        </div>
      </div>
    </section>
  );
}

function WishTree() {
  const [wish, setWish] = useState(0);
  return (
    <section className="scene tree-section" id="wishes">
      <div className="scene-inner tree-layout">
        <div className="tree-art" aria-label="A glowing wish tree">
          <div className="tree-crown" />
          <div className="tree-trunk" />
          {Array.from({ length: 14 }, (_, index) => (
            <span className="tree-star" key={index} style={{ left: `${24 + ((index * 29) % 51)}%`, top: `${16 + ((index * 37) % 43)}%`, animationDelay: `${index * -.23}s` }} />
          ))}
        </div>
        <div className="wish-panel">
          <p className="scene-kicker">The wish tree</p>
          <h3>Pick a little blessing.</h3>
          <p data-testid="text-current-wish">{wishes[wish]}</p>
          <div className="wish-buttons">
            {wishes.map((_, index) => (
              <button className={`wish-button ${wish === index ? 'active' : ''}`} key={index} onClick={() => setWish(index)} data-testid={`button-wish-${index + 1}`}>
                {String(index + 1).padStart(2, '0')} · reveal wish
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Memories({ memories, onAddPhoto }: { memories: Memory[]; onAddPhoto: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <section className="scene memories" id="memories">
      <div className="scene-inner">
        <div className="memory-head">
          <div>
            <p className="scene-kicker">A little archive of wonder</p>
            <h2 className="scene-title">Moments worth keeping.</h2>
          </div>
          <p className="memory-intro">The universe left three frames open. Add a photo from your own constellation, if you like.</p>
        </div>
        <div className="memory-stage">
          {memories.map((memory, index) => (
            <div className={`memory-frame ${memory.image ? 'uploaded' : ''}`} style={{ '--rotation': `${[-7, 5, 8][index]}deg` } as CSSProperties} key={index} data-testid={`frame-memory-${index + 1}`}>
              <div className="memory-photo" style={memory.image ? { backgroundImage: `url(${memory.image})` } : undefined}>
                {!memory.image && <span>{index === 0 ? 'a new day' : index === 1 ? 'wild laughter' : 'soft magic'}</span>}
              </div>
              <span className="memory-caption">{memory.caption}</span>
            </div>
          ))}
          <label className="add-memory" htmlFor="memory-upload" data-testid="button-add-memory">
            <Camera size={15} /> add a memory
            <input className="hidden-file" id="memory-upload" type="file" accept="image/*" onChange={onAddPhoto} data-testid="input-memory-photo" />
          </label>
        </div>
        <figure className="memory-video-card" data-testid="memory-video">
          <div className="memory-video-frame">
            <video
              className="memory-video"
              controls
              playsInline
              preload="metadata"
              src={`${import.meta.env.BASE_URL}nourine-birthday-memory.mp4`}
              aria-label={`An anniversary video memory for ${RECIPIENT_NAME}`}
            />
            <span className="video-sheen" aria-hidden="true" />
          </div>
          <figcaption className="memory-video-caption">
            <span className="video-kicker"><Film size={14} /> a moving memory</span>
            <strong>A moment kept in motion.</strong>
            <span>This little piece of the real world now has a place among the stars.</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

function Reveal({ unlocked, open, onOpen }: { unlocked: boolean; open: boolean; onOpen: () => void }) {
  return (
    <section className={`scene reveal ${open ? 'chest-open' : ''}`} id="reveal">
      <div className="scene-inner">
        {open && <Fireworks />}
        <p className="scene-kicker">The anniversary treasure</p>
        <h2 className="scene-title">One last secret.</h2>
        <button className="chest-button" onClick={onOpen} disabled={!unlocked || open} data-testid="button-open-chest" aria-label={unlocked ? 'Open the anniversary treasure chest' : 'Collect the star fragments first'}>
          <span className="chest-lid" />
          <span className="chest-base" />
          <span className="chest-lock">{unlocked ? '' : <LockKeyhole size={13} color="#4c2c51" />}</span>
        </button>
        {!unlocked && <p className="reveal-hint">The lock listens for three star fragments.</p>}
        {unlocked && !open && <p className="reveal-hint">The treasure is yours. Touch the chest.</p>}
        {open && (
          <article className="letter" data-testid="birthday-letter">
            <p className="letter-kicker">A letter from the whole sky</p>
            <h3>Dear {RECIPIENT_NAME},</h3>
            <p>Some people arrive in the world and make it feel a little more possible. You are one of those rare souls — the kind who turns ordinary hours into stories worth telling.</p>
            <p>May this next orbit bring you brave beginnings, ridiculous laughter, gentle surprises, and every kind of joy you have been too humble to ask for. You deserve a life that feels like it was written with the stars paying attention.</p>
            <p>Today is yours. Let it be loud, soft, sparkling, and entirely your own.</p>
            <p className="letter-sign">With all the magic in the universe,<br />Your forever fan</p>
          </article>
        )}
      </div>
    </section>
  );
}

function Finale() {
  return (
    <section className="scene finale" id="finale">
      <StarField count={40} />
      <div className="scene-inner">
        <p className="scene-kicker">The sky's final spell</p>
        <div className="sky-words" aria-label="Happy Anniversary">
          {'HAPPY ANNIVERSARY'.split(' ').map((word) => <span key={word}>{word}</span>)}
        </div>
        <div className="finale-rule" />
        <p className="finale-sub">Made Especially For You</p>
        <p className="finale-credit">Created with Magic by Mark <span className="heart-mark" aria-hidden="true" /></p>
      </div>
    </section>
  );
}

function Home() {
  const [soundOn, setSoundOn] = useState(false);
  const [portalEntered, setPortalEntered] = useState(false);
  const [collected, setCollected] = useState<FragmentId[]>([]);
  const [giftUnlocked, setGiftUnlocked] = useState(false);
  const [chestOpen, setChestOpen] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([
    { caption: 'somewhere beautiful' },
    { caption: 'the kind of day that stays' },
    { caption: 'a future memory' },
  ]);
  const musicRef = useRef<{
    context: AudioContext;
    musicGain: GainNode;
    play: () => void;
  } | null>(null);

  useEffect(() => {
    if (!soundOn || musicRef.current) return;

    const AudioContextConstructor =
      window.AudioContext ??
      (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextConstructor) return;

    const context = new AudioContextConstructor();
    const musicGain = context.createGain();
    musicGain.gain.value = 0.7;
    musicGain.connect(context.destination);
    const play = () => {
      void context.resume();
      scheduleHappyBirthday(context, musicGain, context.currentTime + 0.08);
    };
    musicRef.current = { context, musicGain, play };
    play();
    const songDuration = HAPPY_BIRTHDAY_TUNE.reduce((total, [, duration]) => total + duration + 0.035, 0);
    const songTimer = window.setInterval(play, (songDuration + 1.7) * 1000);

    return () => {
      window.clearInterval(songTimer);
      musicGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.6);
      window.setTimeout(() => void context.close(), 700);
      musicRef.current = null;
    };
  }, [soundOn]);

  useEffect(() => {
    if (!portalEntered) return;
    document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' });
  }, [portalEntered]);

  const enterPortal = () => {
    setPortalEntered(true);
    window.setTimeout(() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' }), 120);
  };

  const collectFragment = (id: FragmentId) => {
    setCollected((current) => current.includes(id) ? current : [...current, id]);
  };

  const unlockGift = () => {
    if (collected.length !== 3) return;
    setGiftUnlocked(true);
    window.setTimeout(() => document.getElementById('castle')?.scrollIntoView({ behavior: 'smooth' }), 120);
  };

  const openChest = () => {
    if (!giftUnlocked) return;
    setChestOpen(true);
    musicRef.current?.play();
    window.setTimeout(() => document.getElementById('finale')?.scrollIntoView({ behavior: 'smooth' }), 850);
  };

  const addPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setMemories((current) => current.map((memory, index) => index === 2 ? { ...memory, image: String(reader.result), caption: 'a memory you chose' } : memory));
    };
    reader.readAsDataURL(file);
  };

  return (
    <main className="experience">
      <header className="story-topbar">
        <span className="story-mark">A universe for {RECIPIENT_NAME}</span>
        <button className={`sound-toggle ${soundOn ? 'is-playing' : ''}`} onClick={() => setSoundOn((current) => !current)} data-testid="button-toggle-sound-top">
          {soundOn ? <Music2 size={14} /> : <VolumeX size={14} />}
          <span className="music-bars" aria-hidden="true"><i /><i /><i /><i /></span>
          <span className="sound-label">{soundOn ? 'music on' : 'sound off'}</span>
        </button>
      </header>
      <Intro onEnter={enterPortal} />
      <Journey />
      <Quest collected={collected} onCollect={collectFragment} onUnlock={unlockGift} />
      <Castle />
      <WishTree />
      <Memories memories={memories} onAddPhoto={addPhoto} />
      <Reveal unlocked={giftUnlocked} open={chestOpen} onOpen={openChest} />
      <Finale />
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;