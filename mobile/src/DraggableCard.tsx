import React, {useMemo, useRef, useState} from 'react';
import {PanResponder, StyleSheet, Text, View} from 'react-native';
import Face from '../../assets/v3/cards/face-blank.svg';
import Back from '../../assets/v3/cards/back-botanical.svg';
import type {Card} from '../../src/domain/solitaire/klondike';

const ranks:Record<number,string>={1:'A',11:'J',12:'Q',13:'K'};
const suit:Record<string,string>={C:'♣',D:'♦',H:'♥',S:'♠'};

type Props={card:Card;width:number;height:number;onTap:()=>void;onDrop?:(x:number,y:number)=>void};

export function DraggableCard({card,width,height,onTap,onDrop}:Props){
  const [shift,setShift]=useState({x:0,y:0});
  const callbacks=useRef({onTap,onDrop});
  callbacks.current={onTap,onDrop};
  const enabled=card.up;
  const gesture=useMemo(()=>PanResponder.create({
    onStartShouldSetPanResponder:()=>true,
    onMoveShouldSetPanResponder:()=>true,
    onPanResponderMove:(_,g)=>{if(enabled&&callbacks.current.onDrop)setShift({x:g.dx,y:g.dy});},
    onPanResponderRelease:(_,g)=>{
      setShift({x:0,y:0});
      if(Math.abs(g.dx)<9&&Math.abs(g.dy)<9)callbacks.current.onTap();
      else if(enabled)callbacks.current.onDrop?.(g.moveX,g.moveY);
    },
    onPanResponderTerminate:()=>setShift({x:0,y:0}),
  }),[enabled]);
  return <View {...gesture.panHandlers} accessible accessibilityRole="button"
    accessibilityLabel={enabled?`${ranks[card.rank]??card.rank} ${suit[card.suit]}`:'Skjult kort'}
    style={{width,height,transform:[{translateX:shift.x},{translateY:shift.y}],zIndex:shift.x||shift.y?100:0}}>
    {card.up?<Face width={width} height={height}/>:<Back width={width} height={height}/>}
    {card.up&&<Text style={[styles.rank,{color:card.suit==='D'||card.suit==='H'?'#a03546':'#283b3b'}]}>{ranks[card.rank]??card.rank}{suit[card.suit]}</Text>}
  </View>;
}

const styles=StyleSheet.create({rank:{position:'absolute',left:4,top:5,fontSize:12,fontWeight:'800'}});
