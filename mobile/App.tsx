import React, {useEffect, useRef, useState} from 'react';
import {Image, ImageBackground, PanResponder, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {applyMove, autoFinish, canAutoFinish, hint, isWon, legalMoves, newGame, undo} from '../src/domain/solitaire/klondike';
import type {Move} from '../src/domain/solitaire/klondike';
import {balance, emptyLedger, record} from '../src/domain/rewards/ledger';
import type {Ledger} from '../src/domain/rewards/ledger';
import {loadGame, saveGame} from '../src/persistence/save';
import {nativeSaveStore} from './src/nativeSave';
import {readGarden,writeGarden} from './src/nativeGarden';
import type {DecorationPlacement} from '../src/domain/garden/layout';
import {clampGardenOffset} from '../src/domain/garden/viewport';
import {readSettings,writeSettings} from './src/nativeSettings';
import type {Season} from './src/nativeSettings';
import {DraggableCard} from './src/DraggableCard';
import {autoPlace} from '../src/domain/solitaire/autoPlace';
import {CozyButton} from './src/CozyButton';
import {MemoryBoard} from './src/MemoryBoard';
import {newMemoryGame,revealMemory,hideMismatch,memoryWon} from '../src/domain/minigames/memory';
import {readMemory,writeMemory} from './src/nativeMemory';
import {quests} from '../src/domain/quests/quests';
import {checkForCozyUpdate} from './src/checkUpdate';

type Screen = 'garden' | 'cards' | 'mini' | 'quests' | 'settings';
type Source = {kind:'waste' | 'tableau' | 'foundation'; from:number; at:number};
type MeasuredElement={measureInWindow:(callback:(x:number,y:number,width:number,height:number)=>void)=>void};
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
] as const;
const gardenIllustrations={
  spring:require('./assets/illustrations/garden-spring.webp'),
  summer:require('./assets/illustrations/garden-summer.webp'),
  autumn:require('./assets/illustrations/garden-autumn.webp'),
  winter:require('./assets/illustrations/garden-winter.webp'),
};
const solitaireTable=require('./assets/illustrations/solitaire-table.webp');
const premiumNav=require('./assets/illustrations/nav-premium.webp');
const premiumCardBack=require('./assets/illustrations/card-back-premium.webp');

