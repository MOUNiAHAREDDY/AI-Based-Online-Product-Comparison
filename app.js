const allProducts = window.INITIAL_PRODUCTS || [];
let products = [...allProducts];
let priceChart = null, ratingChart = null;

const grid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const selectedCount = document.getElementById("selectedCount");
const compareSelected = document.getElementById("compareSelected");

function money(value){return "₹" + Number(value).toLocaleString("en-IN");}
function selectedIds(){return [...document.querySelectorAll(".product-check:checked")].map(x=>x.value);}
function updateSelectedCount(){selectedCount.textContent=selectedIds().length;}

function renderProducts(list){
  products=list;
  grid.innerHTML="";
  document.getElementById("emptyState").hidden=list.length!==0;
  list.forEach(p=>{
    const card=document.createElement("article");
    card.className="product-card"; card.dataset.id=p.id;
    const checked=selectedIds().includes(p.id)?"checked":"";
    card.innerHTML=`
      <div class="card-image">
        <img src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy">
        <label class="select-product"><input type="checkbox" class="product-check" value="${p.id}" ${checked}><span></span> Compare</label>
        <span class="platform-badge">${escapeHtml(p.platform)}</span>
      </div>
      <div class="card-content">
        <div class="product-meta"><span>${escapeHtml(p.brand)}</span><span class="rating">★ ${p.rating}</span></div>
        <h3>${escapeHtml(p.name)}</h3>
        <div class="price-row"><strong>${money(p.price)}</strong><span class="price-caption">listed price</span></div>
        <div class="card-features">${p.features.slice(0,2).map(f=>`<span>✓ ${escapeHtml(f)}</span>`).join("")}</div>
        <button class="text-btn view-details" data-id="${p.id}">View details <span>→</span></button>
      </div>`;
    grid.appendChild(card);
  });
  updateSelectedCount();
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function filterProducts(){
  const q=searchInput.value.trim().toLowerCase(), category=categoryFilter.value;
  const filtered=allProducts.filter(p=>(category==="All"||p.category===category)&&(`${p.name} ${p.brand} ${p.category}`).toLowerCase().includes(q));
  renderProducts(filtered);
}
searchInput.addEventListener("input",filterProducts);
categoryFilter.addEventListener("change",filterProducts);
grid.addEventListener("change",e=>{if(e.target.classList.contains("product-check"))updateSelectedCount();});
grid.addEventListener("click",e=>{const btn=e.target.closest(".view-details");if(btn)showDetails(btn.dataset.id);});

function showDetails(id){
  const p=allProducts.find(x=>x.id===id); if(!p)return;
  const reviews=p.reviews||[];
  const positive=reviews.filter(r=>/great|good|excellent|comfortable|smooth|nice|clear|value|fast/i.test(r)).length;
  document.getElementById("modalBody").innerHTML=`
    <div class="eyebrow">${escapeHtml(p.brand)} · ${escapeHtml(p.platform)}</div>
    <h2 id="modalTitle">${escapeHtml(p.name)}</h2><div class="modal-price">${money(p.price)} <span class="rating">★ ${p.rating}</span></div>
    <h4>Key specifications</h4><ul>${p.features.map(f=>`<li>${escapeHtml(f)}</li>`).join("")}</ul>
    <h4>Customer review samples</h4><div class="review-list">${reviews.map(r=>`<div class="review-item"><span class="sentiment-pill">${/bad|poor|issue|unclear|high|heavy/i.test(r)?"Mixed":"Positive / Neutral"}</span>${escapeHtml(r)}</div>`).join("")}</div>
    <p style="font-size:10px;color:#87928c;margin-top:15px">Sentiment labels are illustrative in this demo; the Flask API provides NLP polarity analysis.</p>`;
  document.getElementById("detailsModal").hidden=false;
}
document.getElementById("closeModal").addEventListener("click",()=>document.getElementById("detailsModal").hidden=true);
document.getElementById("detailsModal").addEventListener("click",e=>{if(e.target.id==="detailsModal")e.currentTarget.hidden=true;});
document.addEventListener("keydown",e=>{if(e.key==="Escape")document.getElementById("detailsModal").hidden=true;});

compareSelected.addEventListener("click",()=>{
  const ids=selectedIds();
  if(ids.length<2){alert("Please select at least two products to compare.");return;}
  const chosen=allProducts.filter(p=>ids.includes(p.id));
  renderComparison(chosen);
  generateRecommendation(chosen);
  document.getElementById("compare").scrollIntoView({behavior:"smooth"});
});
function renderComparison(items){
  document.getElementById("comparisonEmpty").hidden=true;
  document.getElementById("comparisonContent").hidden=false;
  const rows=[
    ["Product",p=>p.name],["Price",p=>money(p.price)],["Brand",p=>p.brand],
    ["Platform",p=>p.platform],["Rating",p=>`★ ${p.rating} / 5`],
    ["Category",p=>p.category],["Specifications",p=>p.features.join(" · ")]
  ];
  const table=document.getElementById("comparisonTable");
  table.innerHTML=`<thead><tr><th>Feature</th>${items.map(p=>`<th>${escapeHtml(p.name)}</th>`).join("")}</tr></thead><tbody>`+
    rows.map(([label,get])=>`<tr><td>${label}</td>${items.map(p=>`<td>${escapeHtml(get(p))}</td>`).join("")}</tr>`).join("")+"</tbody>";
  drawCharts(items);
}
function drawCharts(items){
  if(priceChart)priceChart.destroy(); if(ratingChart)ratingChart.destroy();
  const labels=items.map(p=>p.name);
  priceChart=new Chart(document.getElementById("priceChart"),{
    type:"bar",data:{labels,datasets:[{label:"Price (₹)",data:items.map(p=>p.price),backgroundColor:["#176b52","#73b89a","#b8d9c6","#e1b66d"],borderRadius:7,maxBarThickness:52}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>money(c.raw)}}},scales:{y:{beginAtZero:true,grid:{color:"#edf1ed"},ticks:{callback:v=>"₹"+Number(v).toLocaleString("en-IN")}},x:{grid:{display:false},ticks:{maxRotation:25,minRotation:0}}}}
  });
  ratingChart=new Chart(document.getElementById("ratingChart"),{
    type:"bar",data:{labels,datasets:[{label:"Rating / 5",data:items.map(p=>p.rating),backgroundColor:"#e5b35c",borderRadius:7,maxBarThickness:52},{label:"Positive review share (%)",data:items.map(p=>Math.round((p.reviews||[]).filter(r=>/great|good|excellent|comfortable|smooth|nice|clear|value|fast/i.test(r)).length/Math.max(1,(p.reviews||[]).length)*100)/20),backgroundColor:"#7db79a",borderRadius:7,maxBarThickness:52}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"bottom",labels:{boxWidth:10,font:{size:10}}}},scales:{y:{beginAtZero:true,max:5,grid:{color:"#edf1ed"}},x:{grid:{display:false},ticks:{maxRotation:25,minRotation:0}}}}
  });
}
function generateRecommendation(items){
  const min=Math.min(...items.map(p=>p.price)),max=Math.max(...items.map(p=>p.price));
  const scored=items.map(p=>{
    const positives=(p.reviews||[]).filter(r=>/great|good|excellent|comfortable|smooth|nice|clear|value|fast/i.test(r)).length;
    const sentiment=(positives+1)/((p.reviews||[]).length+2);
    const priceScore=max===min?1:(max-p.price)/(max-min);
    const score=(p.rating/5*.55+sentiment*.25+priceScore*.20)*100;
    return {...p,score};
  }).sort((a,b)=>b.score-a.score);
  const winner=scored[0];
  document.getElementById("recommendationBox").innerHTML=`
    <div class="recommendation-result"><span class="winner-label">BEST VALUE IN YOUR SELECTION</span>
      <h4>${escapeHtml(winner.name)}</h4><strong>${money(winner.price)}</strong>
      <p>Rating: ★ ${winner.rating}/5 · Value score: ${winner.score.toFixed(1)}/100. This option scored highest using rating, sample review sentiment and relative price.</p>
      <span class="score-pill">Top score ${winner.score.toFixed(1)}</span>
    </div>`;
}
// initial static page products; ensure interactions work with initial selection
updateSelectedCount();
