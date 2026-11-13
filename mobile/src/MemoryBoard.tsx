import React from 'react';
import {StyleSheet,Text,Pressable,View} from 'react-native';
import type {MemoryGame} from '../../src/domain/minigames/memory';
import {memoryWon} from '../../src/domain/minigames/memory';
import BotanicalBack from '../../assets/v3/cards/back-botanical.svg';
import Fox from '../../assets/v3/avatars/fox.svg';
import Cat from '../../assets/v3/avatars/cat.svg';
import Rabbit from '../../assets/v3/avatars/rabbit.svg';
import Owl from '../../assets/v3/avatars/owl.svg';
import {CozyButton} from './CozyButton';

const avatars=[Fox,Cat,Rabbit,Owl];
export function MemoryBoard({game,onFlip,onNew}:{game:MemoryGame;onFlip:(i:number)=>void;onNew:()=>void}){
  return <View style={styles.wrap}>
    <Text style={styles.title}>Skovens vendespil</Text>
    <Text style={styles.caption}>Find de fire par af skovens venner · {game.turns} forsøg</Text>
    <View style={styles.grid}>{game.tiles.map((kind,index)=>{
      const visible=game.revealed.includes(index)||game.matched.includes(index);
      const Avatar=avatars[kind];
      return <Pressable key={index} accessibilityRole="button" accessibilityLabel={visible?`Figur ${kind+1}`:'Vend kort'}
        onPress={()=>onFlip(index)} disabled={game.matched.includes(index)}
        style={[styles.tile,game.matched.includes(index)&&styles.matched]}>
        {visible?<Avatar width={62} height={74}/>:<BotanicalBack width={62} height={74}/>}
      </Pressable>;
    })}</View>
    {memoryWon(game)?<Text style={styles.title}>Alle par fundet! ✨ +5 Lysglimt</Text>:<Text style={styles.caption}>Vend to kort ad gangen</Text>}
    <CozyButton label="Nyt vendespil" wide onPress={onNew}/>
  </View>;
}
const styles=StyleSheet.create({
  wrap:{alignItems:'center',paddingVertical:22,paddingHorizontal:12,gap:15},
  title:{fontSize:22,fontWeight:'700',color:'#544b38',textAlign:'center'},
  caption:{fontSize:14,color:'#665b45',textAlign:'center'},
  grid:{maxWidth:320,flexDirection:'row',flexWrap:'wrap',justifyContent:'center',gap:12},
  tile:{width:70,height:83,borderRadius:12,alignItems:'center',justifyContent:'center',backgroundColor:'#f5e3bd'},
  matched:{backgroundColor:'#cce4c7'},
});
