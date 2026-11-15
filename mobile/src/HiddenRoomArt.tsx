import React from 'react';
import Svg,{Circle,Ellipse,Line,Path,Polygon,Rect} from 'react-native-svg';

/** Native vector artwork: a warmly lit, detailed quilt-maker's cottage. */
export function HiddenRoomArt(){
  return <Svg width="100%" height="100%" viewBox="0 0 330 470" preserveAspectRatio="xMidYMid slice">
    <Rect width="330" height="470" fill="#d5a875"/>
    <Rect y="0" width="330" height="285" fill="#e7c99a"/>
    {Array.from({length:13},(_,i)=><Line key={`wall${i}`} x1={i*28} y1="0" x2={i*28} y2="289" stroke="#b9855f" strokeWidth="2" opacity="0.5"/>)}
    <Polygon points="0,295 330,295 330,470 0,470" fill="#a66a43"/>
    {Array.from({length:10},(_,i)=><Line key={`floor${i}`} x1="0" y1={302+i*20} x2="330" y2={302+i*20} stroke="#844c32" opacity="0.6" strokeWidth="2"/>)}
    <Rect x="12" y="24" width="122" height="157" rx="5" fill="#83512e" stroke="#593a26" strokeWidth="5"/>
    <Rect x="19" y="31" width="108" height="142" fill="#9cc7ad"/>
    <Circle cx="101" cy="58" r="17" fill="#ffedbd"/>
    <Path d="M19 143 Q52 86 81 121 Q103 89 127 124 V173 H19Z" fill="#699077"/>
    <Line x1="73" y1="30" x2="73" y2="174" stroke="#795034" strokeWidth="7"/>
    <Line x1="17" y1="102" x2="128" y2="102" stroke="#795034" strokeWidth="6"/>
    <Rect x="145" y="10" width="170" height="205" rx="6" fill="#77482e"/>
    {[0,1,2,3].map(i=><React.Fragment key={`shelf${i}`}>
      <Rect x="151" y={51+i*41} width="157" height="7" fill="#b37b48"/>
      {Array.from({length:12},(_,j)=><Rect key={`book${i}-${j}`} x={155+j*12} y={27+i*41+((j*7+i)%6)} width={7+(j%2)*2} height={24-((j*3)%7)} rx="1" fill={['#4b7480','#b66151','#e6bf69','#789569','#c68c58'][((j+i*2)%5)]}/>)}
    </React.Fragment>)}
    <Rect x="144" y="214" width="175" height="12" fill="#5a382a"/>
    <Rect x="144" y="226" width="13" height="74" fill="#70442e"/>
    <Rect x="306" y="226" width="13" height="74" fill="#70442e"/>
    <Rect x="154" y="232" width="152" height="65" fill="#c29565"/>
    <Rect x="163" y="238" width="133" height="49" rx="10" fill="#79513b"/>
    <Path d="M190 283 Q181 264 193 252 Q212 241 221 260 Q228 280 214 283Z" fill="#edab50"/>
    <Path d="M207 281 Q197 267 209 250 Q215 261 214 269 Q223 256 230 270 L224 282" fill="#ffe29a"/>
    <Rect x="7" y="209" width="125" height="99" rx="19" fill="#6c8c88" stroke="#4d6464" strokeWidth="7"/>
    <Rect x="4" y="262" width="133" height="57" rx="17" fill="#547b7e"/>
    {Array.from({length:5},(_,row)=>Array.from({length:6},(_,col)=><Rect key={`quilt${row}-${col}`} x={12+col*19} y={227+row*17} width="18" height="16" fill={['#eab56e','#d76e5c','#f0ddab','#4d898c','#8b9d6d'][(col*3+row)%5]} stroke="#fff2c6" strokeWidth="1"/>))}
    <Ellipse cx="69" cy="296" rx="43" ry="14" fill="#425d5b" opacity="0.24"/>
    <Ellipse cx="75" cy="297" rx="29" ry="14" fill="#b8a48a"/>
    <Circle cx="56" cy="287" r="12" fill="#b8a48a"/>
    <Polygon points="47,280 49,268 57,276" fill="#a78b75"/>
    <Polygon points="57,276 66,268 65,284" fill="#a78b75"/>
    <Path d="M92 298 Q119 275 118 302" fill="none" stroke="#b8a48a" strokeWidth="7" strokeLinecap="round"/>
    <Line x1="51" y1="290" x2="54" y2="290" stroke="#49382e" strokeWidth="3"/>
    <Rect x="206" y="318" width="115" height="94" rx="10" fill="#835638"/>
    <Rect x="213" y="321" width="101" height="83" rx="5" fill="#c99960"/>
    {Array.from({length:4},(_,row)=>Array.from({length:5},(_,col)=><Polygon key={`patch${row}-${col}`} points={`${217+col*18},${326+row*19} ${235+col*18},${326+row*19} ${226+col*18},${345+row*19}`} fill={['#ad6555','#e5bc68','#6b9391','#9baf73'][(row+col)%4]} stroke="#f6e6bd" strokeWidth="1"/>))}
    <Rect x="13" y="346" width="167" height="111" rx="13" fill="#ad774f" stroke="#6e4432" strokeWidth="8"/>
    {Array.from({length:6},(_,row)=>Array.from({length:9},(_,col)=><Rect key={`rug${row}-${col}`} x={20+col*17} y={353+row*16} width="16" height="15" fill={['#ad6262','#5a8890','#e3b668','#ecdca7','#79977a'][(col*2+row*3)%5]}/>))}
    <Ellipse cx="292" cy="268" rx="20" ry="7" fill="#96664c"/>
    <Rect x="286" y="249" width="13" height="20" fill="#ac674a"/>
    {[0,1,2,3,4].map(i=><Ellipse key={`leaf${i}`} cx={280+i*5} cy={242-(i%2)*9} rx="8" ry="16" fill={i%2?'#668d5b':'#86a569'} transform={`rotate(${i*28-55} ${280+i*5} ${242-(i%2)*9})`}/>)}
    <Line x1="0" y1="191" x2="142" y2="191" stroke="#77462f" strokeWidth="6"/>
    <Circle cx="44" cy="194" r="5" fill="#ffe5a7"/>
    <Circle cx="116" cy="194" r="5" fill="#ffe5a7"/>
    <Rect x="0" y="0" width="330" height="470" fill="none" stroke="#76543e" strokeWidth="8"/>
  </Svg>;
}
