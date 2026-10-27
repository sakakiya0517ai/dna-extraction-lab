// Canvas fallback: projects the same Three.js geometry on the CPU. No GPU / WebGL required.
// Intentionally simplified material rendering; not a replacement for WebGL fidelity.
import * as THREE from 'three';
export class SoftwareRenderer {
 constructor(){this.domElement=document.createElement('canvas');this.ctx=this.domElement.getContext('2d');this.ratio=1;this.shadowMap={enabled:false};this.info={render:{triangles:0}};this.last=0;}
 setPixelRatio(r){this.ratio=Math.min(r,1);}
 setSize(w,h){this.w=w;this.h=h;this.domElement.width=w*this.ratio;this.domElement.height=h*this.ratio;}
 render(scene,camera){const now=performance.now();if(now-this.last<65)return false;this.last=now;scene.updateMatrixWorld();camera.updateMatrixWorld();const ctx=this.ctx,w=this.domElement.width,h=this.domElement.height;ctx.fillStyle='#dce6df';ctx.fillRect(0,0,w,h);const faces=[],vp=new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),mvp=new THREE.Matrix4(),v0=new THREE.Vector3(),v1=new THREE.Vector3(),v2=new THREE.Vector3(),a=new THREE.Vector3(),b=new THREE.Vector3(),normal=new THREE.Vector3(),light=new THREE.Vector3(-.4,.8,.5).normalize();
 scene.traverseVisible(obj=>{if(!obj.isMesh)return;const material=Array.isArray(obj.material)?obj.material[0]:obj.material;if(!material||material.opacity===0)return;const geo=obj.geometry,pos=geo.attributes.position,index=geo.index;if(!pos)return;mvp.multiplyMatrices(vp,obj.matrixWorld);const color=material.color||new THREE.Color('#bccfc0');const count=index?index.count:pos.count;
 for(let i=0;i<count;i+=3){const i0=index?index.getX(i):i,i1=index?index.getX(i+1):i+1,i2=index?index.getX(i+2):i+2;v0.fromBufferAttribute(pos,i0);v1.fromBufferAttribute(pos,i1);v2.fromBufferAttribute(pos,i2);a.subVectors(v1,v0);b.subVectors(v2,v0);normal.crossVectors(a,b).transformDirection(obj.matrixWorld);const brightness=.65+.45*Math.abs(normal.dot(light));v0.applyMatrix4(mvp);v1.applyMatrix4(mvp);v2.applyMatrix4(mvp);if(v0.z>1||v1.z>1||v2.z>1||v0.z< -1||v1.z< -1||v2.z< -1)continue;if(Math.abs(v0.x)>5||Math.abs(v0.y)>5)continue;
 const area=(v1.x-v0.x)*(v2.y-v0.y)-(v1.y-v0.y)*(v2.x-v0.x);if(material.side!==THREE.DoubleSide&&area<0)continue;
 const c=color.clone().multiplyScalar(brightness);faces.push({layer:obj.userData.owner||obj.geometry.type==='CylinderGeometry'&&obj.parent===scene?1:0,xy:[(v0.x*.5+.5)*w,(-v0.y*.5+.5)*h,(v1.x*.5+.5)*w,(-v1.y*.5+.5)*h,(v2.x*.5+.5)*w,(-v2.y*.5+.5)*h],z:(v0.z+v1.z+v2.z)/3,color:c.getStyle(),alpha:material.transparent?material.opacity:1});}
 });faces.sort((a,b)=>a.layer-b.layer||b.z-a.z);ctx.lineWidth=.35;for(const f of faces){ctx.globalAlpha=f.alpha;ctx.fillStyle=f.color;ctx.strokeStyle=f.color;ctx.beginPath();ctx.moveTo(f.xy[0],f.xy[1]);ctx.lineTo(f.xy[2],f.xy[3]);ctx.lineTo(f.xy[4],f.xy[5]);ctx.closePath();ctx.fill();if(f.alpha===1)ctx.stroke();}ctx.globalAlpha=1;this.info.render.triangles=faces.length;
 // Texture labels are projected separately so bottle markings remain readable.
 scene.traverseVisible(obj=>{if(!obj.isMesh||!obj.material.map?.image)return;const image=obj.material.map.image;const p=new THREE.Vector3().setFromMatrixPosition(obj.matrixWorld).project(camera);if(p.z>1)return;const dist=camera.position.distanceTo(obj.getWorldPosition(new THREE.Vector3()));const width=Math.min(150,w*.12)*8/Math.max(5,dist);ctx.globalAlpha=.9;ctx.drawImage(image,(p.x*.5+.5)*w-width/2,(-p.y*.5+.5)*h-width/4,width,width/2);ctx.globalAlpha=1;});
 return true;
 }
}
