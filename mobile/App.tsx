import React, {useEffect, useRef, useState} from 'react';
import {PanResponder, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {applyMove, autoFinish, canAutoFinish, hint, isWon, legalMoves, newGame, undo} from '../src/domain/solitaire/klondike';
import type {Move} from '../src/domain/solitaire/klondike';
import {balance, emptyLedger, record} from '../src/domain/rewards/ledger';
import type {Ledger} from '../src/domain/rewards/ledger';
import {loadGame, saveGame} from '../src/persistence/save';
import {nativeSaveStore} from './src/nativeSave';
import {readGarden,writeGarden} from './src/nativeGarden';
import type {DecorationPlacement} from '../src/domain/garden/layout';
import SpringGarden from '../assets/v3/backgrounds/garden-spring.svg';
import SummerGarden from '../assets/v3/backgrounds/garden-summer.svg';
import AutumnGarden from '../assets/v3/backgrounds/garden-autumn.svg';
import WinterGarden from '../assets/v3/backgrounds/garden-winter.svg';
import {readSettings,writeSettings} from './src/nativeSettings';
import type {Season} from './src/nativeSettings';
import Back from '../assets/v3/cards/back-botanical.svg';
import {DraggableCard} from './src/DraggableCard';
import {CozyButton} from './src/CozyButton';
import {MemoryBoard} from './src/MemoryBoard';
import {newMemoryGame,revealMemory,hideMismatch,memoryWon} from '../src/domain/minigames/memory';
import {readMemory,writeMemory} from './src/nativeMemory';
import {quests} from '../src/domain/quests/quests';
import IconGarden from '../assets/v3/icons/garden.svg';
import IconCards from '../assets/v3/icons/cards.svg';
import IconMini from '../assets/v3/icons/mini.svg';
import IconQuests from '../assets/v3/icons/quests.svg';
import IconSettings from '../assets/v3/icons/settings.svg';
import Bench from '../assets/v3/decorations/bench.svg';
import Fountain from '../assets/v3/decorations/fountain.svg';
import FlowerPot from '../assets/v3/decorations/flower-pot.svg';
import HeaderBanner from '../assets/v3/ui/header-banner.svg';
import TabBackground from '../assets/v3/ui/tab-background.svg';
import PanelWide from '../assets/v3/ui/panel-wide.svg';

type Screen = 'garden' | 'cards' | 'mini' | 'quests' | 'settings';
type Source = {kind:'waste' | 'tableau' | 'foundation'; from:number; at:number};
type MeasuredElement={measureInWindow:(callback:(x:number,y:number,width:number,height:number)=>void)=>void};
const tabs = [
  {id:'garden', label:'Have', icon:IconGarden}, {id:'cards',label:'Kabale',icon:IconCards},
  {id:'mini',label:'Minispil',icon:IconMini}, {id:'quests',label:'Opgaver',icon:IconQuests},
  {id:'settings',label:'Indstil',icon:IconSettings},
] as const;
const decorations = [{name:'Bænk',art:Bench},{name:'Springvand',art:Fountain},{name:'Blomster',art:FlowerPot}] as const;

export default function App() {
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
  const tableauTargets=useRef<Array<MeasuredElement|null>>([]);
  const foundationTargets=useRef<Array<MeasuredElement|null>>([]);
  const [message,setMessage] = useState('');
  const [zoom,setZoom] = useState(1);
  const [offset,setOffset] = useState({x:0,y:0});
  const [placed,setPlaced] = useState<DecorationPlacement[]>([]);
  const [gardenTool,setGardenTool] = useState<0|1|2|null>(null);
  const [movingDecoration,setMovingDecoration] = useState<string|null>(null);
  const panOrigin = useRef({x:0,y:0});
  const pan = useRef(PanResponder.create({
    onMoveShouldSetPanResponder: (_,g)=>Math.abs(g.dx)>8 || Math.abs(g.dy)>8,
    onPanResponderGrant:()=>{panOrigin.current=offsetRef.current;},
    onPanResponderMove:(_,g)=>setOffset({x:panOrigin.current.x+g.dx,y:panOrigin.current.y+g.dy}),
  })).current;
  const offsetRef = useRef(offset);
  offsetRef.current=offset;
  const {width,height} = useWindowDimensions();
  const cardWidth = Math.min(56,(width-34)/7-3);
  const cardHeight = cardWidth*270/190;
  const gardenHeight=height-110;
  const month=new Date().getMonth();
  const actualSeason=season==='auto'?(month===11||month<2?'winter':month<5?'spring':month<8?'summer':'autumn'):season;
  const GardenArt={spring:SpringGarden,summer:SummerGarden,autumn:AutumnGarden,winter:WinterGarden}[actualSeason];

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
  function card(value:import('../src/domain/solitaire/klondike').Card,onPress:()=>void,source?:Source) {
    return <DraggableCard card={value} width={cardWidth} height={cardHeight} onTap={onPress}
      onDrop={source&&value.up?(x,y)=>dropCard(source,x,y):undefined}/>;
  }
  return <View style={styles.root}>
    <StatusBar style="dark"/>
    {screen === 'garden' ? <View style={styles.garden}>
      <View style={{flex:1,overflow:'hidden'}} {...pan.panHandlers}>
        <Pressable onPress={event=>placeInGarden(event.nativeEvent.locationX,event.nativeEvent.locationY)}
          style={{width,height:gardenHeight,transform:[{translateX:offset.x},{translateY:offset.y},{scale:zoom}]}}>
          <GardenArt width={width} height={gardenHeight} preserveAspectRatio="xMidYMid slice"/>
          {placed.map(item=>{const Art=decorations[item.kind].art;return <Pressable key={item.id}
            accessibilityLabel={`Flyt ${decorations[item.kind].name}`}
            onPress={()=>{setGardenTool(null);setMovingDecoration(item.id);}}
            style={{position:'absolute',left:width*item.x-42,top:gardenHeight*item.y-42,
              borderWidth:movingDecoration===item.id?2:0,borderColor:'#e0b75b',borderRadius:12}}>
            <Art width={84} height={84}/></Pressable>;})}
        </Pressable>
      </View>
      <View style={styles.hud}><HeaderBanner width="100%" height={92} preserveAspectRatio="none"/>
        <View style={styles.hudText}><Text style={styles.title}>Min have</Text><Text>Lysglimt ✨ {balance(ledger)}</Text><Text style={styles.tabText}>Dekorationer: 5 ✨</Text></View>
      </View>
      <View style={styles.gardenTools}>
        {(gardenTool!==null||movingDecoration!==null)&&<Text style={styles.info}>Tryk på stedet i haven {movingDecoration?'for at flytte':'for at placere'} · <Text onPress={()=>{setGardenTool(null);setMovingDecoration(null);}}>Annullér</Text></Text>}
        {movingDecoration&&<CozyButton wide label="Fjern dekoration" onPress={()=>{setPlaced(p=>p.filter(d=>d.id!==movingDecoration));setMovingDecoration(null);}}/>}
        <View style={styles.actions}>
          <CozyButton label="− Zoom" secondary onPress={()=>setZoom(v=>Math.max(1,v-0.25))}/>
          <CozyButton label="Nulstil" secondary onPress={()=>{setZoom(1);setOffset({x:0,y:0});}}/>
          <CozyButton label="+ Zoom" secondary onPress={()=>setZoom(v=>Math.min(2.5,v+0.25))}/>
        </View>
        <View style={styles.actions}>{decorations.map((d,i)=><Pressable key={d.name}
          style={[styles.decorButton,gardenTool===i&&styles.selected]} onPress={()=>{setGardenTool(i as 0|1|2);setMovingDecoration(null);}}
          accessibilityLabel={`Vælg ${d.name}`}><d.art width={44} height={44}/><Text style={styles.tabText}>{d.name}</Text></Pressable>)}</View>
      </View>
    </View> : screen === 'cards' ? <ScrollView style={styles.board} contentContainerStyle={styles.boardContent}>
      <Text style={styles.title}>Kabale · Klondike</Text><Text>Flytninger: {game.moves} · Lysglimt ✨ {balance(ledger)}</Text>
      <View style={styles.piles}>
        <Pressable onPress={draw} accessibilityLabel="Træk fra bunken" style={[styles.slot,{width:cardWidth,height:cardHeight}]}>
          {game.stock.length ? <Back width={cardWidth} height={cardHeight}/> : <Text>↻</Text>}</Pressable>
        {game.waste.length ? card(game.waste.at(-1)!,()=>setChosen({kind:'waste',from:0,at:0}),{kind:'waste',from:0,at:0}) :
          <View style={[styles.slot,{width:cardWidth,height:cardHeight}]}/>}
        {game.foundations.map((pile,index)=><Pressable ref={view=>{foundationTargets.current[index]=view;}} key={index} onPress={()=>chosen?move('foundation',index):pile.length?setChosen({kind:'foundation',from:index,at:pile.length-1}):undefined}
          accessibilityLabel={`Grundbunke ${index+1}`} style={[styles.slot,{width:cardWidth,height:cardHeight}]}>
          {pile.length ? card(pile.at(-1)!,()=>chosen?move('foundation',index):setChosen({kind:'foundation',from:index,at:pile.length-1}),{kind:'foundation',from:index,at:pile.length-1}) : <Text>A</Text>}</Pressable>)}
      </View>
      <View style={styles.piles}>{game.tableau.map((pile,index)=><Pressable ref={view=>{tableauTargets.current[index]=view;}} key={index} onPress={()=>move('tableau',index)}
        accessibilityLabel={`Kolonne ${index+1}`} style={{width:cardWidth,minHeight:cardHeight+150}}>
        {pile.map((value,at)=><View key={value.id} style={{marginTop:at?-cardHeight+27:0}}>
          {card(value,()=>chosen?move('tableau',index):value.up&&setChosen({kind:'tableau',from:index,at}),{kind:'tableau',from:index,at})}</View>)}
        {!pile.length&&<View style={[styles.slot,{height:cardHeight}]}/>}
      </Pressable>)}</View>
      <Text style={styles.info}>{message || (chosen ? 'Vælg en bunke' : 'Vælg kort og destination')}</Text>
      <View style={styles.actions}>
        <CozyButton label="Fortryd" secondary onPress={()=>{setGame(undo(game));setChosen(null);}}/>
        <CozyButton label="Tip" secondary onPress={showHint}/>
        {canAutoFinish(game)&&<CozyButton label="Afslut" onPress={()=>setGame(autoFinish(game))}/>}
        <CozyButton label="Nyt spil" onPress={()=>{setGame(newGame(Date.now()));setChosen(null);}}/>
      </View>
      {isWon(game)&&<Text style={styles.title}>Tillykke! Du har vundet ✨</Text>}
    </ScrollView> : screen==='mini' ? <ScrollView style={styles.board}><MemoryBoard game={memory} onFlip={flipMemory}
      onNew={()=>setMemory(newMemoryGame(Math.max(Date.now(),memory.round+1)))}/></ScrollView> :
      screen==='settings'?<ScrollView style={styles.board} contentContainerStyle={styles.questList}>
        <Text style={styles.title}>Indstillinger</Text><Text style={styles.info}>Vælg havens sæson</Text>
        {(['auto','spring','summer','autumn','winter'] as Season[]).map(value=><CozyButton
          key={value} wide secondary={value!==season} label={`${value===season?'✓ ':''}${{auto:'Automatisk',spring:'Forår',summer:'Sommer',autumn:'Efterår',winter:'Vinter'}[value]}`}
          onPress={()=>setSeason(value)}/>)}
        <Text style={styles.info}>Spillet er gratis, uden reklamer eller køb for rigtige penge.</Text>
      </ScrollView>:<ScrollView style={styles.board} contentContainerStyle={styles.questList}>
        <Text style={styles.title}>Mine opgaver</Text><Text style={styles.info}>Små mål med Lysglimt som belønning ✨</Text>
        {quests(ledger,placed.length).map(q=><View key={q.id} style={styles.quest}>
          <PanelWide width="100%" height="100%" preserveAspectRatio="none" style={StyleSheet.absoluteFill}/>
          <View style={styles.questInner}><Text style={styles.questTitle}>{q.title}</Text><Text style={styles.info}>{q.description}</Text>
            <Text style={styles.info}>{q.claimed?'Fuldført og indløst':q.complete?'Klar til at indløse':'I gang'} · +{q.reward} ✨</Text>
            {q.complete&&!q.claimed&&<CozyButton label="Hent belønning" wide onPress={()=>claimQuest(q.id,q.reward)}/>}</View>
        </View>)}
      </ScrollView>}
    {message&&screen!=='cards'&&<Pressable accessibilityRole="button" accessibilityLabel="Luk besked" onPress={()=>setMessage('')} style={styles.notice}>
      <Text style={styles.info}>{message} · Luk ×</Text>
    </Pressable>}
    <View style={styles.nav}><TabBackground width="100%" height={72} preserveAspectRatio="none" style={StyleSheet.absoluteFill}/>{tabs.map(tab=><Pressable key={tab.id} accessibilityRole="tab"
      accessibilityState={{selected:screen===tab.id}} onPress={()=>{setScreen(tab.id);setChosen(null);}}
      style={[styles.tab,screen===tab.id&&styles.selected]}><tab.icon width={27} height={27}/>
      <Text style={styles.tabText}>{tab.label}</Text></Pressable>)}</View>
  </View>;
}

const styles=StyleSheet.create({
  root:{flex:1,paddingTop:28,backgroundColor:'#f5ecd8'},garden:{flex:1,overflow:'hidden'},
  hud:{position:'absolute',top:14,left:16,right:16,height:92},hudText:{position:'absolute',top:14,left:22,right:18},
  title:{fontSize:22,fontWeight:'700',color:'#4e543b'},gardenTools:{position:'absolute',bottom:8,alignSelf:'center',backgroundColor:'#fff7e8e8',padding:7,borderRadius:12,gap:7},decorButton:{minWidth:82,alignItems:'center',padding:4,backgroundColor:'#e9d6aa',borderRadius:9},
  nav:{height:72,flexDirection:'row',backgroundColor:'#fff4df'},
  tab:{flex:1,justifyContent:'center',alignItems:'center',gap:3},selected:{backgroundColor:'#ebdebd'},tabText:{fontSize:12,color:'#504631'},
  board:{flex:1},boardContent:{padding:10,paddingBottom:30},piles:{flexDirection:'row',justifyContent:'space-between',marginTop:22},
  slot:{borderWidth:1,borderColor:'#b9ad92',borderStyle:'dashed',borderRadius:6,alignItems:'center',justifyContent:'center'},
  rank:{position:'absolute',top:5,left:4,fontWeight:'800',fontSize:12},info:{marginVertical:15,textAlign:'center',color:'#65573d'},
  actions:{flexDirection:'row',gap:7,justifyContent:'center',flexWrap:'wrap'},button:{padding:12,minHeight:44,backgroundColor:'#e9d6aa',borderRadius:9},
  questList:{alignItems:'center',padding:18,gap:14},quest:{width:'100%',maxWidth:420,minHeight:154,alignItems:'center'},questInner:{width:'100%',alignItems:'center',padding:17},
  questTitle:{fontSize:19,fontWeight:'700',color:'#53462f'},
  notice:{position:'absolute',left:12,right:12,bottom:79,minHeight:48,borderRadius:12,backgroundColor:'#fff7e5',borderWidth:1,borderColor:'#c8a16b',paddingHorizontal:10},
});
