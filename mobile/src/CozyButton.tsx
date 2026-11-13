import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';
import Primary from '../../assets/v3/ui/button-primary.svg';
import Secondary from '../../assets/v3/ui/button-secondary.svg';

export function CozyButton({label,onPress,wide=false,secondary=false}:{
  label:string;onPress:()=>void;wide?:boolean;secondary?:boolean;
}){
  const w=wide?212:104;
  const Background=secondary?Secondary:Primary;
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
    style={({pressed})=>[styles.button,{width:w,opacity:pressed?0.75:1}]}>
    <Background width={w} height={44} preserveAspectRatio="none"/>
    <Text numberOfLines={1} style={styles.label}>{label}</Text>
  </Pressable>;
}

const styles=StyleSheet.create({
  button:{height:44,justifyContent:'center',alignItems:'center'},
  label:{position:'absolute',left:6,right:6,textAlign:'center',fontSize:13,fontWeight:'700',color:'#574126'},
});
