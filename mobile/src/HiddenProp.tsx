import React from 'react';
import Svg,{Circle,Ellipse,Line,Path,Polygon,Rect} from 'react-native-svg';

/** Tiny illustrated props that blend into furniture rather than floating emoji. */
export function HiddenProp({kind}:{kind:number}){
  const common={width:26,height:26,viewBox:'0 0 26 26'} as const;
  if(kind===0)return <Svg {...common}><Circle cx="7" cy="18" r="5" stroke="#ba9451" strokeWidth="3" fill="none"/><Path d="M11 15L22 4M17 9l4 4M19 7l4 4" stroke="#d4b477" strokeWidth="3" strokeLinecap="round"/><Path d="M11 15L22 4" stroke="#6d552a" strokeWidth="0.7"/></Svg>;
  if(kind===1)return <Svg {...common}><Rect x="3" y="6" width="20" height="14" rx="1" fill="#e6d1a5" stroke="#9f7d58" strokeWidth="1"/><Path d="M4 7L13 14L22 7" fill="none" stroke="#ad8664" strokeWidth="1.5"/><Path d="M4 20L11 14M22 20L15 14" stroke="#b99b72" strokeWidth="1"/></Svg>;
  if(kind===2)return <Svg {...common}><Ellipse cx="8" cy="9" rx="6" ry="7" fill="#d09a55" stroke="#70553a" strokeWidth="1" transform="rotate(-26 8 9)"/><Ellipse cx="18" cy="9" rx="6" ry="7" fill="#c8815a" stroke="#70553a" strokeWidth="1" transform="rotate(26 18 9)"/><Ellipse cx="8" cy="18" rx="4" ry="5" fill="#e9bd79"/><Ellipse cx="18" cy="18" rx="4" ry="5" fill="#c7a36e"/><Line x1="13" y1="7" x2="13" y2="22" stroke="#5e4438" strokeWidth="2"/><Path d="M13 8Q9 1 7 3M13 8Q17 1 19 3" fill="none" stroke="#61483b" strokeWidth="1"/></Svg>;
  if(kind===3)return <Svg {...common}><Polygon points="13,2 16,10 25,10 18,15 21,24 13,19 5,24 8,15 1,10 10,10" fill="#dab45b" stroke="#8f6a39" strokeWidth="1.5"/><Circle cx="13" cy="13" r="3" fill="#f4d896"/></Svg>;
  return <Svg {...common}><Circle cx="13" cy="13" r="10" fill="#9e7759" stroke="#674738" strokeWidth="2"/><Circle cx="9" cy="9" r="2" fill="#4a342c"/><Circle cx="17" cy="9" r="2" fill="#4a342c"/><Circle cx="9" cy="17" r="2" fill="#4a342c"/><Circle cx="17" cy="17" r="2" fill="#4a342c"/></Svg>;
}
