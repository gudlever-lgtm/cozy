import React from 'react';
import {Image,StyleSheet,Text,Pressable,View} from 'react-native';
import type {MemoryGame} from '../../src/domain/minigames/memory';
import {memoryPairCount,memoryWon} from '../../src/domain/minigames/memory';
import {CozyButton} from './CozyButton';

const avatars=[
  require('../assets/illustrations/memory-animal-0.webp'),require('../assets/illustrations/memory-animal-1.webp'),
  require('../assets/illustrations/memory-animal-2.webp'),require('../assets/illustrations/memory-animal-3.webp'),
  require('../assets/illustrations/flower-pots.webp'),require('../assets/illustrations/bench.webp'),
  require('../assets/illustrations/fountain.webp'),require('../assets/illustrations/nav-icon-0.webp'),
  require('../assets/illustrations/nav-icon-2.webp'),require('../assets/illustrations/nav-icon-3.webp'),
];
const cardBack=require('../assets/illustrations/card-back-premium.webp');
export function MemoryBoard({game,onFlip,onNew,landscape=false}:{game:MemoryGame;onFlip:(i:number)=>void;onNew:()=>void;landscape?:boolean}){
  const won=memoryWon(game);
  const columns=game.level===4?5:4;
  const tileWidth=game.level===4?(landscape?56:44):(landscape?73:55);
  const tileHeight=game.level===4?(landscape?64:58):(landscape?78:72);
  return <View style={[styles.wrap,landscape&&styles.landscapeWrap]}>
    <Text style={styles.title}>Skovens vendespil</Text>
    <Text style={styles.caption}>Niveau {game.level} af 4 · Find {memoryPairCount(game.level)} par · {game.turns} forsøg</Text>
    <View style={[styles.grid,{width:columns*tileWidth+(columns-1)*6}]}>{game.tiles.map((kind,index)=>{
      const visible=game.revealed.includes(index)||game.matched.includes(index);
      return <Pressable key={index} accessibilityRole="button" accessibilityLabel={visible?`Figur ${kind+1}`:'Vend kort'}
        onPress={()=>onFlip(index)} disabled={game.matched.includes(index)}
        style={[styles.tile,{width:tileWidth,height:tileHeight},game.matched.includes(index)&&styles.matched]}>
        {visible?<Image source={avatars[kind]} resizeMode="contain" style={{width:tileWidth-5,height:tileHeight-6}}/>:<Image source={cardBack} resizeMode="stretch" style={{width:tileWidth-5,height:tileHeight-5}}/>}
      </Pressable>;
    })}</View>
    {won?<Text style={styles.title}>Alle par fundet! ✨ +5 Lysglimt</Text>:<Text style={styles.caption}>Vend to kort ad gangen</Text>}
    <CozyButton label={won&&game.level<4?'Næste niveau':'Nyt vendespil'} wide onPress={onNew}/>
  </View>;
}
const styles=StyleSheet.create({
  landscapeWrap:{paddingVertical:6,gap:7},landscapeGrid:{width:310},
  landscapeTile:{width:73,height:78},landscapeBack:{width:68,height:74},landscapeAnimal:{width:66,height:70},
  wrap:{alignItems:'center',paddingVertical:22,paddingHorizontal:12,gap:15},
  title:{fontSize:23,fontWeight:'900',color:'#19465b',textAlign:'center'},
  caption:{fontSize:14,fontWeight:'700',color:'#6b5135',textAlign:'center'},
  grid:{maxWidth:'100%',flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:6},
  tile:{width:55,height:72,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:'#fff0d4',borderWidth:2,borderColor:'#dbb66d',shadowColor:'#49331a',shadowOpacity:0.32,shadowRadius:5,elevation:4},
  back:{width:50,height:68},animal:{width:50,height:62},
  matched:{backgroundColor:'#dcf5c7',borderColor:'#80b968'},
});
