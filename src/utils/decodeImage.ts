const decoded = new Map<string,Promise<void>>();
export function decodeImage(url:string):Promise<void> {
  const existing=decoded.get(url); if(existing)return existing;
  const ready=new Promise<void>(resolve=>{
    const image=new Image(); let settled=false;
    const finish=()=>{if(settled)return;settled=true;clearTimeout(timer);image.onload=null;image.onerror=null;resolve();};
    // A failed asset must not strand navigation. The real scene retains its fallback tone.
    const timer=setTimeout(finish,5000);
    image.onerror=finish;
    image.onload=()=>{void (image.decode?image.decode():Promise.resolve()).then(finish,finish);};
    image.src=url;
    if(image.complete&&image.naturalWidth)void image.decode().then(finish,finish);
  });
  decoded.set(url,ready); return ready;
}
export async function decodeImages(urls:string[]){await Promise.all(urls.map(decodeImage));}
