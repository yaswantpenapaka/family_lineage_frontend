const API = "https://pinapaka-family-api.onrender.com";

async function loadTree() {

  const res = await fetch(API + "/persons");
  const { persons, relations, marriages } = await res.json();

  const personMap = {};
  persons.forEach(p => personMap[p.id] = p);

  /* -----------------------------
     Build relationship maps
  ----------------------------- */

  const childrenMap = {};
  relations.forEach(r => {
    if (!childrenMap[r.parent_id])
      childrenMap[r.parent_id] = [];
    childrenMap[r.parent_id].push(r.child_id);
  });

  const spouseMap = {};
  marriages.forEach(m => {
    spouseMap[m.person1_id] = m.person2_id;
    spouseMap[m.person2_id] = m.person1_id;
  });

  /* -----------------------------
     Find roots
  ----------------------------- */

  const childIds = new Set(relations.map(r => r.child_id));
  const roots = persons.filter(p => !childIds.has(p.id));

  const visited = new Set();

function buildFamily(person) {

  if (!person) return null;

  const spouseId = spouseMap[person.id];
  const spouse = spouseId ? personMap[spouseId] : null;

  // Only build from male OR unmarried female root
  if (person.gender === "Female" && spouse)
    return null;

  const childrenIds = childrenMap[person.id] || [];

  // SORT children by DOB (older left)
  const sortedChildren = childrenIds
    .map(cid => personMap[cid])
    .sort((a, b) => new Date(a.dob) - new Date(b.dob));

  return {
    type: "family",
    husband: person.gender === "Male" ? person : null,
    wife: spouse && spouse.gender === "Female" ? spouse : null,
    children: sortedChildren
      .map(child => buildFamily(child))
      .filter(Boolean)
  };
}

  const treeData = {
    type: "root",
    children: roots.map(r => buildFamily(r)).filter(Boolean)
  };

  /* -----------------------------
     D3 Setup
  ----------------------------- */

  const svg = d3.select("svg");
  svg.selectAll("*").remove();

  const width = window.innerWidth;
  const height = window.innerHeight;

  const g = svg.append("g");

  svg.call(
    d3.zoom().on("zoom", e => {
      g.attr("transform", e.transform);
    })
  );

  const layout = d3.tree().nodeSize([300, 160]);
  const root = d3.hierarchy(treeData, d => d.children);
  layout(root);

  /* -----------------------------
     Remove artificial root link
  ----------------------------- */

  const links = root.links().filter(l => l.source.depth !== 0);

  g.selectAll(".link")
    .data(links)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-width", 2)
    .attr("d", d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y)
    );

  /* -----------------------------
     Draw Nodes (Skip root)
  ----------------------------- */

  const nodes = root.descendants()
    .filter(d => d.depth !== 0);

  const node = g.selectAll(".node")
    .data(nodes)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  node.each(function(d) {

    const group = d3.select(this);

    if (d.data.type === "family") {

      const boxWidth = 260;
      const boxHeight = 45;

      if (d.data.husband) {

        group.append("rect")
          .attr("x", -boxWidth/2)
          .attr("y", -boxHeight/2)
          .attr("width", boxWidth/2)
          .attr("height", boxHeight)
          .attr("rx", 8)
          .attr("fill", "#4A90E2")
          .style("cursor", "pointer")
          .on("click", () =>
            window.location =
              "../profile.html?id=" + d.data.husband.id
          );

        group.append("text")
          .attr("x", -boxWidth/4)
          .attr("dy", 5)
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .style("pointer-events", "none")
          .text(d.data.husband.firstname);
      }

      if (d.data.wife) {

        group.append("rect")
          .attr("x", 0)
          .attr("y", -boxHeight/2)
          .attr("width", boxWidth/2)
          .attr("height", boxHeight)
          .attr("rx", 8)
          .attr("fill", "#F78FB3")
          .style("cursor", "pointer")
          .on("click", () =>
            window.location =
              "../profile.html?id=" + d.data.wife.id
          );

        group.append("text")
          .attr("x", boxWidth/4)
          .attr("dy", 5)
          .attr("text-anchor", "middle")
          .attr("fill", "white")
          .style("pointer-events", "none")
          .text(d.data.wife.firstname);
      }
    }
  });

  /* -----------------------------
     Center Tree
  ----------------------------- */

  const minX = d3.min(nodes, d => d.x);
  const maxX = d3.max(nodes, d => d.x);

  const treeWidth = maxX - minX;

  const centerOffset = width / 2 - (minX + treeWidth / 2);

  g.attr("transform", `translate(${centerOffset},100)`);
}

function goDashboard() {
  window.location = "../dashboard.html";
}

loadTree();