(async function () {
	const threshold = -10,
		// jsonFile = "rrs.json";
	  	jsonFile = "rrs_5.json";

	let currentTableId;

	document.addEventListener("DOMContentLoaded", function () {
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

		currentTableId = id;

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

			if (maxWeight > threshold && data[0].rrs[i].rrId != "Dummy") {
				removeResourceRequest(i);
			}
		}
	}

	function postFilterByThreshold(matrix, indices) {
		let refresh = false;

		for (let i = 0; i <= data[0].rrs.length - 1; i++) {
			if (
				matrix[indices[i][0]][indices[i][1]] > threshold &&
				data[0].rrs[i].rrId != "Dummy"
			) {
				refresh = true;
				data.forEach(resource => {
					resource.rrs.splice(indices[i][0], 1);
				});

			}
		}


		if (refresh) {
			buildTable("post-filter-table");

		}


	}

	function removeResourceRequest(idx) {
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
		data.push({ id: "Dummy" });
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

			td.innerText = resource.id;
			tr.appendChild(td);

			resource.rrs.forEach((rr, rrIdx) => {
				const td = document.createElement("td");
				const input = document.createElement("input");

				td.setAttribute("matrix-id", "tab-" + rrIdx + "-" + idx);

				input.setAttribute("type", "text");
				input.setAttribute("class", 'test');
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
						document.querySelector(`#${currentTableId} td[matrix-id=tab-${i}-${j}]`).children[0].value
					) || 0;
			}
		}

		return matrix;
	}

	function update() {
		const matrix = getMatrix();
		const indices = solve(matrix);
		highlightSolution(matrix, indices);
		postFilterByThreshold(matrix, indices);
		highlightSolution(matrix, indices);

		outputIndicesList(indices);
	}

	function highlightSolution(matrix, indices) {
		let totalCost = 0;

		console.log("highlighing", currentTableId);

		removeClass();
		for (var k = 0; k < indices.length; ++k) {
			var i = indices[k][0],
				j = indices[k][1];
			totalCost += matrix[i][j];

			document.querySelector(`#${currentTableId} td[matrix-id=tab-${i}-${j}]`).className = "active";
		}

		document.getElementById("total-cost").value = totalCost;
		document.getElementById("indices").value = formatIndicesAsString(indices);
	}

	function removeClass() {
		const N = getResources().length;

		for (var i = 0; i < N; ++i) {
			for (var j = 0; j < N; ++j) {
				document.querySelector(`#${currentTableId} td[matrix-id=tab-${i}-${j}]`).className = "";
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

	function outputIndicesList(indices) {
		assignmentList = document.createElement('ul');

		indices.forEach(index => {
			let resourceName = data[index[1]].id;
			let resourceRequestId = data[index[1]].rrs[index[0]].rrId;

			if (resourceName !== 'Dummy' && resourceRequestId !== 'Dummy') {
				listItem = document.createElement('li');
				listItem.value = 200;
				// listItem.value = index[0] + " - " + index[1];

				valueItem = document.createElement('input');
				valueItem.value = resourceName + " - " + resourceRequestId;

				listItem.appendChild(valueItem);
				assignmentList.appendChild(listItem);
			}
		})

		const container = document.getElementById('assignment-list');
		container.appendChild(assignmentList);

	}
})();