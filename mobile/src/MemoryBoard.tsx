import React from 'react';
import {Image,StyleSheet,Text,Pressable,View} from 'react-native';
import type {MemoryGame} from '../../src/domain/minigames/memory';
import {memoryWon} from '../../src/domain/minigames/memory';
import {CozyButton} from './CozyButton';

const avatars=[require('../assets/illustrations/memory-animal-0.webp'),require('../assets/illustrations/memory-animal-1.webp'),require('../assets/illustrations/memory-animal-2.webp'),require('../assets/illustrations/memory-animal-3.webp')];
const cardBack=require('../assets/illustrations/card-back-premium.webp');
export function MemoryBoard({game,onFlip,onNew}:{game:MemoryGame;onFlip:(i:number)=>void;onNew:()=>void}){
  return <View style={styles.wrap}>
    <Text style={styles.title}>Skovens vendespil</Text>
    <Text style={styles.caption}>Find de fire par af skovens venner · {game.turns} forsøg</Text>
    <View style={styles.grid}>{game.tiles.map((kind,index)=>{
      const visible=game.revealed.includes(index)||game.matched.includes(index);
      return <Pressable key={index} accessibilityRole="button" accessibilityLabel={visible?`Figur ${kind+1}`:'Vend kort'}
        onPress={()=>onFlip(index)} disabled={game.matched.includes(index)}
        style={[styles.tile,game.matched.includes(index)&&styles.matched]}>
        {visible?<Image source={avatars[kind]} resizeMode="contain" style={styles.animal}/>:<Image source={cardBack} resizeMode="stretch" style={styles.back}/>}
      </Pressable>;
    })}</View>
    {memoryWon(game)?<Text style={styles.title}>Alle par fundet! ✨ +5 Lysglimt</Text>:<Text style={styles.caption}>Vend to kort ad gangen</Text>}
    <CozyButton label="Nyt vendespil" wide onPress={onNew}/>
  </View>;
}
const styles=StyleSheet.create({
  wrap:{alignItems:'center',paddingVertical:22,paddingHorizontal:12,gap:15},
  title:{fontSize:23,fontWeight:'900',color:'#19465b',textAlign:'center'},
  caption:{fontSize:14,fontWeight:'700',color:'#6b5135',textAlign:'center'},
  grid:{width:238,maxWidth:'100%',flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:6},
  tile:{width:55,height:72,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:'#fff0d4',borderWidth:2,borderColor:'#dbb66d',shadowColor:'#49331a',shadowOpacity:0.32,shadowRadius:5,elevation:4},
  back:{width:50,height:68},animal:{width:50,height:62},
  matched:{backgroundColor:'#dcf5c7',borderColor:'#80b968'},
});
