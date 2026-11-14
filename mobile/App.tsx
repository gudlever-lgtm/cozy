import React, {useEffect, useRef, useState} from 'react';
import {Animated, Easing, Image, ImageBackground, PanResponder, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {applyMove, canAutoFinish, hint, isWon, legalMoves, newGame, undo} from '../src/domain/solitaire/klondike';
import type {Card,Move,State} from '../src/domain/solitaire/klondike';
import {balance, emptyLedger, record} from '../src/domain/rewards/ledger';
import type {Ledger} from '../src/domain/rewards/ledger';
import {loadGame, saveGame} from '../src/persistence/save';
import {nativeSaveStore} from './src/nativeSave';
import {readGarden,writeGarden} from './src/nativeGarden';
import type {DecorationPlacement} from '../src/domain/garden/layout';
import {clampGardenOffset} from '../src/domain/garden/viewport';
import {moveGardenDecoration} from '../src/domain/garden/drag';
import {gardenChapters,unlockedChapter,specialDecorationUnlocked} from '../src/domain/garden/chapters';
import {cozyLayout} from '../src/domain/ui/responsive';
import {defaultSettings,readSettings,writeSettings} from './src/nativeSettings';
import type {Season,CozySettings} from './src/nativeSettings';
import {CardBack,CardFace,DraggableCard} from './src/DraggableCard';
import {DraggableDecoration} from './src/DraggableDecoration';
import {autoPlace} from '../src/domain/solitaire/autoPlace';
import {cardForVisualMove,tableauLandingOffset,visibleTableauIndexes} from '../src/domain/solitaire/visualMoves';
import {CozyButton} from './src/CozyButton';
import {MemoryBoard} from './src/MemoryBoard';
import {newMemoryGame,revealMemory,hideMismatch,memoryWon} from '../src/domain/minigames/memory';
import {readMemory,writeMemory} from './src/nativeMemory';
import {addQuestEvent,quests} from '../src/domain/quests/quests';
import type {QuestEvent,QuestEventKind} from '../src/domain/quests/quests';
import {readQuestEvents,writeQuestEvents} from './src/nativeQuestEvents';
import {checkForCozyUpdate} from './src/checkUpdate';
import {activeModeIndex,modeUnlocked,solitaireModes,winsForMode} from '../src/domain/solitaire/progression';
import {glowTargets} from '../src/domain/minigames/glow';

type Screen = 'garden' | 'cards' | 'mini' | 'quests' | 'settings';
type Source = {kind:'waste' | 'tableau' | 'foundation'; from:number; at:number};
type MeasuredElement={measureInWindow:(callback:(x:number,y:number,width:number,height:number)=>void)=>void};
type Rect={x:number;y:number;width:number;height:number};
type CardFlight={card:Card;faceUp:boolean;mode:'hint'|'finish';from:Rect;dx:number;dy:number};
type DragVisual={id:string;card:Card;run:Card[];x:number;y:number};
function measure(element:MeasuredElement|null|undefined):Promise<Rect|null>{
  return new Promise(resolve=>element?element.measureInWindow((x,y,width,height)=>
    resolve(width>0&&height>0?{x,y,width,height}:null)):resolve(null));
}
const tabs = [
  {id:'garden', label:'Have', icon:require('./assets/illustrations/nav-icon-0.webp')},
  {id:'cards',label:'Kabale',icon:require('./assets/illustrations/nav-icon-1.webp')},
  {id:'mini',label:'Minispil',icon:require('./assets/illustrations/nav-icon-2.webp')},
  {id:'quests',label:'Opgaver',icon:require('./assets/illustrations/nav-icon-3.webp')},
  {id:'settings',label:'Indstil',icon:require('./assets/illustrations/nav-icon-4.webp')},
] as const;
const decorations = [
  {name:'Bænk',image:require('./assets/illustrations/bench.webp')},
  {name:'Springvand',image:require('./assets/illustrations/fountain.webp')},
  {name:'Blomster',image:require('./assets/illustrations/flower-pots.webp')},
  {name:'Skovven',image:require('./assets/illustrations/memory-animal-0.webp')},
  {name:'Vinterven',image:require('./assets/illustrations/memory-animal-1.webp')},
] as const;
const gardenIllustrations={
  spring:require('./assets/illustrations/garden-spring.webp'),
  summer:require('./assets/illustrations/garden-summer.webp'),
  autumn:require('./assets/illustrations/garden-autumn.webp'),
  winter:require('./assets/illustrations/garden-winter.webp'),
};
const solitaireTable=require('./assets/illustrations/solitaire-table.webp');
const premiumCardBack=require('./assets/illustrations/card-back-premium.webp');
const cozyAppLogo=require('./assets/icon.png');

export default function App() {
  useEffect(()=>{
    const timer=setTimeout(()=>{void checkForCozyUpdate();},6500);
    return ()=>clearTimeout(timer);
  },[]);
  const [screen,setScreen] = useState<Screen>('garden');
  const [miniMenuOpen,setMiniMenuOpen]=useState(false);
  const [miniKind,setMiniKind]=useState<'memory'|'glow'|'season'>('memory');
  const [glowRound,setGlowRound]=useState(0);
  const [glowFound,setGlowFound]=useState<number[]>([]);
  const [glowTried,setGlowTried]=useState<number[]>([]);
  const [seasonRound,setSeasonRound]=useState(0);
  const [seasonAnswer,setSeasonAnswer]=useState<number|null>(null);
  const [game,setGame] = useState(() => newGame(20261113));
  const [ledger,setLedger] = useState<Ledger>(()=>emptyLedger());
  const [questEvents,setQuestEvents]=useState<QuestEvent[]>([]);
  const [questEventsLoaded,setQuestEventsLoaded]=useState(false);
  const [questEventsBlocked,setQuestEventsBlocked]=useState(false);
  const [questCategory,setQuestCategory]=useState<'daily'|'weekly'|'milestone'>('daily');
  const [dailyCelebration,setDailyCelebration]=useState(false);
  const celebrationScale=useRef(new Animated.Value(0.3)).current;
  const [loaded,setLoaded] = useState(false);
  const [saveBlocked,setSaveBlocked] = useState(false);
  const [gardenLoaded,setGardenLoaded] = useState(false);
  const [gardenSaveBlocked,setGardenSaveBlocked] = useState(false);
  const [memory,setMemory] = useState(()=>newMemoryGame(20261113));
  const [memoryLoaded,setMemoryLoaded] = useState(false);
  const [memorySaveBlocked,setMemorySaveBlocked] = useState(false);
  const [settings,setSettings] = useState<CozySettings>(defaultSettings);
  const season=settings.season;
  const [settingsLoaded,setSettingsLoaded] = useState(false);
  const [settingsSaveBlocked,setSettingsSaveBlocked] = useState(false);
  const [chosen,setChosen] = useState<Source | null>(null);
  const [draggingCard,setDraggingCard] = useState<string|null>(null);
  const [dragVisual,setDragVisual]=useState<DragVisual|null>(null);
  const dragXY=useRef(new Animated.ValueXY()).current;
  const dragDelta=useRef({x:0,y:0});
  const dragToken=useRef(0);
  const tableauTargets=useRef<Array<MeasuredElement|null>>([]);
  const foundationTargets=useRef<Array<MeasuredElement|null>>([]);
  const cardViews=useRef<Record<string,MeasuredElement|null>>({});
  const stockView=useRef<MeasuredElement|null>(null);
  const wasteView=useRef<MeasuredElement|null>(null);
  const effectSurface=useRef<MeasuredElement|null>(null);
  const [flight,setFlight]=useState<CardFlight|null>(null);
  const [autoRunning,setAutoRunning]=useState(false);
  const flightProgress=useRef(new Animated.Value(0)).current;
  const ringPulse=useRef(new Animated.Value(0)).current;
  const effectToken=useRef(0);
  const hintPulseAnimation=useRef<Animated.CompositeAnimation|null>(null);
  const hintGhostAnimation=useRef<Animated.CompositeAnimation|null>(null);
  useEffect(()=>()=>{
    effectToken.current++;
    hintPulseAnimation.current?.stop();hintGhostAnimation.current?.stop();
    flightProgress.stopAnimation();ringPulse.stopAnimation();
  },[flightProgress,ringPulse]);
  const [message,setMessage] = useState('');
  const [zoom,setZoom] = useState(1);
  const [measuredGardenHeight,setMeasuredGardenHeight] = useState(0);
  const [offset,setOffset] = useState({x:0,y:0});
  const [placed,setPlaced] = useState<DecorationPlacement[]>([]);
  const [gardenTool,setGardenTool] = useState<0|1|2|3|4|null>(null);
  const [gardenChapter,setGardenChapter]=useState<0|1|2>(0);
  const [movingDecoration,setMovingDecoration] = useState<string|null>(null);
  const panOrigin = useRef({x:0,y:0});
  const gardenViewportRef=useRef({width:1,height:1,zoom:1});
  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_,g)=>Math.abs(g.dx)>8 || Math.abs(g.dy)>8,
    onPanResponderGrant:()=>{panOrigin.current=offsetRef.current;},
    onPanResponderMove:(_,g)=>{
      const viewport=gardenViewportRef.current;
      setOffset(clampGardenOffset({x:panOrigin.current.x+g.dx,y:panOrigin.current.y+g.dy},viewport.zoom,viewport.width,viewport.height));
    },
  })).current;
  const offsetRef = useRef(offset);
  offsetRef.current=offset;
  const {width,height} = useWindowDimensions();
  const {landscape,gardenWidth,cardWidth,cardHeight,tableauHeight}=cozyLayout(width,height,settings.cardSize);
  const animationFactor={calm:1.5,normal:1,fast:0.6}[settings.animationSpeed];
  const gardenHeight=measuredGardenHeight || Math.max(200,height-124);
  gardenViewportRef.current={width:gardenWidth,height:gardenHeight,zoom};
  useEffect(()=>setOffset(current=>clampGardenOffset(current,zoom,gardenWidth,gardenHeight)),[zoom,gardenWidth,gardenHeight]);
  const month=new Date().getMonth();
  const actualSeason=season==='auto'?(month===11||month<2?'winter':month<5?'spring':month<8?'summer':'autumn'):season;
  const gardenScene=gardenChapter===1?'spring':gardenChapter===2?'winter':actualSeason;

  function placeInGarden(x:number,y:number){
    // SVG art and touch surface share the same scaled coordinate system.
    const nx=Math.max(0.04,Math.min(0.94,x/gardenWidth));
    const ny=Math.max(0.08,Math.min(0.91,y/gardenHeight));
    if(movingDecoration){
      setPlaced(items=>items.map(item=>item.id===movingDecoration?{...item,x:nx,y:ny}:item));
      setMovingDecoration(null);
      setMessage('Dekoration flyttet og gemt');
    }else if(gardenTool!==null){
      if(placed.length>=64){setMessage('Haven er fuld');return;}
      if(gardenTool>=3){
        if(!specialDecorationUnlocked(ledger,gardenTool as 3|4)){setMessage('Hent først milepælsbelønningen under Opgaver');return;}
        if(placed.some(item=>item.kind===gardenTool)){setMessage('Denne særlige dekoration er allerede placeret');return;}
      }
      const id=`decor-${Date.now()}-${placed.length}`;
      try{
        if(gardenTool<3)setLedger(record(ledger,{id:`garden-purchase-${id}`,type:'spend',amount:5,reason:'Havedekoration'}));
        setPlaced([...placed,{id,kind:gardenTool,x:nx,y:ny,chapter:gardenChapter}]);
        setMessage(gardenTool>=3?'Særlig dekoration placeret ✨':'Dekoration placeret for 5 Lysglimt');
      }catch{setMessage('Du skal bruge 5 Lysglimt for at placere en dekoration');}
      setGardenTool(null);
    }
  }
  function dragGardenDecoration(id:string,dx:number,dy:number){
    if(Math.abs(dx)<6&&Math.abs(dy)<6)return;
    setPlaced(items=>items.map(item=>item.id===id?moveGardenDecoration(item,dx,dy,zoom,gardenWidth,gardenHeight):item));
    setMovingDecoration(null);setGardenTool(null);
    setMessage('Dekoration flyttet og gemt');
  }

  useEffect(()=>{
    let mounted=true;
    loadGame(nativeSaveStore).then(saved=>{
      if (!mounted) return;
      if(saved){setGame(saved.solitaire);setLedger(saved.rewards);}
    }).catch(()=>{if(mounted){setSaveBlocked(true);setMessage('Gemt spil kunne ikke læses. Det eksisterende save overskrives ikke.');}})
      .finally(()=>{if(mounted)setLoaded(true);});
    return ()=>{mounted=false;};
  },[]);

  useEffect(()=>{
    if(!loaded||saveBlocked)return;
    saveGame(nativeSaveStore,game,ledger).catch(()=>setMessage('Kunne ikke gemme spillet på enheden.'));
  },[game,ledger,loaded,saveBlocked]);
  useEffect(()=>{
    let mounted=true;
    readQuestEvents().then(events=>{if(mounted)setQuestEvents(events);})
      .catch(()=>{if(mounted){setQuestEventsBlocked(true);setMessage('Gemte opgavefremskridt kunne ikke læses og overskrives ikke.');}})
      .finally(()=>{if(mounted)setQuestEventsLoaded(true);});
    return ()=>{mounted=false;};
  },[]);
  useEffect(()=>{
    if(questEventsLoaded&&!questEventsBlocked)writeQuestEvents(questEvents).catch(()=>setMessage('Opgavefremskridt kunne ikke gemmes.'));
  },[questEvents,questEventsLoaded,questEventsBlocked]);
  function trackQuest(kind:QuestEventKind,id:string){
    setQuestEvents(previous=>addQuestEvent(previous,{kind,id,at:new Date().toISOString()}));
  }

  useEffect(()=>{
    let mounted=true;
    readGarden().then(items=>{if(mounted)setPlaced(items);})
      .catch(()=>{if(mounted){setGardenSaveBlocked(true);setMessage('Havens gemte dekorationer kunne ikke indlæses og overskrives ikke.');}})
      .finally(()=>{if(mounted)setGardenLoaded(true);});
    return ()=>{mounted=false;};
  },[]);

  useEffect(()=>{
    if(gardenLoaded&&!gardenSaveBlocked)writeGarden(placed).catch(()=>setMessage('Havens ændringer kunne ikke gemmes.'));
  },[placed,gardenLoaded,gardenSaveBlocked]);

  useEffect(()=>{
    let mounted=true;
    readMemory().then(game=>{if(mounted&&game)setMemory(game);})
      .catch(()=>{if(mounted){setMemorySaveBlocked(true);setMessage('Vendespillet kunne ikke indlæses og overskrives ikke.');}})
      .finally(()=>{if(mounted)setMemoryLoaded(true);});
    return ()=>{mounted=false;};
  },[]);
  useEffect(()=>{
    if(memoryLoaded&&!memorySaveBlocked)writeMemory(memory).catch(()=>setMessage('Vendespillet kunne ikke gemmes.'));
  },[memory,memoryLoaded,memorySaveBlocked]);
  useEffect(()=>{
    let mounted=true;
    readSettings().then(value=>{if(mounted)setSettings(value);})
      .catch(()=>{if(mounted){setSettingsSaveBlocked(true);setMessage('Indstillinger kunne ikke indlæses og overskrives ikke.');}})
      .finally(()=>{if(mounted)setSettingsLoaded(true);});
    return ()=>{mounted=false;};
  },[]);
  useEffect(()=>{
    if(settingsLoaded&&!settingsSaveBlocked)writeSettings(settings).catch(()=>setMessage('Indstillinger kunne ikke gemmes.'));
  },[settings,settingsLoaded,settingsSaveBlocked]);
  useEffect(()=>{
    if(!memoryLoaded||memory.revealed.length!==2||memory.tiles[memory.revealed[0]]===memory.tiles[memory.revealed[1]])return;
    const timer=setTimeout(()=>setMemory(current=>hideMismatch(current)),800);
    return ()=>clearTimeout(timer);
  },[memory,memoryLoaded]);
  useEffect(()=>{
    if(!loaded||!memoryLoaded||!memoryWon(memory))return;
    setLedger(previous=>record(previous,{id:`memory-win-${memory.round}`,type:'earn',amount:5,reason:'Skovens vendespil'}));
    if(questEventsLoaded)trackQuest('mini-win',`memory-win-${memory.round}`);
  },[memory,loaded,memoryLoaded,questEventsLoaded]);

  function flipMemory(index:number){
    if(memory.revealed.length===2&&memory.tiles[memory.revealed[0]]!==memory.tiles[memory.revealed[1]])return;
    setMemory(current=>revealMemory(current,index));
  }
  function claimQuest(id:string,reward:number){
    const current=quests(ledger,placed.length,questEvents).find(q=>q.id===id);
    if(!current?.complete||current.claimed||current.reward!==reward)return;
    try{setLedger(previous=>record(previous,{id:`quest-${id}`,type:'earn',amount:reward,reason:'Opgave fuldført'}));
      if(id.endsWith('-bonus')){
        celebrationScale.setValue(0.3);setDailyCelebration(true);
        Animated.sequence([Animated.spring(celebrationScale,{toValue:1.15,friction:4,useNativeDriver:true}),
          Animated.timing(celebrationScale,{toValue:1,duration:300,useNativeDriver:true})]).start();
        setTimeout(()=>setDailyCelebration(false),2300);
      }
    }
    catch{setMessage('Belønningen kunne ikke indløses');}
  }

  useEffect(()=>{
    if(!loaded || !isWon(game))return;
    const mode=solitaireModes[activeModeIndex(game.drawCount,game.maxPasses)];
    setLedger(previous=>record(previous,{id:`solitaire-win-${mode.id}-${game.seed}`,type:'earn',amount:25,reason:`${mode.title} gennemført`}));
    if(questEventsLoaded){trackQuest('solitaire-win',`solitaire-win-${mode.id}-${game.seed}`);
      if(game.drawCount===3)trackQuest('three-win',`three-win-${game.seed}`);}
  },[game,loaded,questEventsLoaded]);
  function startSolitaire(index:number,applyPreference=false){
    if(!modeUnlocked(ledger,index)){setMessage('Vind fem spil i den forrige kabaletype først');return;}
    stopVisualCue();const effectiveIndex=applyPreference&&index===0&&settings.drawPreference===3&&modeUnlocked(ledger,1)?1:index;
    const mode=solitaireModes[effectiveIndex];
    setGame(newGame(Date.now(),mode.drawCount,mode.maxPasses));setChosen(null);setMessage('');
  }
  function collectGlow(index:number){
    if(glowTried.includes(index))return;
    setGlowTried(previous=>[...previous,index]);
    if(!glowTargets(glowRound).includes(index))return;
    const found=[...glowFound,index];setGlowFound(found);
    if(found.length===5){setLedger(previous=>record(previous,{id:`mini-glow-${glowRound}`,type:'earn',amount:5,reason:'Lysglimtjagt fuldført'}));trackQuest('mini-win',`mini-glow-${glowRound}`);}
  }
  function answerSeason(index:number){
    if(seasonAnswer!==null)return;
    setSeasonAnswer(index);
    if(index===seasonRound%4){setLedger(previous=>record(previous,{id:`mini-season-${seasonRound}`,type:'earn',amount:5,reason:'Årstidsquiz fuldført'}));trackQuest('mini-win',`mini-season-${seasonRound}`);}
  }

  function move(to:'tableau' | 'foundation',index:number) {
    if(chosen)executeMove(chosen,to,index);
  }
  function stopVisualCue(){
    effectToken.current++;
    hintPulseAnimation.current?.stop();hintGhostAnimation.current?.stop();
    flightProgress.stopAnimation();ringPulse.stopAnimation();setFlight(null);
  }
  async function locateFlight(state:State,action:Move,mode:'hint'|'finish'):Promise<boolean>{
    const visual=cardForVisualMove(state,action);
    if(!visual)return false;
    const source=action.kind==='draw'?stockView.current:action.kind==='recycle'||action.kind==='waste'?wasteView.current:cardViews.current[visual.id];
    const destination=action.kind==='draw'?wasteView.current:action.kind==='recycle'?stockView.current:
      action.kind==='foundation'?tableauTargets.current[action.to]:
      action.to==='foundation'?foundationTargets.current[action.index]:tableauTargets.current[action.index];
    const [start,end,base]=await Promise.all([measure(source),measure(destination),measure(effectSurface.current)]);
    if(!start||!end||!base)return false;
    setFlight({card:visual,faceUp:visual.up&&action.kind!=='recycle',mode,
      from:{...start,x:start.x-base.x,y:start.y-base.y},
      dx:end.x-start.x,dy:end.y+tableauLandingOffset(state,action)-start.y});
    return true;
  }
  async function playFinish(){
    if(!canAutoFinish(game)||autoRunning)return;
    stopVisualCue();setAutoRunning(true);setChosen(null);
    let current=game;
    try{
      for(let step=0;step<52;step++){
        const action=legalMoves(current).find(candidate=>(candidate.kind==='waste'||candidate.kind==='tableau')&&candidate.to==='foundation');
        if(!action)break;
        const located=await locateFlight(current,action,'finish');
        if(located){
          flightProgress.setValue(0);
          await new Promise<void>(resolve=>setTimeout(resolve,35));
          await new Promise<void>(resolve=>Animated.timing(flightProgress,{toValue:1,duration:Math.round(Math.max(250,510-step*7)*animationFactor),easing:Easing.inOut(Easing.cubic),useNativeDriver:true}).start(()=>resolve()));
        }
        current=applyMove(current,action);
        trackQuest('move',`move-${current.seed}-${current.moves}`);
        setGame(current);setFlight(null);
        await new Promise<void>(resolve=>setTimeout(resolve,75));
      }
      setMessage(isWon(current)?'✨ Fantastisk! Kabalen er fuldført! ✨':'Automatisk tømning er afsluttet');
    }finally{setAutoRunning(false);setFlight(null);}
  }
  function autoMove(source:Source){
    if(autoRunning)return;stopVisualCue();
    const action=autoPlace(game,source);
    if(action){trackQuest('move',`move-${game.seed}-${game.moves+1}`);setGame(current=>applyMove(current,action));setChosen(null);setMessage('');}
    else setMessage('Ingen lovlig plads til dette kort');
  }
  function executeMove(source:Source,to:'tableau'|'foundation',index:number){
    if(autoRunning)return;stopVisualCue();
    if(source.kind==='foundation'&&to==='foundation'){setChosen(null);return;}
    const action:Move = source.kind === 'waste' ? {kind:'waste',to,index} :
      source.kind === 'foundation' ? {kind:'foundation',from:source.from,to:index} :
        {kind:'tableau',from:source.from,at:source.at,to,index};
    if (legalMoves(game).some(m => JSON.stringify(m) === JSON.stringify(action))) {
      trackQuest('move',`move-${game.seed}-${game.moves+1}`);
      setGame(applyMove(game,action));setMessage('');
    } else setMessage('Ulovligt træk');
    setChosen(null);
  }
  function dropCard(source:Source,x:number,y:number){
    const targets=[...foundationTargets.current.map((view,index)=>({view,index,to:'foundation' as const})),
      ...tableauTargets.current.map((view,index)=>({view,index,to:'tableau' as const}))].filter(t=>t.view);
    let pending=targets.length;
    let winner:({index:number;to:'foundation'|'tableau'})|null=null;
    if(!pending)return;
    targets.forEach(target=>target.view!.measureInWindow((left,top,w,h)=>{
      if(x>=left&&x<=left+w&&y>=top&&y<=top+h&&!winner)winner={index:target.index,to:target.to};
      pending--;
      if(pending===0){
        const chosenTarget=winner as {index:number;to:'foundation'|'tableau'}|null;
        if(chosenTarget)executeMove(source,chosenTarget.to,chosenTarget.index);
        else setMessage('Slip kortet på en bunke');
      }
    }));
  }
  function draw() {
    if(autoRunning)return;stopVisualCue();
    const kind = game.stock.length ? 'draw' : 'recycle';
    if (legalMoves(game).some(m => m.kind === kind)){trackQuest('move',`move-${game.seed}-${game.moves+1}`);setGame(applyMove(game,{kind}));}
    else setMessage('Ingen flere kort at trække');
  }
  function showHint(){
    if(autoRunning)return;stopVisualCue();
    const candidate=hint(game).move;
    if(!candidate){setMessage('Ingen lovlige træk');return;}
    const token=effectToken.current;
    void locateFlight(game,candidate,'hint').then(located=>{
      if(!located||token!==effectToken.current)return;
      ringPulse.setValue(0);flightProgress.setValue(0);
      hintPulseAnimation.current=Animated.loop(Animated.sequence([
        Animated.timing(ringPulse,{toValue:1,duration:Math.round(430*animationFactor),useNativeDriver:true}),
        Animated.timing(ringPulse,{toValue:0,duration:Math.round(430*animationFactor),useNativeDriver:true}),
      ]),{iterations:3});
      hintGhostAnimation.current=Animated.loop(Animated.sequence([
        Animated.delay(130),
        Animated.timing(flightProgress,{toValue:1,duration:Math.round(1100*animationFactor),easing:Easing.inOut(Easing.cubic),useNativeDriver:true}),
        Animated.timing(flightProgress,{toValue:0,duration:1,useNativeDriver:true}),
      ]),{iterations:2});
      hintPulseAnimation.current.start();
      hintGhostAnimation.current.start(()=>{if(token===effectToken.current)setFlight(null);});
    });
    if(candidate.kind==='draw'){setMessage('Træk et kort fra bunken øverst til venstre');return;}
    if(candidate.kind==='recycle'){setMessage('Vend den tomme trækbunke');return;}
    if(candidate.kind==='foundation'){
      setChosen({kind:'foundation',from:candidate.from,at:0});
      setMessage(`Flyt fra grundbunke ${candidate.from+1} til kolonne ${candidate.to+1}`);
      return;
    }
    if(candidate.kind==='waste')setChosen({kind:'waste',from:0,at:0});
    else setChosen({kind:'tableau',from:candidate.from,at:candidate.at});
    setMessage(`Flyt til ${candidate.to==='foundation'?'grundbunke':'kolonne'} ${candidate.index+1}`);
  }
  function card(value:import('../src/domain/solitaire/klondike').Card,onPress:()=>void,source?:Source,run?:import('../src/domain/solitaire/klondike').Card[]) {
    return <View ref={view=>{cardViews.current[value.id]=view;}} style={{width:cardWidth,height:cardHeight}}><DraggableCard card={value} width={cardWidth} height={cardHeight} cardStyle={settings.cardStyle} back={settings.cardBack} onTap={onPress}
      onDoubleTap={settings.autoMove&&settings.doubleTap&&source&&value.up?()=>autoMove(source):undefined}
      floating={dragVisual?.id===value.id}
      onDragChange={source?active=>{
        setDraggingCard(active?value.id:null);
        const token=++dragToken.current;
        if(!active){setDragVisual(null);return;}
        dragDelta.current={x:0,y:0};dragXY.setValue({x:0,y:0});
        void Promise.all([measure(cardViews.current[value.id]),measure(effectSurface.current)]).then(([start,base])=>{
          if(token!==dragToken.current||!start||!base)return;
          dragXY.setValue(dragDelta.current);
          setDragVisual({id:value.id,card:value,run:run??[value],x:start.x-base.x,y:start.y-base.y});
        });
      }:undefined}
      onDragMove={source?(dx,dy)=>{dragDelta.current={x:dx,y:dy};dragXY.setValue({x:dx,y:dy});}:undefined}
      run={run}
      onDrop={source&&value.up?(x,y)=>dropCard(source,x,y):undefined}/></View>;
  }
  useEffect(()=>{
    if(!settings.autoHints||screen!=='cards'||autoRunning||draggingCard||isWon(game))return;
    const timer=setTimeout(()=>showHint(),9000);
    return ()=>clearTimeout(timer);
  },[game,screen,settings.autoHints,autoRunning,draggingCard]);
  return <ImageBackground source={screen==='cards'?solitaireTable:gardenIllustrations[screen==='garden'?gardenScene:actualSeason]} resizeMode="cover" style={[styles.root,landscape&&styles.landscapeRoot]}>
    <StatusBar style="dark"/>
    {screen === 'garden' ? <View style={styles.garden} onLayout={event=>{
      const nextHeight=event.nativeEvent.layout.height;
      setMeasuredGardenHeight(current=>Math.abs(current-nextHeight)>1?nextHeight:current);
    }}>
      <View style={{flex:1,overflow:'hidden'}} {...pan.panHandlers}>
        <Pressable onPress={event=>placeInGarden(event.nativeEvent.locationX,event.nativeEvent.locationY)}
          style={{width:gardenWidth,height:gardenHeight,transform:[{translateX:offset.x},{translateY:offset.y},{scale:zoom}]}}>
          <Image source={gardenIllustrations[gardenScene]} resizeMode="cover" style={{width:gardenWidth,height:gardenHeight}}/>
          {placed.filter(item=>(item.chapter??0)===gardenChapter).map(item=>{const art=decorations[item.kind].image;return <View key={item.id}
            style={{position:'absolute',left:gardenWidth*item.x-42,top:gardenHeight*item.y-42}}>
            <DraggableDecoration image={art} name={decorations[item.kind].name} zoom={zoom}
              selected={movingDecoration===item.id}
              onTap={()=>{setGardenTool(null);setMovingDecoration(item.id);setMessage('Træk dekorationen med fingeren, eller tryk et nyt sted i haven');}}
              onDrop={(dx,dy)=>dragGardenDecoration(item.id,dx,dy)}/>
          </View>;})}
        </Pressable>
      </View>
      <View style={[styles.hud,landscape&&styles.landscapeHud]}>
        <View style={styles.hudText}><Text style={styles.title}>{gardenChapters[gardenChapter].title}</Text><Text>Lysglimt ✨ {balance(ledger)}</Text><Text style={styles.tabText}>Dekorationer: {placed.length} · 5 ✨</Text></View>
      </View>
      <View style={styles.chapterPicker}>{gardenChapters.map(chapter=>{const unlocked=unlockedChapter(ledger,chapter.id);return <Pressable key={chapter.id} disabled={!unlocked} style={[styles.chapterChip,gardenChapter===chapter.id&&styles.chapterChipActive,!unlocked&&styles.chapterChipLocked]} onPress={()=>{setGardenChapter(chapter.id);setGardenTool(null);setMovingDecoration(null);setZoom(1);setOffset({x:0,y:0});}}><Text style={styles.chapterChipText}>{unlocked?chapter.title:`🔒 ${chapter.requiredWins} sejre`}</Text></Pressable>;})}</View>
      <View style={[styles.miniLauncher,landscape&&styles.landscapeMiniLauncher]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Vis minispil" onPress={()=>setMiniMenuOpen(open=>!open)} style={styles.miniLauncherButton}>
          <Image source={tabs[2].icon} style={{width:38,height:38}} resizeMode="contain"/><Text style={styles.miniLauncherText}>Minispil {miniMenuOpen?'⌃':'⌄'}</Text>
        </Pressable>
        {miniMenuOpen&&<View style={styles.miniLauncherList}>{[
          {kind:'memory',title:'🌸 Skovens vendespil'},
          {kind:'glow',title:'✨ Lysglimtjagt'},
          {kind:'season',title:'🍂 Årstidsquiz'},
        ].map(item=><Pressable key={item.kind} style={styles.miniLauncherItem} onPress={()=>{setMiniKind(item.kind as typeof miniKind);setScreen('mini');setMiniMenuOpen(false);}}>
          <Text style={styles.miniLauncherText}>{item.title}</Text>
        </Pressable>)}</View>}
      </View>
      <View style={[styles.gardenTools,landscape&&styles.landscapeGardenTools]}>
        {placed.length>0&&<View style={styles.placedPicker}>
          <Text style={styles.placedPickerLabel}>Flyt en placeret dekoration:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{maxWidth:gardenWidth-40}}
            contentContainerStyle={{gap:6,paddingHorizontal:3,paddingVertical:3}}>
            {placed.filter(item=>(item.chapter??0)===gardenChapter).map((item,index)=><Pressable key={item.id} accessibilityRole="button"
              accessibilityLabel={`Vælg ${decorations[item.kind].name} nummer ${index+1} til flytning`}
              onPress={()=>{setMovingDecoration(item.id);setGardenTool(null);setMessage('Tryk på et nyt sted i haven');}}
              style={[styles.placedChip,movingDecoration===item.id&&styles.placedChipActive]}>
              <Text style={styles.placedChipText}>{decorations[item.kind].name} {index+1}</Text>
            </Pressable>)}
          </ScrollView>
        </View>}
        {(gardenTool!==null||movingDecoration!==null)&&<Text style={styles.info}>Tryk på stedet i haven {movingDecoration?'for at flytte':'for at placere'} · <Text onPress={()=>{setGardenTool(null);setMovingDecoration(null);}}>Annullér</Text></Text>}
        {movingDecoration&&<CozyButton wide label="Fjern dekoration" onPress={()=>{setPlaced(p=>p.filter(d=>d.id!==movingDecoration));setMovingDecoration(null);}}/>}
        <View style={styles.actions}>
          <CozyButton label="− Zoom" compact secondary onPress={()=>setZoom(v=>Math.max(1,v-0.25))}/>
          <CozyButton label="Nulstil" compact secondary onPress={()=>{setZoom(1);setOffset({x:0,y:0});}}/>
          <CozyButton label="+ Zoom" compact secondary onPress={()=>setZoom(v=>Math.min(2.5,v+0.25))}/>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actions}>{decorations.map((d,i)=><Pressable key={d.name}
          disabled={i>=3&&!specialDecorationUnlocked(ledger,i as 3|4)} style={[styles.decorButton,gardenTool===i&&styles.selected,i>=3&&!specialDecorationUnlocked(ledger,i as 3|4)&&styles.lockedDecoration]} onPress={()=>{setGardenTool(i as 0|1|2|3|4);setMovingDecoration(null);}}
          accessibilityLabel={`Vælg ${d.name}`}><Image source={d.image} resizeMode="contain" style={{width:52,height:52}}/><Text style={styles.tabText}>{i>=3&&!specialDecorationUnlocked(ledger,i as 3|4)?'🔒 ':''}{d.name}</Text></Pressable>)}</ScrollView>
      </View>
    </View> : screen === 'cards' ? <View style={{flex:1}}><ImageBackground source={solitaireTable} resizeMode="cover" style={StyleSheet.absoluteFill}/><ScrollView key={landscape?'cards-landscape':'cards-portrait'} style={styles.board} contentContainerStyle={[styles.boardContent,landscape&&styles.landscapeBoardContent]}>
      <Text style={[styles.boardTitle,landscape&&styles.landscapeBoardTitle]}>{solitaireModes[activeModeIndex(game.drawCount,game.maxPasses)].title}</Text><Text style={styles.boardMeta}>Flytninger: {game.moves} · Lysglimt ✨ {balance(ledger)}</Text>
      <View style={styles.topPiles}>
        <View style={styles.drawZone} accessibilityLabel="Trækbunke og vendte kort">
          <View style={styles.zoneLabels}><Text style={styles.zoneLabel}>TRÆK</Text><Text style={styles.zoneLabel}>VENDT</Text></View>
          <View style={styles.zoneCards}>
        <Pressable ref={view=>{stockView.current=view;}} onPress={draw} disabled={autoRunning} accessibilityLabel="Træk fra bunken" style={[styles.slot,{width:cardWidth,height:cardHeight}]}>
          {game.stock.length ? <CardBack width={cardWidth} height={cardHeight} cardStyle={settings.cardStyle} back={settings.cardBack}/> : <><View style={[styles.emptySlot,{width:cardWidth,height:cardHeight}]}/><Text style={styles.emptyMark}>↻</Text></>}</Pressable>
        <View ref={view=>{wasteView.current=view;}} style={{width:cardWidth,height:cardHeight}}>{game.waste.length ? card(game.waste.at(-1)!,()=>setChosen({kind:'waste',from:0,at:0}),{kind:'waste',from:0,at:0}) :
          <View style={[styles.slot,{width:cardWidth,height:cardHeight}]}><View style={[styles.emptySlot,{width:cardWidth,height:cardHeight}]}/></View>}</View>
          </View>
        </View>
        <View style={styles.foundationZone} accessibilityLabel="Pladser til esserne">
          <Text style={styles.zoneLabel}>ESSER · GRUNDBUNKER</Text>
          <View style={styles.zoneCards}>
            {game.foundations.map((pile,index)=><Pressable ref={view=>{foundationTargets.current[index]=view;}} key={index} onPress={()=>chosen?move('foundation',index):pile.length?setChosen({kind:'foundation',from:index,at:pile.length-1}):undefined}
              accessibilityLabel={`Grundbunke ${index+1}`} style={[styles.slot,{width:cardWidth,height:cardHeight}]}>
              {pile.length ? card(pile.at(-1)!,()=>chosen?move('foundation',index):setChosen({kind:'foundation',from:index,at:pile.length-1}),{kind:'foundation',from:index,at:pile.length-1}) : <><View style={[styles.emptySlot,{width:cardWidth,height:cardHeight}]}/><Text style={styles.emptyMark}>A</Text></>}</Pressable>)}
          </View>
        </View>
      </View>
      <View style={[styles.piles,{minHeight:tableauHeight,flexGrow:landscape?0:1},landscape&&styles.landscapePiles]}>{game.tableau.map((pile,index)=><Pressable ref={view=>{tableauTargets.current[index]=view;}} key={index} onPress={()=>move('tableau',index)}
        accessibilityLabel={`Kolonne ${index+1}`} style={{width:cardWidth,minHeight:tableauHeight,zIndex:draggingCard&&pile.some(c=>c.id===draggingCard)?100:0}}>
        {visibleTableauIndexes(pile.length).map((at,visibleIndex)=>{const value=pile[at];return <View key={value.id} style={{marginTop:visibleIndex?-cardHeight+27:0,zIndex:draggingCard===value.id?999:visibleIndex,elevation:draggingCard===value.id?15:0}}>
          {card(value,()=>chosen?move('tableau',index):value.up&&setChosen({kind:'tableau',from:index,at}),{kind:'tableau',from:index,at},pile.slice(at))}
          {pile.length>5&&visibleIndex===0&&<View pointerEvents="none" style={styles.columnCount}><Text style={styles.columnCountText}>{pile.length}</Text></View>}
        </View>;})}
        {!pile.length&&<View style={[styles.slot,{height:cardHeight}]}><View style={[styles.emptySlot,{width:cardWidth,height:cardHeight}]}/></View>}
      </Pressable>)}</View>
      {isWon(game)&&<View style={styles.victory}><Text style={styles.victoryText}>✨ Tillykke! ✨</Text><Text style={styles.victorySubtitle}>En vidunderlig kabale er fuldført</Text></View>}
    </ScrollView>
    <View style={[styles.solitaireDock,landscape&&styles.landscapeDock]}>
      <Text style={[styles.boardInfo,landscape&&styles.landscapeInfo]}>{message || (chosen ? 'Vælg en bunke' : 'Træk kort · Dobbelttryk for automatisk flytning')}</Text>
      <View style={[styles.actions,landscape&&styles.landscapeActions]}>
        <CozyButton label="Fortryd" secondary disabled={autoRunning} onPress={()=>{stopVisualCue();setGame(undo(game));setChosen(null);}}/>
        <CozyButton label="Tip" secondary disabled={autoRunning} onPress={showHint}/>
        <CozyButton label="Auto-tøm" disabled={!settings.autoMove||!canAutoFinish(game)||autoRunning} onPress={()=>{void playFinish();}}/>
        <CozyButton label="Nyt spil" disabled={autoRunning} onPress={()=>startSolitaire(activeModeIndex(game.drawCount,game.maxPasses),true)}/>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modePicker}>
        {solitaireModes.map((mode,index)=>{const unlocked=modeUnlocked(ledger,index);const selected=index===activeModeIndex(game.drawCount,game.maxPasses);return <Pressable key={mode.id} accessibilityRole="button" accessibilityState={{disabled:!unlocked,selected}} disabled={!unlocked||autoRunning} style={[styles.modeButton,selected&&styles.modeButtonActive,!unlocked&&styles.modeButtonLocked]} onPress={()=>startSolitaire(index)}>
          <Text style={styles.modeText}>{unlocked?mode.title:`🔒 ${mode.title}`}</Text>
          <Text style={styles.modeSmall}>{unlocked?mode.description:`${winsForMode(ledger,solitaireModes[index-1].id)}/5 sejre`}</Text>
        </Pressable>;})}
      </ScrollView>
    </View>{autoRunning&&<View pointerEvents="auto" style={StyleSheet.absoluteFill}/>}</View> : screen==='mini' ? <ImageBackground source={gardenIllustrations[actualSeason]} resizeMode="cover" style={{flex:1}}>
      <ScrollView style={styles.board} contentContainerStyle={{padding:landscape?8:14,paddingTop:landscape?8:35,alignItems:'center'}}>
        <View style={[styles.illustratedPanel,landscape&&{maxWidth:540,width:'100%'}]}>
          <View style={styles.miniTabs}>{[{id:'memory',label:'Vendespil'},{id:'glow',label:'Lysglimtjagt'},{id:'season',label:'Årstidsquiz'}].map(item=><Pressable key={item.id} onPress={()=>setMiniKind(item.id as typeof miniKind)} style={[styles.miniTab,miniKind===item.id&&styles.miniTabActive]}><Text style={styles.modeText}>{item.label}</Text></Pressable>)}</View>
          {miniKind==='memory'?<MemoryBoard game={memory} onFlip={flipMemory} landscape={landscape} onNew={()=>setMemory(newMemoryGame(Math.max(Date.now(),memory.round+1)))}/>:
          miniKind==='glow'?<View style={styles.miniGameContent}><Text style={styles.title}>✨ Lysglimtjagt</Text><Text style={styles.panelCaption}>Find alle fem skjulte Lysglimt</Text><View style={styles.glowGrid}>{Array.from({length:12},(_,index)=><Pressable key={index} accessibilityRole="button" onPress={()=>collectGlow(index)} style={styles.glowTile}><Text style={styles.glowSymbol}>{glowFound.includes(index)?'✨':glowTried.includes(index)?'🍃':'🌿'}</Text></Pressable>)}</View><Text style={styles.panelCaption}>{glowFound.length}/5 fundet {glowFound.length>=5?'· +5 Lysglimt!':''}</Text><CozyButton wide label="Ny jagt" onPress={()=>{setGlowRound(Math.max(Date.now(),glowRound+1));setGlowFound([]);setGlowTried([]);}}/></View>:
          <View style={styles.miniGameContent}><Text style={styles.title}>🍂 Årstidsquiz</Text><Text style={styles.panelCaption}>{['Hvornår blomstrer tulipaner?','Hvornår er det varmest?','Hvornår falder bladene?','Hvornår kommer sneen?'][seasonRound%4]}</Text>{['Forår 🌷','Sommer ☀️','Efterår 🍁','Vinter ❄️'].map((option,index)=><CozyButton key={option} wide secondary={seasonAnswer!==index} disabled={seasonAnswer!==null} label={option} onPress={()=>answerSeason(index)}/>)}{seasonAnswer!==null&&<Text style={styles.panelCaption}>{seasonAnswer===seasonRound%4?'Rigtigt! +5 Lysglimt ✨':'Prøv næste spørgsmål 🌿'}</Text>}<CozyButton wide label="Næste spørgsmål" onPress={()=>{setSeasonRound(Math.max(seasonRound+1,Math.floor(Date.now()/1000)));setSeasonAnswer(null);}}/></View>}
        </View>
      </ScrollView></ImageBackground> :
      screen==='settings'?<ImageBackground source={gardenIllustrations[actualSeason]} resizeMode="cover" style={{flex:1}}><ScrollView style={styles.board} contentContainerStyle={styles.questList}>
        <View style={[styles.illustratedPanel,styles.settingsPanel]}>
        <Image source={cozyAppLogo} accessibilityLabel="Cozy Solitaire logo" style={styles.brandIcon}/>
        <Text style={styles.brandTitle}>Cozy Solitaire</Text>
        <Text style={styles.title}>Indstillinger</Text><Text style={styles.panelCaption}>Vælg havens årstid 🌷</Text>
        {(['auto','spring','summer','autumn','winter'] as Season[]).map(value=><CozyButton
          key={value} wide secondary={value!==season} label={`${value===season?'✓ ':''}${{auto:'Automatisk',spring:'Forår',summer:'Sommer',autumn:'Efterår',winter:'Vinter'}[value]}`}
          onPress={()=>setSettings(current=>({...current,season:value}))}/>)}
        <Text style={styles.title}>Kabaleindstillinger 🃏</Text>
        <Text style={styles.panelCaption}>Kortenes udseende (ændres med det samme)</Text>
        <View style={styles.settingRow}>
          <CozyButton label="Illustreret" compact secondary={settings.cardStyle!=='illustrated'} onPress={()=>setSettings(current=>({...current,cardStyle:'illustrated'}))}/>
          <CozyButton label="Klassisk" compact secondary={settings.cardStyle!=='classic'} onPress={()=>setSettings(current=>({...current,cardStyle:'classic'}))}/>
        </View>
        <Text style={styles.panelCaption}>Dobbelttryk for automatisk flytning</Text>
        <CozyButton wide label={settings.doubleTap?'✓ Aktiveret':'Deaktiveret'} secondary={!settings.doubleTap} onPress={()=>setSettings(current=>({...current,doubleTap:!current.doubleTap}))}/>
        <Text style={styles.panelCaption}>Træk ét eller tre kort i næste nye klassiske spil</Text>
        <View style={styles.settingRow}>
          <CozyButton label="Ét kort" compact secondary={settings.drawPreference!==1} onPress={()=>setSettings(current=>({...current,drawPreference:1}))}/>
          <CozyButton label={modeUnlocked(ledger,1)?'Tre kort':'🔒 3 kort'} compact secondary={settings.drawPreference!==3} disabled={!modeUnlocked(ledger,1)} onPress={()=>setSettings(current=>({...current,drawPreference:3}))}/>
        </View>
        <Text style={styles.panelCaption}>Tre kort låses op efter fem klassiske sejre. Indstillingerne ændrer ikke kortene i en igangværende kabale.</Text>
        <Text style={styles.panelCaption}>Kortstørrelse</Text>
        <View style={styles.settingRow}>{([{id:'small',label:'Lille'},{id:'normal',label:'Normal'},{id:'large',label:'Stor'}] as const).map(option=><CozyButton key={option.id} compact label={option.label} secondary={settings.cardSize!==option.id} onPress={()=>setSettings(current=>({...current,cardSize:option.id}))}/>)}</View>
        <Text style={styles.panelCaption}>Kortbagside</Text>
        <View style={styles.settingRow}>{([{id:'floral',label:'Blomster'},{id:'autumn',label:'Efterår'},{id:'winter',label:'Vinter'}] as const).map(option=><Pressable key={option.id} onPress={()=>setSettings(current=>({...current,cardBack:option.id}))} style={[styles.backChoice,settings.cardBack===option.id&&styles.backChoiceActive]}><CardBack width={46} height={66} back={option.id}/><Text style={styles.modeText}>{option.label}</Text></Pressable>)}</View>
        <Text style={styles.panelCaption}>Trækhjælp (diskret pulsering og flyvende kort)</Text>
        <CozyButton wide label={settings.autoHints?'✓ Aktiveret':'Deaktiveret'} secondary={!settings.autoHints} onPress={()=>setSettings(current=>({...current,autoHints:!current.autoHints}))}/>
        <Text style={styles.panelCaption}>Animationshastighed</Text>
        <View style={styles.settingRow}>{([{id:'calm',label:'Rolig'},{id:'normal',label:'Normal'},{id:'fast',label:'Hurtig'}] as const).map(option=><CozyButton key={option.id} compact label={option.label} secondary={settings.animationSpeed!==option.id} onPress={()=>setSettings(current=>({...current,animationSpeed:option.id}))}/>)}</View>
        <Text style={styles.panelCaption}>Automatisk flytning og automatisk tømning</Text>
        <CozyButton wide label={settings.autoMove?'✓ Tilladt':'Slået fra'} secondary={!settings.autoMove} onPress={()=>setSettings(current=>({...current,autoMove:!current.autoMove}))}/>
        <Text style={styles.info}>Gratis hygge – ingen reklamer og ingen køb.</Text>
        <CozyButton label="Søg efter opdatering" wide secondary onPress={()=>{void checkForCozyUpdate(true);}}/>
        </View>
      </ScrollView></ImageBackground>:<ImageBackground source={gardenIllustrations[actualSeason]} resizeMode="cover" style={{flex:1}}><ScrollView style={styles.board} contentContainerStyle={styles.questList}>
        <View style={styles.sectionHeader}><Text style={styles.title}>📜 Hyggelige opgaver ✨</Text><Text style={styles.panelCaption}>Løs opgaver i dit eget tempo, og optjen Lysglimt</Text></View>
        <View style={styles.questTabs}>{([{id:'daily',label:'I dag 🌷'},{id:'weekly',label:'Denne uge 🍃'},{id:'milestone',label:'Milepæle 🏆'}] as const).map(tab=><Pressable key={tab.id} onPress={()=>setQuestCategory(tab.id)} style={[styles.questTab,questCategory===tab.id&&styles.questTabActive]}><Text style={styles.modeText}>{tab.label}</Text></Pressable>)}</View>
        {quests(ledger,placed.length,questEvents).filter(q=>q.category===questCategory).map(q=><View key={q.id} style={styles.quest}>
          <View style={styles.questInner}><Text style={styles.questTitle}>{q.title}</Text><Text style={styles.info}>{q.description}</Text>
            <View style={styles.questProgress}><View style={[styles.questProgressFill,{width:`${Math.min(100,q.progress/q.target*100)}%`}]}/></View>
            <Text style={styles.questStatus}>{q.claimed?'✓ Indløst':q.complete?'✨ Klar til belønning':`${Math.min(q.progress,q.target)}/${q.target}`} · +{q.reward} ✨</Text>
            {q.complete&&!q.claimed&&<CozyButton label="Hent belønning" wide onPress={()=>claimQuest(q.id,q.reward)}/>}</View>
        </View>)}
      </ScrollView></ImageBackground>}
    {dailyCelebration&&<View pointerEvents="none" style={styles.bonusOverlay}>
      <Animated.View style={{transform:[{scale:celebrationScale}],alignItems:'center'}}><Text style={styles.bonusStar}>⭐ ✨ ⭐</Text><Text style={styles.bonusCaption}>Dagens opgaver fuldført!</Text><Text style={styles.bonusCaption}>+20 Lysglimt ✨</Text></Animated.View>
    </View>}
    <View ref={view=>{effectSurface.current=view;}} pointerEvents="none" style={StyleSheet.absoluteFill}>
      {flight&&<>
        {flight.mode==='hint'&&<Animated.View style={[styles.hintRing,{left:flight.from.x-4,top:flight.from.y-4,width:cardWidth+8,height:cardHeight+8,
          opacity:ringPulse.interpolate({inputRange:[0,1],outputRange:[0.45,1]}),
          transform:[{scale:ringPulse.interpolate({inputRange:[0,1],outputRange:[1,1.07]})}]}]}/>}
        <Animated.View style={{position:'absolute',left:flight.from.x,top:flight.from.y,width:cardWidth,height:cardHeight,
          opacity:flightProgress.interpolate({inputRange:[0,0.12,0.8,1],outputRange:[0,flight.mode==='hint'?0.65:0.97,flight.mode==='hint'?0.57:0.97,0]}),
          transform:[{translateX:flightProgress.interpolate({inputRange:[0,1],outputRange:[0,flight.dx]})},
            {translateY:flightProgress.interpolate({inputRange:[0,1],outputRange:[0,flight.dy]})},
            {scale:flightProgress.interpolate({inputRange:[0,0.5,1],outputRange:[1,1.11,0.95]})}]}}>
          {flight.faceUp?<CardFace card={flight.card} width={cardWidth} height={cardHeight} cardStyle={settings.cardStyle}/>:<CardBack width={cardWidth} height={cardHeight} cardStyle={settings.cardStyle} back={settings.cardBack}/>}
        </Animated.View>
      </>}
      {dragVisual&&<Animated.View style={{position:'absolute',left:dragVisual.x,top:dragVisual.y,
        width:cardWidth,height:cardHeight,zIndex:10000,elevation:100,
        transform:dragXY.getTranslateTransform()}}>
        <CardFace card={dragVisual.card} width={cardWidth} height={cardHeight} cardStyle={settings.cardStyle}/>
        {dragVisual.run.slice(1).map((next,index)=><View key={next.id} style={{position:'absolute',top:(index+1)*27,left:0}}>
          <CardFace card={next} width={cardWidth} height={cardHeight} cardStyle={settings.cardStyle}/>
        </View>)}
      </Animated.View>}
    </View>
    {message&&screen!=='cards'&&<Pressable accessibilityRole="button" accessibilityLabel="Luk besked" onPress={()=>setMessage('')} style={styles.notice}>
      <Text style={styles.info}>{message} · Luk ×</Text>
    </Pressable>}
    <View style={[styles.nav,landscape&&styles.landscapeNav]}>{tabs.map(tab=><Pressable key={tab.id} accessibilityRole="tab" disabled={autoRunning}
      accessibilityState={{selected:screen===tab.id,disabled:autoRunning}} onPress={()=>{stopVisualCue();setScreen(tab.id);setChosen(null);setMessage('');}}
      style={[styles.tab,landscape&&styles.landscapeTab]}><View style={screen===tab.id?styles.activeIcon:styles.inactiveIcon}><Image source={tab.icon} resizeMode="contain" style={styles.tabIcon}/></View>
      <Text style={[styles.tabText,screen===tab.id&&styles.activeLabel]}>{tab.label}</Text></Pressable>)}</View>
  </ImageBackground>;
}

