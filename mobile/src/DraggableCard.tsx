import React, {useMemo, useRef, useState} from 'react';
import {Image, PanResponder, StyleSheet, Text, View} from 'react-native';
import type {Card} from '../../src/domain/solitaire/klondike';

const ranks:Record<number,string>={1:'A',11:'J',12:'Q',13:'K'};
const suit:Record<string,string>={C:'♣',D:'♦',H:'♥',S:'♠'};
const premiumBack=require('../assets/illustrations/card-back-premium.webp');
const premiumFace=require('../assets/illustrations/card-face-premium.webp');

export function CardFace({card,width,height}:{card:Card;width:number;height:number}){
  const red=card.suit==='D'||card.suit==='H';
  const color=red?'#c6384b':'#194557';
  const cornerSize=Math.min(13,Math.max(10,width*0.19));
  const centerSize=Math.min(23,Math.max(15,width*0.34));
  return <View style={[styles.face,{width,height}]}>
    <Image source={premiumFace} resizeMode="stretch" style={{width,height}}/>
    <Text style={[styles.corner,{color,fontSize:cornerSize,lineHeight:cornerSize+2}]}>{ranks[card.rank]??card.rank}{suit[card.suit]}</Text>
    <Text style={[styles.centerSuit,{color,fontSize:centerSize,lineHeight:centerSize+3}]}>{suit[card.suit]}</Text>
    <Text style={[styles.bottomCorner,{color,fontSize:cornerSize,lineHeight:cornerSize+2}]}>{ranks[card.rank]??card.rank}</Text>
  </View>;
}

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
    {card.up?<CardFace card={card} width={width} height={height}/>:<Image source={premiumBack} resizeMode="stretch" style={{width,height}}/>}
    {(shift.x!==0||shift.y!==0)&&run.slice(1).map((next,i)=><View key={next.id} pointerEvents="none" style={{position:'absolute',top:(i+1)*27,left:0,width,height}}>
      <CardFace card={next} width={width} height={height}/>
    </View>)}
  </View>;
}

const styles=StyleSheet.create({
  face:{borderRadius:7,backgroundColor:'#fff9ed',overflow:'hidden',shadowColor:'#182d30',shadowOpacity:0.22,shadowRadius:2,elevation:2},
  corner:{position:'absolute',left:5,top:4,fontWeight:'900',includeFontPadding:false},
  centerSuit:{position:'absolute',alignSelf:'center',top:'40%',fontWeight:'800',includeFontPadding:false,textShadowColor:'#f3d29b',textShadowOffset:{width:0,height:1},textShadowRadius:1},
  bottomCorner:{position:'absolute',right:5,bottom:4,fontWeight:'900',includeFontPadding:false,transform:[{rotate:'180deg'}]},
});
