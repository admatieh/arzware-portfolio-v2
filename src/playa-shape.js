// A sculptural interpretation of Black Rock City's radial plan.
// Concentric streets run from 2:00 to 10:00; the open playa faces upward.
// This is an artwork, with no navigation or geographic accuracy implied.
export function makePlayaShape(count,phase=0){
  const positions=new Float32Array(count*3);
  const start=Math.PI/3,span=Math.PI*4/3;
  for(let i=0;i<count;i++){
    const ratio=i/count;
    let x,y,z;
    if(ratio<.64){
      const ring=i%12,r=.66+ring*.056;
      const a=start+Math.random()*span;
      x=Math.sin(a)*r;y=Math.cos(a)*r;
      z=(Math.random()-.5)*(.026+phase*.011)+Math.sin(a*3+phase)*.017;
    }else if(ratio<.9){
      const avenue=i%17,a=start+avenue/16*span,r=.66+Math.random()*.616;
      x=Math.sin(a)*r;y=Math.cos(a)*r;
      z=(Math.random()-.5)*.032+Math.sin(a*3+phase)*.017;
    }else if(ratio<.97){
      const ring=i%11,avenue=Math.floor(i/11)%16;
      const a=start+(avenue+.5)/16*span,r=.688+ring*.056;
      x=Math.sin(a)*r+(Math.random()-.5)*.018;
      y=Math.cos(a)*r+(Math.random()-.5)*.018;
      z=Math.random()*(.025+phase*.01);
    }else if(ratio<.989){
      const a=Math.random()*Math.PI*2;
      x=Math.sin(a)*.08;y=Math.cos(a)*.08;z=Math.random()*.06;
    }else{
      x=(Math.random()-.5)*.012;
      y=-.65+Math.random()*1.05;
      z=(Math.random()-.5)*.012;
    }
    positions[i*3]=x+(Math.random()-.5)*.003;
    positions[i*3+1]=y*.88;
    positions[i*3+2]=z-y*.3;
  }
  return positions;
}