const styles=StyleSheet.create({
  landscapeRoot:{flexDirection:'row'},
  landscapeHud:{right:undefined,width:258,height:86},
  landscapeGardenTools:{maxWidth:'90%',padding:5,gap:3},
  landscapeDock:{width:'100%',paddingHorizontal:8,paddingVertical:3,justifyContent:'center'},
  landscapeInfo:{fontSize:11,marginVertical:2},
  landscapeActions:{flexDirection:'row',flexWrap:'nowrap',gap:5,alignItems:'center'},
  landscapePiles:{marginTop:7},
  landscapeBoardContent:{paddingTop:2,paddingBottom:4},
  landscapeBoardTitle:{fontSize:19},
  landscapeNav:{width:92,height:'100%',flexDirection:'column',paddingBottom:0,paddingHorizontal:3,borderTopWidth:0,borderLeftWidth:4,borderLeftColor:'#d5a14c'},
  landscapeTab:{width:'100%',flex:1,paddingTop:0,gap:0},
  landscapeMiniLauncher:{top:12,right:110},
  chapterPicker:{position:'absolute',top:116,left:10,gap:4,zIndex:12,maxWidth:168},
  chapterChip:{backgroundColor:'#fff0d6ec',borderColor:'#dbb975',borderWidth:2,borderRadius:10,paddingHorizontal:9,paddingVertical:5},
  chapterChipActive:{backgroundColor:'#cde9bd',borderColor:'#71a479'},
  chapterChipLocked:{opacity:0.72},
  chapterChipText:{color:'#315a5b',fontSize:11,fontWeight:'900'},
  lockedDecoration:{opacity:0.45},
  miniLauncher:{position:'absolute',top:118,right:16,zIndex:20,alignItems:'flex-end'},
  miniLauncherButton:{flexDirection:'row',alignItems:'center',gap:5,backgroundColor:'#fff1cff5',borderColor:'#ddad57',borderWidth:3,borderRadius:18,padding:5,elevation:9},
  miniLauncherText:{color:'#285563',fontSize:13,fontWeight:'900'},
  miniLauncherList:{marginTop:5,backgroundColor:'#fff1cff9',borderColor:'#ddad57',borderWidth:3,borderRadius:16,padding:5,gap:4,elevation:10},
  miniLauncherItem:{paddingVertical:8,paddingHorizontal:12,backgroundColor:'#ffebbe',borderRadius:12},
  miniTabs:{flexDirection:'row',gap:5,justifyContent:'center',flexWrap:'wrap',padding:6},
  miniTab:{backgroundColor:'#ffe8b6',borderColor:'#d7ab60',borderWidth:2,padding:7,borderRadius:14},
  miniTabActive:{backgroundColor:'#bde6ce',borderColor:'#4d997f'},
  miniGameContent:{alignItems:'center',gap:12,padding:12},
  glowGrid:{flexDirection:'row',flexWrap:'wrap',width:252,justifyContent:'center',gap:6},
  glowTile:{width:56,height:56,borderRadius:13,borderWidth:2,borderColor:'#d8ac63',backgroundColor:'#f9e5b8',alignItems:'center',justifyContent:'center'},
  glowSymbol:{fontSize:30},
  modePicker:{gap:6,paddingVertical:4,paddingHorizontal:5},
  modeButton:{borderColor:'#d7ae68',borderWidth:1.5,borderRadius:10,backgroundColor:'#fff0cb',paddingHorizontal:8,paddingVertical:3,minWidth:113},
  modeButtonActive:{borderColor:'#74bba3',backgroundColor:'#c5eacb'},
  modeButtonLocked:{opacity:0.58},
  modeText:{fontWeight:'900',fontSize:11,color:'#31525b',textAlign:'center'},
  modeSmall:{fontWeight:'700',fontSize:9,color:'#6c5b42',textAlign:'center'},
  settingRow:{flexDirection:'row',gap:8,justifyContent:'center'},
  backChoice:{alignItems:'center',padding:5,borderRadius:12,borderWidth:2,borderColor:'#ddbf83',backgroundColor:'#fff2d3'},
  backChoiceActive:{borderColor:'#4c9c7e',backgroundColor:'#caeaca'},
  classicBack:{backgroundColor:'#31688b',borderRadius:7,borderWidth:4,borderColor:'#fffaf0'},
  brandIcon:{width:88,height:88,borderRadius:22,borderWidth:3,borderColor:'#f7d987'},
  brandTitle:{fontSize:20,fontWeight:'900',color:'#285563'},
  hintRing:{position:'absolute',borderRadius:13,borderWidth:4,borderColor:'#ffde66',backgroundColor:'#fff3a028',shadowColor:'#fff7b1',shadowOpacity:0.95,shadowRadius:14,elevation:12},
  victory:{alignItems:'center',backgroundColor:'#fff3dff0',borderWidth:4,borderColor:'#eabf5f',borderRadius:24,padding:16,margin:15,shadowColor:'#ffd36c',shadowOpacity:0.7,shadowRadius:18},
  victoryText:{fontSize:28,fontWeight:'900',color:'#8c6220'},victorySubtitle:{fontSize:15,fontWeight:'700',color:'#35695c'},
  root:{flex:1,paddingTop:28,backgroundColor:'#f5ecd8'},garden:{flex:1,overflow:'hidden'},
  hud:{position:'absolute',top:14,left:16,right:16,height:92,backgroundColor:'#fff1cfef',borderRadius:23,borderWidth:4,borderColor:'#e5af55',shadowColor:'#4a2b17',shadowOpacity:0.3,shadowRadius:8,elevation:7},hudText:{position:'absolute',top:11,left:18,right:18},
  title:{fontSize:23,fontWeight:'900',color:'#1c5663',textShadowColor:'#fffaf0',textShadowRadius:2},gardenTools:{position:'absolute',bottom:8,alignSelf:'center',backgroundColor:'#fff4d9f5',padding:7,borderRadius:20,borderWidth:3,borderColor:'#e8b95f',gap:6,shadowColor:'#382b18',shadowRadius:8,shadowOpacity:0.28,elevation:6},decorButton:{minWidth:82,alignItems:'center',padding:4,backgroundColor:'#ffe6b0',borderRadius:13,borderWidth:2,borderColor:'#d9af64'},
  placedPicker:{alignItems:'center',gap:2},placedPickerLabel:{fontSize:12,fontWeight:'800',color:'#285563'},placedChip:{minHeight:34,paddingHorizontal:10,justifyContent:'center',borderRadius:12,backgroundColor:'#fff6dd',borderWidth:2,borderColor:'#cfa15e'},placedChipActive:{backgroundColor:'#bfe9ad',borderColor:'#38885d'},placedChipText:{fontSize:12,fontWeight:'800',color:'#35524d'},
  boardTitle:{fontSize:23,fontWeight:'800',textAlign:'center',color:'#fbeccf',textShadowColor:'#172a18',textShadowRadius:5,textShadowOffset:{width:0,height:2}},
  boardMeta:{color:'#fff1d5',textAlign:'center',fontWeight:'700',marginTop:5},boardInfo:{marginVertical:15,textAlign:'center',color:'#f8e8c5',fontWeight:'700'},
  illustratedPanel:{backgroundColor:'#fff1cfef',borderRadius:24,borderWidth:4,borderColor:'#dfad55',shadowColor:'#49351f',shadowRadius:15,shadowOpacity:0.32,elevation:7,padding:5},settingsPanel:{alignItems:'center',width:'100%',maxWidth:380,padding:18,gap:10},sectionHeader:{alignItems:'center',width:'100%',maxWidth:420,padding:14,borderRadius:20,backgroundColor:'#fff1cfef',borderWidth:3,borderColor:'#dfad55'},panelCaption:{color:'#285563',fontSize:14,fontWeight:'800',textAlign:'center'},
  nav:{height:96,flexDirection:'row',backgroundColor:'#fff1d6',alignItems:'center',paddingHorizontal:6,paddingBottom:18,borderTopWidth:4,borderTopColor:'#d5a14c',shadowColor:'#49341f',shadowOpacity:0.22,shadowRadius:5,elevation:9},
  tab:{flex:1,justifyContent:'center',alignItems:'center',gap:1,paddingTop:3},selected:{backgroundColor:'#fce3a6'},
  activeIcon:{transform:[{scale:1.1}]},inactiveIcon:{opacity:0.86},tabIcon:{width:38,height:40},activeLabel:{color:'#123f71',fontWeight:'900'},
  tabText:{fontSize:11,color:'#604d30',fontWeight:'700'},
  board:{flex:1},boardContent:{paddingHorizontal:6,paddingTop:12,paddingBottom:30},piles:{flexDirection:'row',justifyContent:'space-between',marginTop:15},
  topPiles:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',marginTop:13,gap:5},
  solitaireDock:{paddingHorizontal:8,paddingTop:8,paddingBottom:12,alignItems:'center',backgroundColor:'#183b34e3',borderTopWidth:2,borderTopColor:'#e4c586'},
  drawZone:{backgroundColor:'#71532ca3',borderWidth:1.5,borderColor:'#f0ce89',borderRadius:13,padding:3,shadowColor:'#e7bb70',shadowOpacity:0.25,shadowRadius:4},
  foundationZone:{backgroundColor:'#20554eaf',borderWidth:1.5,borderColor:'#a6dbbf',borderRadius:13,padding:3,shadowColor:'#9dd6bb',shadowOpacity:0.25,shadowRadius:4,alignSelf:'center'},
  zoneLabels:{flexDirection:'row',gap:5,justifyContent:'space-around'},
  zoneCards:{flexDirection:'row',gap:5,justifyContent:'center'},
  zoneLabel:{fontSize:9,fontWeight:'900',color:'#fff3c9',textAlign:'center',letterSpacing:0.5,marginBottom:4,textShadowColor:'#132c25',textShadowRadius:4},
  columnCount:{position:'absolute',top:3,right:3,minWidth:24,height:24,paddingHorizontal:4,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:'#174f5b',borderWidth:2,borderColor:'#ffe3a3',elevation:4},
  columnCountText:{color:'#fff8db',fontSize:12,fontWeight:'900'},
  slot:{borderRadius:8,alignItems:'center',justifyContent:'center'},emptySlot:{borderRadius:9,backgroundColor:'#194b47a8',borderWidth:2,borderColor:'#d7b775',shadowColor:'#091b1e',shadowOpacity:0.2,shadowRadius:3},emptyMark:{position:'absolute',fontSize:20,color:'#fff5d4',fontWeight:'900'},
  rank:{position:'absolute',top:5,left:4,fontWeight:'800',fontSize:12},info:{marginVertical:15,textAlign:'center',color:'#65573d'},
  actions:{flexDirection:'row',gap:7,justifyContent:'center',flexWrap:'wrap'},button:{padding:12,minHeight:44,backgroundColor:'#e9d6aa',borderRadius:9},
  questList:{alignItems:'center',padding:18,gap:14},quest:{width:'100%',maxWidth:420,minHeight:154,alignItems:'center',backgroundColor:'#fff3d6f5',borderRadius:21,borderWidth:4,borderColor:'#e0ab52',shadowColor:'#49351f',shadowRadius:9,shadowOpacity:0.28,elevation:5},questInner:{width:'100%',alignItems:'center',padding:17},
  questTitle:{fontSize:20,fontWeight:'900',color:'#205667'},
  questTabs:{flexDirection:'row',gap:5,justifyContent:'center',flexWrap:'wrap'},
  questTab:{backgroundColor:'#fff1cfe8',borderWidth:2,borderColor:'#d8b36d',borderRadius:16,padding:10},
  questTabActive:{backgroundColor:'#c7edcf',borderColor:'#76b68c'},
  questProgress:{height:14,width:'100%',maxWidth:320,backgroundColor:'#dcc9a1',borderRadius:9,borderWidth:2,borderColor:'#b99559',overflow:'hidden'},
  questProgressFill:{height:'100%',backgroundColor:'#7bbd80',borderRadius:8},
  questStatus:{color:'#5e5639',fontWeight:'800',marginTop:9,textAlign:'center'},
  bonusOverlay:{position:'absolute',top:'28%',left:18,right:18,alignItems:'center',justifyContent:'center',backgroundColor:'#fff0c6f5',borderRadius:24,borderWidth:4,borderColor:'#f3c95b',padding:20,zIndex:200,elevation:30},
  bonusStar:{fontSize:35,textAlign:'center'},
  bonusCaption:{fontSize:20,fontWeight:'900',color:'#806025',textAlign:'center'},
  notice:{position:'absolute',left:12,right:12,bottom:79,minHeight:48,borderRadius:12,backgroundColor:'#fff7e5',borderWidth:1,borderColor:'#c8a16b',paddingHorizontal:10},
});
