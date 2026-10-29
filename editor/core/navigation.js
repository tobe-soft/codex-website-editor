(() => {
 const header=document.querySelector('.header'),row=header?.querySelector('.nav-row'),nav=header?.querySelector('.desktop-nav');if(!row||!nav)return;
 let pending=false;
 function measure(){pending=false;if(innerWidth<=1000){header.classList.remove('nav-overflow');return;}const wrapper=document.createElement('div');wrapper.className='header';wrapper.style.cssText='position:fixed;left:-100000px;top:0;width:max-content;visibility:hidden;pointer-events:none';const copy=nav.cloneNode(true);copy.style.cssText='display:flex!important;width:max-content;max-width:none';wrapper.append(copy);document.body.append(wrapper);const width=copy.getBoundingClientRect().width;wrapper.remove();const brand=row.querySelector('.brand')?.getBoundingClientRect().width??0,action=row.querySelector('.nav-contact')?.getBoundingClientRect().width??0;header.classList.toggle('nav-overflow',width+brand+action+60>row.clientWidth);}
 function schedule(){if(!pending){pending=true;requestAnimationFrame(measure);}}
 new ResizeObserver(schedule).observe(row);addEventListener('resize',schedule);header.querySelectorAll('img').forEach(img=>img.addEventListener('load',schedule));measure();
})();
