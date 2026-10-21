export async function readPhoto(file){
 if(!file||!file.type.startsWith('image/'))throw new Error('Bir fotoğraf dosyası seçin.');
 if(file.size>12*1024*1024)throw new Error('Fotoğraf en fazla 12 MB olabilir.');
 const bitmap=await createImageBitmap(file);
 const scale=Math.min(1,480/bitmap.width,640/bitmap.height);
 const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
 const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 return canvas.toDataURL('image/jpeg',0.8);
}
