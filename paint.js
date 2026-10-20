(function(root){
  const palette=['#ef5350','#ff8a65','#ffa726','#ffd54f','#fff176','#9ccc65','#43a047','#26a69a','#26c6da','#42a5f5','#5c6bc0','#7e57c2','#ab47bc','#ec407a','#f8bbd0','#ffccbc','#fff9c4','#c8e6c9','#b2ebf2','#d1c4e9','#ffe0bd','#e5b887','#c68642','#8d5524','#5c3a21','#ffffff','#eeeeee','#9e9e9e','#455a64','#212121'];
  const tools=['pencil','marker','crayon','watercolor','glitter','eraser','fill'];
  function random(seed){let value=seed>>>0;return ()=>{value=(1664525*value+1013904223)>>>0;return value/4294967296;};}
  function stroke(context,from,to,settings){
    const generator=random(settings.seed),distance=Math.hypot(to[0]-from[0],to[1]-from[1]),size=settings.size;
    context.save();context.globalCompositeOperation=settings.tool==='eraser'?'destination-out':'source-over';context.fillStyle=settings.color;context.strokeStyle=settings.color;context.lineCap='round';context.lineJoin='round';
    if(['pencil','marker','eraser'].includes(settings.tool)){
      context.globalAlpha=settings.tool==='pencil'?.78:1;context.lineWidth=settings.tool==='pencil'?Math.max(1,size*.23):size;
      context.beginPath();context.moveTo(...from);context.lineTo(...to);context.stroke();context.beginPath();context.arc(to[0],to[1],context.lineWidth/2,0,Math.PI*2);context.fill();
    }else{
      const spacing=settings.tool==='watercolor'?Math.max(3,size*.32):Math.max(1,size*.18),steps=Math.max(1,Math.ceil(distance/spacing));
      for(let step=0;step<steps;step++){
        const amount=(step+1)/steps,center=[from[0]+(to[0]-from[0])*amount,from[1]+(to[1]-from[1])*amount];
        if(settings.tool==='watercolor'){
          context.globalAlpha=.11;for(let layer=0;layer<3;layer++){context.beginPath();context.arc(center[0],center[1],size*(.65-layer*.13),0,Math.PI*2);context.fill();}
        }else if(settings.tool==='crayon'){
          context.globalAlpha=.32;for(let fleck=0;fleck<22;fleck++){const angle=generator()*Math.PI*2,radius=Math.sqrt(generator())*size*.52;context.fillRect(center[0]+Math.cos(angle)*radius,center[1]+Math.sin(angle)*radius,1+generator()*1.8,1+generator()*1.8);}
        }else if(settings.tool==='glitter'){
          context.globalAlpha=.48;context.fillStyle=settings.color;context.beginPath();context.arc(center[0],center[1],size*.38,0,Math.PI*2);context.fill();
          for(let spark=0;spark<3;spark++){const angle=generator()*Math.PI*2,radius=generator()*size*.8,position=[center[0]+Math.cos(angle)*radius,center[1]+Math.sin(angle)*radius],length=1+generator()*size*.19;context.globalAlpha=.95;context.strokeStyle=spark%2?'#ffffff':'#ffe785';context.lineWidth=1.2;context.beginPath();context.moveTo(position[0]-length,position[1]);context.lineTo(position[0]+length,position[1]);context.moveTo(position[0],position[1]-length);context.lineTo(position[0],position[1]+length);context.stroke();}
        }
      }
    }
    context.restore();
  }
  function fill(image,startX,startY,color,tolerance=14){
    const {data,width,height}=image,start=Math.floor(startY)*width+Math.floor(startX);if(startX<0||startY<0||startX>=width||startY>=height)return false;
    const replacement=[parseInt(color.slice(1,3),16),parseInt(color.slice(3,5),16),parseInt(color.slice(5,7),16),255],target=Array.from(data.slice(start*4,start*4+4));
    if(target.every((value,index)=>value===replacement[index]))return false;
    const queue=new Uint32Array(width*height),seen=new Uint8Array(width*height);let head=0,tail=1;queue[0]=start;seen[start]=1;
    const matches=index=>{const offset=index*4;if(target[3]===0)return data[offset+3]===0;return target.every((value,channel)=>Math.abs(value-data[offset+channel])<=tolerance);};
    const visit=index=>{if(!seen[index]&&matches(index)){seen[index]=1;queue[tail++]=index;}};
    while(head<tail){const index=queue[head++],offset=index*4;data.set(replacement,offset);if(index%width)visit(index-1);if(index%width<width-1)visit(index+1);if(index>=width)visit(index-width);if(index<width*(height-1))visit(index+width);}
    return true;
  }
  function difference(before,after){
    let left=before.width,top=before.height,right=-1,bottom=-1;
    for(let offset=0;offset<before.data.length;offset+=4)if(before.data[offset]!==after.data[offset]||before.data[offset+1]!==after.data[offset+1]||before.data[offset+2]!==after.data[offset+2]||before.data[offset+3]!==after.data[offset+3]){const index=offset/4,column=index%before.width,row=Math.floor(index/before.width);left=Math.min(left,column);right=Math.max(right,column);top=Math.min(top,row);bottom=Math.max(bottom,row);}
    if(right<0)return null;const width=right-left+1,height=bottom-top+1,previous=new Uint8ClampedArray(width*height*4),next=new Uint8ClampedArray(previous.length);
    for(let row=0;row<height;row++){const start=((top+row)*before.width+left)*4;previous.set(before.data.subarray(start,start+width*4),row*width*4);next.set(after.data.subarray(start,start+width*4),row*width*4);}
    return {left,top,width,height,previous,next,bytes:previous.byteLength+next.byteLength};
  }
  const api={palette,tools,stroke,fill,difference};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.GardenPaint=api;
})(typeof window==='undefined'?globalThis:window);
