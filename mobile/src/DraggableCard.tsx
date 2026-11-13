import React, {useMemo, useRef, useState} from 'react';
import {PanResponder, StyleSheet, Text, View} from 'react-native';
import Face from '../../assets/v3/cards/face-woodland.svg';
import Back from '../../assets/v3/cards/back-botanical.svg';
import type {Card} from '../../src/domain/solitaire/klondike';

const ranks:Record<number,string>={1:'A',11:'J',12:'Q',13:'K'};
const suit:Record<string,string>={C:'♣',D:'♦',H:'♥',S:'♠'};

type Props={card:Card;width:number;height:number;onTap:()=>void;onDoubleTap?:()=>void;onDrop?:(x:number,y:number)=>void;onDragChange?:(active:boolean)=>void;run?:Card[]};

export function DraggableCard({card,width,height,onTap,onDoubleTap,onDrop,onDragChange,run=[]}:Props){
  const [shift,setShift]=useState({x:0,y:0});
  const callbacks=useRef({onTap,onDoubleTap,onDrop,onDragChange});
  callbacks.current={onTap,onDoubleTap,onDrop,onDragChange};
  const lastTap=useRef(0);
  const tapTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
  const dragging=useRef(false);
  const enabled=card.up;
  React.useEffect(()=>()=>{if(tapTimer.current)clearTimeout(tapTimer.current);},[]);
  const gesture=useMemo(()=>PanResponder.create({
    onStartShouldSetPanResponder:()=>true,
    onMoveShouldSetPanResponder:(_,g)=>Math.abs(g.dx)>5||Math.abs(g.dy)>5,
    onPanResponderMove:(_,g)=>{if(enabled&&callbacks.current.onDrop){
      if(!dragging.current){dragging.current=true;callbacks.current.onDragChange?.(true);}
      setShift({x:g.dx,y:g.dy});
    }},
    onPanResponderRelease:(_,g)=>{
      setShift({x:0,y:0});
      if(dragging.current){dragging.current=false;callbacks.current.onDragChange?.(false);}
      if(Math.abs(g.dx)<9&&Math.abs(g.dy)<9){
        const now=Date.now();
        if(now-lastTap.current<320&&callbacks.current.onDoubleTap){
          if(tapTimer.current)clearTimeout(tapTimer.current);
          tapTimer.current=null;lastTap.current=0;callbacks.current.onDoubleTap();
        }else{
          lastTap.current=now;
          if(tapTimer.current)clearTimeout(tapTimer.current);
          tapTimer.current=setTimeout(()=>{callbacks.current.onTap();tapTimer.current=null;},260);
        }
      }else if(enabled)callbacks.current.onDrop?.(g.moveX,g.moveY);
    },
    onPanResponderTerminate:()=>{setShift({x:0,y:0});dragging.current=false;callbacks.current.onDragChange?.(false);},
  }),[enabled]);
  return <View {...gesture.panHandlers} accessible accessibilityRole="button"
    accessibilityLabel={enabled?`${ranks[card.rank]??card.rank} ${suit[card.suit]}`:'Skjult kort'}
    style={{width,height,transform:[{translateX:shift.x},{translateY:shift.y}],zIndex:shift.x||shift.y?100:0,elevation:shift.x||shift.y?14:0}}>
    {card.up?<Face width={width} height={height}/>:<Back width={width} height={height}/>}
    {card.up&&<Text style={[styles.rank,{color:card.suit==='D'||card.suit==='H'?'#a03546':'#283b3b'}]}>{ranks[card.rank]??card.rank}{suit[card.suit]}</Text>}
    {(shift.x!==0||shift.y!==0)&&run.slice(1).map((next,i)=><View key={next.id} pointerEvents="none" style={{position:'absolute',top:(i+1)*27,left:0,width,height}}>
      <Face width={width} height={height}/><Text style={[styles.rank,{color:next.suit==='D'||next.suit==='H'?'#a03546':'#283b3b'}]}>{ranks[next.rank]??next.rank}{suit[next.suit]}</Text>
    </View>)}
  </View>;
}

const styles=StyleSheet.create({rank:{position:'absolute',left:4,top:5,fontSize:12,fontWeight:'800'}});