export default function App() {
  useEffect(()=>{
    const timer=setTimeout(()=>{void checkForCozyUpdate();},6500);
    return ()=>clearTimeout(timer);
  },[]);
  const [screen,setScreen] = useState<Screen>('garden');
  const [game,setGame] = useState(() => newGame(20261113));
  const [ledger,setLedger] = useState<Ledger>(()=>emptyLedger());
  const [loaded,setLoaded] = useState(false);
  const [saveBlocked,setSaveBlocked] = useState(false);
  const [gardenLoaded,setGardenLoaded] = useState(false);
  const [gardenSaveBlocked,setGardenSaveBlocked] = useState(false);
  const [memory,setMemory] = useState(()=>newMemoryGame(20261113));
  const [memoryLoaded,setMemoryLoaded] = useState(false);
  const [memorySaveBlocked,setMemorySaveBlocked] = useState(false);
  const [season,setSeason] = useState<Season>('auto');
  const [settingsLoaded,setSettingsLoaded] = useState(false);
  const [settingsSaveBlocked,setSettingsSaveBlocked] = useState(false);
  const [chosen,setChosen] = useState<Source | null>(null);
  const [draggingCard,setDraggingCard] = useState<string|null>(null);
  const tableauTargets=useRef<Array<MeasuredElement|null>>([]);
  const foundationTargets=useRef<Array<MeasuredElement|null>>([]);
  const [message,setMessage] = useState('');
  const [zoom,setZoom] = useState(1);
  const [offset,setOffset] = useState({x:0,y:0});
  const [placed,setPlaced] = useState<DecorationPlacement[]>([]);
  const [gardenTool,setGardenTool] = useState<0|1|2|null>(null);
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
  // Seven columns should fill most of the phone without touching each other.
  const cardWidth = Math.min(64,(width-24)/7-1);
  const cardHeight = cardWidth*270/190;
  const gardenHeight=height-110;
  gardenViewportRef.current={width,height:gardenHeight,zoom};
  useEffect(()=>setOffset(current=>clampGardenOffset(current,zoom,width,gardenHeight)),[zoom,width,gardenHeight]);
  const month=new Date().getMonth();
  const actualSeason=season==='auto'?(month===11||month<2?'winter':month<5?'spring':month<8?'summer':'autumn'):season;

  function placeInGarden(x:number,y:number){
    // SVG art and touch surface share the same scaled coordinate system.
    const nx=Math.max(0.04,Math.min(0.94,x/width));
    const ny=Math.max(0.08,Math.min(0.91,y/gardenHeight));
    if(movingDecoration){
      setPlaced(items=>items.map(item=>item.id===movingDecoration?{...item,x:nx,y:ny}:item));
      setMovingDecoration(null);
    }else if(gardenTool!==null){
      if(placed.length>=64){setMessage('Haven er fuld');return;}
      const id=`decor-${Date.now()}-${placed.length}`;
      try{
        const next=record(ledger,{id:`garden-purchase-${id}`,type:'spend',amount:5,reason:'Havedekoration'});
        setLedger(next);
        setPlaced([...placed,{id,kind:gardenTool,x:nx,y:ny}]);
        setMessage('Dekoration placeret for 5 Lysglimt');
      }catch{setMessage('Du skal bruge 5 Lysglimt for at placere en dekoration');}
      setGardenTool(null);
    }
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
    readSettings().then(value=>{if(mounted)setSeason(value);})
      .catch(()=>{if(mounted){setSettingsSaveBlocked(true);setMessage('Indstillinger kunne ikke indlæses og overskrives ikke.');}})
      .finally(()=>{if(mounted)setSettingsLoaded(true);});
    return ()=>{mounted=false;};
  },[]);
  useEffect(()=>{
    if(settingsLoaded&&!settingsSaveBlocked)writeSettings(season).catch(()=>setMessage('Indstillinger kunne ikke gemmes.'));
  },[season,settingsLoaded,settingsSaveBlocked]);
  useEffect(()=>{
    if(!memoryLoaded||memory.revealed.length!==2||memory.tiles[memory.revealed[0]]===memory.tiles[memory.revealed[1]])return;
    const timer=setTimeout(()=>setMemory(current=>hideMismatch(current)),800);
    return ()=>clearTimeout(timer);
  },[memory,memoryLoaded]);
  useEffect(()=>{
    if(!loaded||!memoryLoaded||!memoryWon(memory))return;
    setLedger(previous=>record(previous,{id:`memory-win-${memory.round}`,type:'earn',amount:5,reason:'Skovens vendespil'}));
  },[memory,loaded,memoryLoaded]);

  function flipMemory(index:number){
    if(memory.revealed.length===2&&memory.tiles[memory.revealed[0]]!==memory.tiles[memory.revealed[1]])return;
    setMemory(current=>revealMemory(current,index));
  }
  function claimQuest(id:ReturnType<typeof quests>[number]['id'],reward:number){
    try{setLedger(previous=>record(previous,{id:`quest-${id}`,type:'earn',amount:reward,reason:'Opgave fuldført'}));}
    catch{setMessage('Belønningen kunne ikke indløses');}
  }

  useEffect(()=>{
    if(!loaded || !isWon(game))return;
    setLedger(previous=>record(previous,{id:`klondike-win-${game.seed}`,type:'earn',amount:25,reason:'Klondike gennemført'}));
  },[game,loaded]);

  function move(to:'tableau' | 'foundation',index:number) {
    if(chosen)executeMove(chosen,to,index);
  }
  function autoMove(source:Source){
    const action=autoPlace(game,source);
    if(action){setGame(current=>applyMove(current,action));setChosen(null);setMessage('');}
    else setMessage('Ingen lovlig plads til dette kort');
  }
  function executeMove(source:Source,to:'tableau'|'foundation',index:number){
    if(source.kind==='foundation'&&to==='foundation'){setChosen(null);return;}
    const action:Move = source.kind === 'waste' ? {kind:'waste',to,index} :
      source.kind === 'foundation' ? {kind:'foundation',from:source.from,to:index} :
        {kind:'tableau',from:source.from,at:source.at,to,index};
    if (legalMoves(game).some(m => JSON.stringify(m) === JSON.stringify(action))) {
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
    const kind = game.stock.length ? 'draw' : 'recycle';
    if (legalMoves(game).some(m => m.kind === kind)) setGame(applyMove(game,{kind}));
    else setMessage('Ingen flere kort at trække');
  }
  function showHint(){
    const candidate=hint(game).move;
    if(!candidate){setMessage('Ingen lovlige træk');return;}
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
    return <DraggableCard card={value} width={cardWidth} height={cardHeight} onTap={onPress}
      onDoubleTap={source&&value.up?()=>autoMove(source):undefined}
      onDragChange={source?active=>setDraggingCard(active?value.id:null):undefined}
      run={run}
      onDrop={source&&value.up?(x,y)=>dropCard(source,x,y):undefined}/>;
  }
  return <View style={styles.root}>
    <StatusBar style="dark"/>
    {screen === 'garden' ? <View style={styles.garden}>
      <View style={{flex:1,overflow:'hidden'}} {...pan.panHandlers}>
        <Pressable onPress={event=>placeInGarden(event.nativeEvent.locationX,event.nativeEvent.locationY)}
          style={{width,height:gardenHeight,transform:[{translateX:offset.x},{translateY:offset.y},{scale:zoom}]}}>
          <Image source={gardenIllustrations[actualSeason]} resizeMode="cover" style={{width,height:gardenHeight}}/>
          {placed.map(item=>{const art=decorations[item.kind].image;return <Pressable key={item.id}
            accessibilityLabel={`Flyt ${decorations[item.kind].name}`}
            onPress={()=>{setGardenTool(null);setMovingDecoration(item.id);}}
            style={{position:'absolute',left:width*item.x-42,top:gardenHeight*item.y-42,
              borderWidth:movingDecoration===item.id?2:0,borderColor:'#e0b75b',borderRadius:12}}>
            <Image source={art} resizeMode="contain" style={{width:84,height:84}}/></Pressable>;})}
        </Pressable>
      </View>
      <View style={styles.hud}>
        <View style={styles.hudText}><Text style={styles.title}>Min have</Text><Text>Lysglimt ✨ {balance(ledger)}</Text><Text style={styles.tabText}>Dekorationer: 5 ✨</Text></View>
      </View>
      <View style={styles.gardenTools}>
        {(gardenTool!==null||movingDecoration!==null)&&<Text style={styles.info}>Tryk på stedet i haven {movingDecoration?'for at flytte':'for at placere'} · <Text onPress={()=>{setGardenTool(null);setMovingDecoration(null);}}>Annullér</Text></Text>}
        {movingDecoration&&<CozyButton wide label="Fjern dekoration" onPress={()=>{setPlaced(p=>p.filter(d=>d.id!==movingDecoration));setMovingDecoration(null);}}/>}
        <View style={styles.actions}>
          <CozyButton label="− Zoom" compact secondary onPress={()=>setZoom(v=>Math.max(1,v-0.25))}/>
          <CozyButton label="Nulstil" compact secondary onPress={()=>{setZoom(1);setOffset({x:0,y:0});}}/>
          <CozyButton label="+ Zoom" compact secondary onPress={()=>setZoom(v=>Math.min(2.5,v+0.25))}/>
        </View>
        <View style={styles.actions}>{decorations.map((d,i)=><Pressable key={d.name}
          style={[styles.decorButton,gardenTool===i&&styles.selected]} onPress={()=>{setGardenTool(i as 0|1|2);setMovingDecoration(null);}}
          accessibilityLabel={`Vælg ${d.name}`}><Image source={d.image} resizeMode="contain" style={{width:52,height:52}}/><Text style={styles.tabText}>{d.name}</Text></Pressable>)}</View>
      </View>
    </View> : screen === 'cards' ? <View style={{flex:1}}><ImageBackground source={solitaireTable} resizeMode="cover" style={StyleSheet.absoluteFill}/><ScrollView style={styles.board} contentContainerStyle={styles.boardContent}>
      <Text style={styles.boardTitle}>Kabale · Klondike</Text><Text style={styles.boardMeta}>Flytninger: {game.moves} · Lysglimt ✨ {balance(ledger)}</Text>
      <View style={styles.piles}>
        <Pressable onPress={draw} accessibilityLabel="Træk fra bunken" style={[styles.slot,{width:cardWidth,height:cardHeight}]}>
          {game.stock.length ? <Image source={premiumCardBack} resizeMode="stretch" style={{width:cardWidth,height:cardHeight}}/> : <><View style={[styles.emptySlot,{width:cardWidth,height:cardHeight}]}/><Text style={styles.emptyMark}>↻</Text></>}</Pressable>
        {game.waste.length ? card(game.waste.at(-1)!,()=>setChosen({kind:'waste',from:0,at:0}),{kind:'waste',from:0,at:0}) :
          <View style={[styles.slot,{width:cardWidth,height:cardHeight}]}><View style={[styles.emptySlot,{width:cardWidth,height:cardHeight}]}/></View>}
        {game.foundations.map((pile,index)=><Pressable ref={view=>{foundationTargets.current[index]=view;}} key={index} onPress={()=>chosen?move('foundation',index):pile.length?setChosen({kind:'foundation',from:index,at:pile.length-1}):undefined}
          accessibilityLabel={`Grundbunke ${index+1}`} style={[styles.slot,{width:cardWidth,height:cardHeight}]}>
          {pile.length ? card(pile.at(-1)!,()=>chosen?move('foundation',index):setChosen({kind:'foundation',from:index,at:pile.length-1}),{kind:'foundation',from:index,at:pile.length-1}) : <><View style={[styles.emptySlot,{width:cardWidth,height:cardHeight}]}/><Text style={styles.emptyMark}>A</Text></>}</Pressable>)}
      </View>
      <View style={styles.piles}>{game.tableau.map((pile,index)=><Pressable ref={view=>{tableauTargets.current[index]=view;}} key={index} onPress={()=>move('tableau',index)}
        accessibilityLabel={`Kolonne ${index+1}`} style={{width:cardWidth,minHeight:cardHeight+150,zIndex:draggingCard&&pile.some(c=>c.id===draggingCard)?100:0}}>
        {pile.map((value,at)=><View key={value.id} style={{marginTop:at?-cardHeight+27:0,zIndex:draggingCard===value.id?999:at,elevation:draggingCard===value.id?15:0}}>
          {card(value,()=>chosen?move('tableau',index):value.up&&setChosen({kind:'tableau',from:index,at}),{kind:'tableau',from:index,at},pile.slice(at))}</View>)}
        {!pile.length&&<View style={[styles.slot,{height:cardHeight}]}><View style={[styles.emptySlot,{width:cardWidth,height:cardHeight}]}/></View>}
      </Pressable>)}</View>
      <Text style={styles.boardInfo}>{message || (chosen ? 'Vælg en bunke' : 'Træk kort · Dobbelttryk for automatisk flytning')}</Text>
      <View style={styles.actions}>
        <CozyButton label="Fortryd" secondary onPress={()=>{setGame(undo(game));setChosen(null);}}/>
        <CozyButton label="Tip" secondary onPress={showHint}/>
        {canAutoFinish(game)&&<CozyButton label="Afslut" onPress={()=>setGame(autoFinish(game))}/>}
        <CozyButton label="Nyt spil" onPress={()=>{setGame(newGame(Date.now()));setChosen(null);}}/>
      </View>
      {isWon(game)&&<Text style={styles.boardTitle}>Tillykke! Du har vundet ✨</Text>}
    </ScrollView></View> : screen==='mini' ? <ImageBackground source={gardenIllustrations[actualSeason]} resizeMode="cover" style={{flex:1}}>
      <ScrollView style={styles.board} contentContainerStyle={{padding:14,paddingTop:35}}>
        <View style={styles.illustratedPanel}><MemoryBoard game={memory} onFlip={flipMemory}
          onNew={()=>setMemory(newMemoryGame(Math.max(Date.now(),memory.round+1)))}/></View>
      </ScrollView></ImageBackground> :
      screen==='settings'?<ImageBackground source={gardenIllustrations[actualSeason]} resizeMode="cover" style={{flex:1}}><ScrollView style={styles.board} contentContainerStyle={styles.questList}>
        <View style={[styles.illustratedPanel,styles.settingsPanel]}>
        <Text style={styles.title}>Indstillinger</Text><Text style={styles.panelCaption}>Vælg havens årstid 🌷</Text>
        {(['auto','spring','summer','autumn','winter'] as Season[]).map(value=><CozyButton
          key={value} wide secondary={value!==season} label={`${value===season?'✓ ':''}${{auto:'Automatisk',spring:'Forår',summer:'Sommer',autumn:'Efterår',winter:'Vinter'}[value]}`}
          onPress={()=>setSeason(value)}/>)}
        <Text style={styles.info}>Gratis hygge – ingen reklamer og ingen køb.</Text>
        <CozyButton label="Søg efter opdatering" wide secondary onPress={()=>{void checkForCozyUpdate(true);}}/>
        </View>
      </ScrollView></ImageBackground>:<ImageBackground source={gardenIllustrations[actualSeason]} resizeMode="cover" style={{flex:1}}><ScrollView style={styles.board} contentContainerStyle={styles.questList}>
        <View style={styles.sectionHeader}><Text style={styles.title}>Mine opgaver ✨</Text><Text style={styles.panelCaption}>Små mål med Lysglimt som belønning</Text></View>
        {quests(ledger,placed.length).map(q=><View key={q.id} style={styles.quest}>
          <View style={styles.questInner}><Text style={styles.questTitle}>{q.title}</Text><Text style={styles.info}>{q.description}</Text>
            <Text style={styles.info}>{q.claimed?'Fuldført og indløst':q.complete?'Klar til at indløse':'I gang'} · +{q.reward} ✨</Text>
            {q.complete&&!q.claimed&&<CozyButton label="Hent belønning" wide onPress={()=>claimQuest(q.id,q.reward)}/>}</View>
        </View>)}
      </ScrollView></ImageBackground>}
    {message&&screen!=='cards'&&<Pressable accessibilityRole="button" accessibilityLabel="Luk besked" onPress={()=>setMessage('')} style={styles.notice}>
      <Text style={styles.info}>{message} · Luk ×</Text>
    </Pressable>}
    <View style={styles.nav}><Image source={premiumNav} resizeMode="stretch" style={StyleSheet.absoluteFill}/>{tabs.map(tab=><Pressable key={tab.id} accessibilityRole="tab"
      accessibilityState={{selected:screen===tab.id}} onPress={()=>{setScreen(tab.id);setChosen(null);}}
      style={styles.tab}><View style={screen===tab.id?styles.activeIcon:styles.inactiveIcon}><Image source={tab.icon} resizeMode="contain" style={styles.tabIcon}/></View>
      <Text style={[styles.tabText,screen===tab.id&&styles.activeLabel]}>{tab.label}</Text></Pressable>)}</View>
  </View>;
}

