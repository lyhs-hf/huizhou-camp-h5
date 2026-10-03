// Dense relief samples in object coordinates, one sample per SVG unit.
// Each event is a physical segment, and lifting the tool breaks that segment.
export function traceRelief(branches, start, end, coverage) {
  const dx=end.x-start.x,dy=end.y-start.y, length2=dx*dx+dy*dy;
  branches.forEach((samples,branch)=>samples.forEach((point,index)=>{
    const t=length2?Math.max(0,Math.min(1,((point.x-start.x)*dx+(point.y-start.y)*dy)/length2)):0;
    const distance2=(point.x-start.x-t*dx)**2+(point.y-start.y-t*dy)**2;
    if(distance2<=64)coverage[branch].add(index);
  }));
}
