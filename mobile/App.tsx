import React, {useState} from 'react';
import {Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {applyMove, hint, legalMoves, newGame, undo} from '../src/domain/solitaire/klondike';
import type {Move} from '../src/domain/solitaire/klondike';
import SpringGarden from '../assets/v3/backgrounds/garden-spring.svg';
import Face from '../assets/v3/cards/face-blank.svg';
import Back from '../assets/v3/cards/back-botanical.svg';
import IconGarden from '../assets/v3/icons/garden.svg';
import IconCards from '../assets/v3/icons/cards.svg';
import IconMini from '../assets/v3/icons/mini.svg';
import IconQuests from '../assets/v3/icons/quests.svg';

type Screen = 'garden' | 'cards' | 'mini' | 'quests';
type Source = {kind:'waste' | 'tableau'; from:number; at:number};
const tabs = [
  {id:'garden', label:'Have', icon:IconGarden}, {id:'cards',label:'Kabale',icon:IconCards},
  {id:'mini',label:'Minispil',icon:IconMini}, {id:'quests',label:'Opgaver',icon:IconQuests},
] as const;
const faceRank = (n:number) => ({1:'A',11:'J',12:'Q',13:'K'} as Record<number,string>)[n] ?? String(n);
const suitSign = (s:string) => ({C:'♣',D:'♦',H:'♥',S:'♠'} as Record<string,string>)[s];

export default function App() {
  const [screen,setScreen] = useState<Screen>('garden');
  const [game,setGame] = useState(() => newGame(20261113));
  const [chosen,setChosen] = useState<Source | null>(null);
  const [message,setMessage] = useState('');
  const {width,height} = useWindowDimensions();
  const cardWidth = Math.min(56,(width-34)/7-3);
  const cardHeight = cardWidth*270/190;

  function move(to:'tableau' | 'foundation',index:number) {
    if (!chosen) return;
    const action:Move = chosen.kind === 'waste' ? {kind:'waste',to,index} :
      {kind:'tableau',from:chosen.from,at:chosen.at,to,index};
    if (legalMoves(game).some(m => JSON.stringify(m) === JSON.stringify(action))) {
      setGame(applyMove(game,action));setMessage('');
    } else setMessage('Ulovligt træk');
    setChosen(null);
  }
  function draw() {
    const kind = game.stock.length ? 'draw' : 'recycle';
    if (legalMoves(game).some(m => m.kind === kind)) setGame(applyMove(game,{kind}));
    else setMessage('Ingen flere kort at trække');
  }
  function card(value:{rank:number;suit:string;up:boolean},onPress?:()=>void) {
    return <Pressable onPress={onPress} accessibilityRole="button"
      accessibilityLabel={value.up ? `${faceRank(value.rank)} ${suitSign(value.suit)}` : 'Skjult kort'}
      style={{width:cardWidth,height:cardHeight}}>
      {value.up ? <Face width={cardWidth} height={cardHeight}/> : <Back width={cardWidth} height={cardHeight}/>}
      {value.up && <Text style={[styles.rank,{color:'DH'.includes(value.suit)?'#a03546':'#283b3b'}]}>
        {faceRank(value.rank)}{suitSign(value.suit)}</Text>}
    </Pressable>;
  }
  return <View style={styles.root}>
    <StatusBar style="dark"/>
    {screen === 'garden' ? <View style={styles.garden}>
      <SpringGarden width={width} height={height-110} preserveAspectRatio="xMidYMid slice"/>
      <View style={styles.hud}><Text style={styles.title}>Min have</Text><Text>Lysglimt ✨ 0</Text></View>
      <View style={styles.gardenNote}><Text style={styles.info}>Zoom og dekorationer integreres i næste etape.</Text></View>
    </View> : screen === 'cards' ? <ScrollView style={styles.board} contentContainerStyle={styles.boardContent}>
      <Text style={styles.title}>Kabale · Klondike</Text><Text>Flytninger: {game.moves}</Text>
      <View style={styles.piles}>
        <Pressable onPress={draw} accessibilityLabel="Træk fra bunken" style={[styles.slot,{width:cardWidth,height:cardHeight}]}>
          {game.stock.length ? <Back width={cardWidth} height={cardHeight}/> : <Text>↻</Text>}</Pressable>
        {game.waste.length ? card(game.waste.at(-1)!,()=>setChosen({kind:'waste',from:0,at:0})) :
          <View style={[styles.slot,{width:cardWidth,height:cardHeight}]}/>}
        {game.foundations.map((pile,index)=><Pressable key={index} onPress={()=>move('foundation',index)}
          accessibilityLabel={`Grundbunke ${index+1}`} style={[styles.slot,{width:cardWidth,height:cardHeight}]}>
          {pile.length ? card(pile.at(-1)!) : <Text>A</Text>}</Pressable>)}
      </View>
      <View style={styles.piles}>{game.tableau.map((pile,index)=><Pressable key={index} onPress={()=>move('tableau',index)}
        accessibilityLabel={`Kolonne ${index+1}`} style={{width:cardWidth,minHeight:cardHeight+150}}>
        {pile.map((value,at)=><View key={value.id} style={{marginTop:at?-cardHeight+27:0}}>
          {card(value,()=>chosen?move('tableau',index):value.up&&setChosen({kind:'tableau',from:index,at}))}</View>)}
        {!pile.length&&<View style={[styles.slot,{height:cardHeight}]}/>}
      </Pressable>)}</View>
      <Text style={styles.info}>{message || (chosen ? 'Vælg en bunke' : 'Vælg kort og destination')}</Text>
      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={()=>{setGame(undo(game));setChosen(null);}}><Text>Fortryd</Text></Pressable>
        <Pressable style={styles.button} onPress={()=>setMessage(hint(game).move?'Muligt træk fundet':'Ingen lovlige træk')}><Text>Tip</Text></Pressable>
        <Pressable style={styles.button} onPress={()=>{setGame(newGame(Date.now()));setChosen(null);}}><Text>Nyt spil</Text></Pressable>
      </View>
    </ScrollView> : <View style={styles.pending}><Text style={styles.title}>{screen==='mini'?'Minispil':'Opgaver'}</Text>
      <Text style={styles.info}>Under udvikling</Text></View>}
    <View style={styles.nav}>{tabs.map(tab=><Pressable key={tab.id} accessibilityRole="tab"
      accessibilityState={{selected:screen===tab.id}} onPress={()=>{setScreen(tab.id);setChosen(null);}}
      style={[styles.tab,screen===tab.id&&styles.selected]}><tab.icon width={27} height={27}/>
      <Text style={styles.tabText}>{tab.label}</Text></Pressable>)}</View>
  </View>;
}

const styles=StyleSheet.create({
  root:{flex:1,paddingTop:28,backgroundColor:'#f5ecd8'},garden:{flex:1,overflow:'hidden'},
  hud:{position:'absolute',top:14,left:16,right:16,padding:12,borderRadius:13,backgroundColor:'#fff6e6ee'},
  title:{fontSize:22,fontWeight:'700',color:'#4e543b'},gardenNote:{position:'absolute',bottom:14,alignSelf:'center',backgroundColor:'#fff7e8dc',padding:9,borderRadius:9},
  nav:{height:72,flexDirection:'row',backgroundColor:'#fff4df',borderTopWidth:1,borderColor:'#dcc8a6'},
  tab:{flex:1,justifyContent:'center',alignItems:'center',gap:3},selected:{backgroundColor:'#ebdebd'},tabText:{fontSize:12,color:'#504631'},
  board:{flex:1},boardContent:{padding:10,paddingBottom:30},piles:{flexDirection:'row',justifyContent:'space-between',marginTop:22},
  slot:{borderWidth:1,borderColor:'#b9ad92',borderStyle:'dashed',borderRadius:6,alignItems:'center',justifyContent:'center'},
  rank:{position:'absolute',top:5,left:4,fontWeight:'800',fontSize:12},info:{marginVertical:15,textAlign:'center',color:'#65573d'},
  actions:{flexDirection:'row',gap:10,justifyContent:'center'},button:{padding:12,minHeight:44,backgroundColor:'#e9d6aa',borderRadius:9},
  pending:{flex:1,justifyContent:'center',alignItems:'center'},
});