const styles=StyleSheet.create({
  root:{flex:1,paddingTop:28,backgroundColor:'#f5ecd8'},garden:{flex:1,overflow:'hidden'},
  hud:{position:'absolute',top:14,left:16,right:16,height:92,backgroundColor:'#fff1cfef',borderRadius:23,borderWidth:4,borderColor:'#e5af55',shadowColor:'#4a2b17',shadowOpacity:0.3,shadowRadius:8,elevation:7},hudText:{position:'absolute',top:11,left:18,right:18},
  title:{fontSize:23,fontWeight:'900',color:'#1c5663',textShadowColor:'#fffaf0',textShadowRadius:2},gardenTools:{position:'absolute',bottom:8,alignSelf:'center',backgroundColor:'#fff4d9f5',padding:7,borderRadius:20,borderWidth:3,borderColor:'#e8b95f',gap:6,shadowColor:'#382b18',shadowRadius:8,shadowOpacity:0.28,elevation:6},decorButton:{minWidth:82,alignItems:'center',padding:4,backgroundColor:'#ffe6b0',borderRadius:13,borderWidth:2,borderColor:'#d9af64'},
  boardTitle:{fontSize:23,fontWeight:'800',textAlign:'center',color:'#fbeccf',textShadowColor:'#172a18',textShadowRadius:5,textShadowOffset:{width:0,height:2}},
  boardMeta:{color:'#fff1d5',textAlign:'center',fontWeight:'700',marginTop:5},boardInfo:{marginVertical:15,textAlign:'center',color:'#f8e8c5',fontWeight:'700'},
  illustratedPanel:{backgroundColor:'#fff1cfef',borderRadius:24,borderWidth:4,borderColor:'#dfad55',shadowColor:'#49351f',shadowRadius:15,shadowOpacity:0.32,elevation:7,padding:5},settingsPanel:{alignItems:'center',width:'100%',maxWidth:380,padding:18,gap:10},sectionHeader:{alignItems:'center',width:'100%',maxWidth:420,padding:14,borderRadius:20,backgroundColor:'#fff1cfef',borderWidth:3,borderColor:'#dfad55'},panelCaption:{color:'#285563',fontSize:14,fontWeight:'800',textAlign:'center'},
  nav:{height:88,flexDirection:'row',backgroundColor:'#fff4df',alignItems:'center',paddingHorizontal:6},
  tab:{flex:1,justifyContent:'center',alignItems:'center',gap:0,paddingTop:3},selected:{backgroundColor:'#fce3a6'},
  activeIcon:{transform:[{scale:1.12}]},inactiveIcon:{opacity:0.86},tabIcon:{width:46,height:49},activeLabel:{color:'#123f71',fontWeight:'900'},
  tabText:{fontSize:11,color:'#604d30',fontWeight:'700'},
  board:{flex:1},boardContent:{paddingHorizontal:6,paddingTop:12,paddingBottom:30},piles:{flexDirection:'row',justifyContent:'space-between',marginTop:15},
  slot:{borderRadius:8,alignItems:'center',justifyContent:'center'},emptySlot:{borderRadius:9,backgroundColor:'#194b47a8',borderWidth:2,borderColor:'#d7b775',shadowColor:'#091b1e',shadowOpacity:0.2,shadowRadius:3},emptyMark:{position:'absolute',fontSize:20,color:'#fff5d4',fontWeight:'900'},
  rank:{position:'absolute',top:5,left:4,fontWeight:'800',fontSize:12},info:{marginVertical:15,textAlign:'center',color:'#65573d'},
  actions:{flexDirection:'row',gap:7,justifyContent:'center',flexWrap:'wrap'},button:{padding:12,minHeight:44,backgroundColor:'#e9d6aa',borderRadius:9},
  questList:{alignItems:'center',padding:18,gap:14},quest:{width:'100%',maxWidth:420,minHeight:154,alignItems:'center',backgroundColor:'#fff3d6f5',borderRadius:21,borderWidth:4,borderColor:'#e0ab52',shadowColor:'#49351f',shadowRadius:9,shadowOpacity:0.28,elevation:5},questInner:{width:'100%',alignItems:'center',padding:17},
  questTitle:{fontSize:20,fontWeight:'900',color:'#205667'},
  notice:{position:'absolute',left:12,right:12,bottom:79,minHeight:48,borderRadius:12,backgroundColor:'#fff7e5',borderWidth:1,borderColor:'#c8a16b',paddingHorizontal:10},
});
