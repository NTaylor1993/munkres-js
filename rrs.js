(async function() {
  const threshold = -10,
  	//jsonFile = "rrs_50x20.json";
	  jsonFile = "rrs.json";

  document.addEventListener("DOMContentLoaded", function() {
    fetch(new Request(jsonFile))
      .then(response => {
        return response.json();
      })
      .then(json => {
		data = json;
        preFilterByThreshold();
        buildTable("resource-table");
      });
  });

  function buildTable(id) {
	let table = document.getElementById(id);

	if (!table) {
		const container = document.getElementById('table-data');

		table = document.createElement('table');
		table.setAttribute('id', id);

		container.appendChild(table);
	}

    while (table.firstChild) {
      table.removeChild(table.firstChild);
    }

    makeSquare();
    createResourceRequestRow(table);
    createResourceRows(table);
    update();
  }

  function preFilterByThreshold() {
    const threshold = -10,
      numberOfRRs = getResourceRequests().length;

    for (let i = 0; i < numberOfRRs; i++) {
      let maxWeight = 0;
      data.forEach(resource => {
        const weight = resource.rrs[i].weight;
        if (weight < maxWeight) {
          maxWeight = weight;
        }
      });

      if (maxWeight > threshold) {
        removeResourceRequest(i);
      }
    }
  }

  function postFilterByThreshold(matrix, indices) {
    console.log("here");
    for (let i = 0; i <= data[0].rrs.length - 1; i++) {
      if (
        matrix[indices[i][0]][indices[i][1]] > threshold &&
        data[0].rrs[i].rrId != "Dummy"
      ) {
        console.log(data[0].rrs);
        console.log(indices[i]);
        console.log(i);
        data.forEach(resource => {
          resource.rrs.splice(indices[i][0], 1);
		});
		buildTable();
      }
	}


  }

  function removeResourceRequest(idx) {
    console.log("Remove rr", idx);
    getResources().forEach(resource => {
      resource.rrs.splice(idx, 1);
    });
  }

  function makeSquare() {
    let numberOfResources = getResources().length,
      numberOfRRs = getResourceRequests().length;

    for (; numberOfResources < numberOfRRs; numberOfResources++) {
      createDummyResource();
    }

    for (; numberOfResources > numberOfRRs; numberOfRRs++) {
      createDummyRR();
    }
  }

  function createDummyResource() {
    data.push({ name: "Dummy" });
  }

  function createDummyRR() {
    data.forEach(resource => {
      resource.rrs.push({ rrId: "Dummy", weight: 0 });
    });
  }

  function createResourceRequestRow(table) {
    const tr = document.createElement("tr"),
      td = document.createElement("td");

    tr.appendChild(td);

    getResourceRequests().forEach(rr => {
      const td = document.createElement("td");

      td.innerText = rr.rrId;
      tr.appendChild(td);
    });

    table.appendChild(tr);
  }

  function getResourceRequests() {
    return data[0].rrs;
  }

  function getResources() {
    return data;
  }

  function createResourceRows(table) {
    getResources().forEach((resource, idx) => {
      const tr = document.createElement("tr"),
        td = document.createElement("td");

      td.innerText = resource.name;
      tr.appendChild(td);

      resource.rrs.forEach((rr, rrIdx) => {
        const td = document.createElement("td");
        const input = document.createElement("input");

		td.setAttribute("id", "tab-" + rrIdx + "-" + idx);

		td.setAttribute("matrix-id", "tab-" + rrIdx + "-" + idx);

        input.setAttribute("type", "text");
        input.addEventListener("change", update);
        input.value = rr.weight;
        td.appendChild(input);
        tr.appendChild(td);
      });

      table.appendChild(tr);
    });
  }

  function getMatrix() {
    var matrix = [],
      N = getResources().length;

    for (var i = 0; i < N; ++i) {
      matrix[i] = [];
      for (var j = 0; j < N; ++j) {
        matrix[i][j] =
          parseInt(
            document.getElementById("tab-" + i + "-" + j).children[0].value
          ) || 0;
      }
    }

    return matrix;
  }

  function update() {
    const matrix = getMatrix();
    const indices = solve(matrix);

    postFilterByThreshold(matrix, indices);
    highlightSolution(matrix, indices);
  }

  function highlightSolution(matrix, indices) {
    let totalCost = 0;

    removeClass();
    for (var k = 0; k < indices.length; ++k) {
      var i = indices[k][0],
        j = indices[k][1];
      totalCost += matrix[i][j];
      document.getElementById("tab-" + i + "-" + j).className = "active";
    }

    document.getElementById("total-cost").value = totalCost;
    document.getElementById("indices").value = formatIndicesAsString(indices);
  }

  function removeClass() {
    const N = getResources().length;

    for (var i = 0; i < N; ++i) {
      for (var j = 0; j < N; ++j) {
        document.getElementById("tab-" + i + "-" + j).className = "";
      }
    }
  }

  function solve(matrix) {
    return new Munkres().compute(matrix);
  }

  function formatIndicesAsString(indices) {
    return indices
      .map(ind => {
        return ["[", ind.join(","), "]"].join("");
      })
      .join(", ");
  }
})();
