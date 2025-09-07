const consoleLog = true;

console.log("LOADED:- XLfinance_CBA_Client.mjs is loaded",new Date().toLocaleString());
export function XLfinance_CBA_Client_isLoaded(){
    return true;
}

// ♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️
//  ONLY IMPORT CLIENT SIDE MODULES TO HERE
    import { parseDate } from './global_Client.mjs';
// ♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️♾️



        function renderTransactions(data,sectionId) {
            const isMobile = window.innerWidth < 768;
            if (isMobile) {
                document.getElementById(`desktop-table-container-${sectionId}`).style.display = 'none';
                document.getElementById(`mobile-card-container-${sectionId}`).style.display = 'block';
                renderCards(data,sectionId);
            } else {
                document.getElementById(`mobile-card-container-${sectionId}`).style.display = 'none';
                document.getElementById(`desktop-table-container-${sectionId}`).style.display = 'block';
                renderTable(data,sectionId);
            }
        }


    function parseTransactions(csvText, accountEmail, portfolioId, portfolioName, portfolioGSTrate, portfolioFXrate) {
      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row = Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));

        const details = row.Details;
        
        let idDate =`unknown`;
        // const rawDate = row.Date || '';
        const rawDate = parseDate(row.Date,"d/m/y");
        const dateObj = new Date(rawDate);
        if (!isNaN(dateObj.getTime())) {
            const yyyy = dateObj.getFullYear();
            const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(dateObj.getDate()).padStart(2, '0');
            idDate = `${yyyy}${mm}${dd}`;
        }
        // console.log(row.Date);
        // console.log(idDate);
        let idReference = 'unknown';
        const reference = row.Reference || '';
        // Sanitize reference string
            idReference = reference.replace(/\s+/g, '_');
        // console.log(idReference);
        const id = idDate + '_' + idReference;
        console.log(id);

        // Start with accountEmail/portfolioId/portfolioName at beginning
        const result = {
          accountEmail: accountEmail,
          portfolioId: portfolioId,
          portfolioName: portfolioName,
          portfolioGSTrate: portfolioGSTrate,
          portfolioFXrate: portfolioFXrate,
          original: line,
          id: id,
          Date: row.Date,
          Reference: row.Reference,
          Debit: row["Debit($)"],
          Credit: row["Credit($)"],
          Balance: row["Balance($)"]
        };

        // 1. B or S transaction
        if (/^[BS]\s+\d+/.test(details)) {
          const [trxType, trxQty, trxTicker, atSymbol, trxUnitAmount] = details.split(/\s+/);
          Object.assign(result, {
            trxType,
            trxQty,
            trxTicker,
            trx: atSymbol,
            trxUnitAmount,
            Brokerage_inclGST: Math.abs(( trxQty * trxUnitAmount - row["Credit($)"] - row["Debit($)"] )).toFixed(2),
            GST: Math.abs((( trxQty * trxUnitAmount - row["Credit($)"] - row["Debit($)"] )) / 11).toFixed(2)
          });
        }
        // 2. Drawer
        else if (/Drawer/i.test(details)) {
          const match = details.match(/Drawer\s+(.*)/i);
          result.Drawer = match ? match[1].trim() : '';
          result.trxType = 'R';
        }
        // 3. Payee
        else if (/Payee/i.test(details)) {
          const match = details.match(/Payee\s+(.*)/i);
          result.Payee = match ? match[1].trim() : '';
          result.trxType = 'P';
        }
        // 4. Reference starts with J
        else if (/^J/i.test(row.Reference)) {
          result.trxType = 'J';
          result.Details = details;
        }
        // 5. Fallback
        else {
          result.Details = details;
        }

        return result;
      });
    }

	// upload new records START
		// 📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤
            let parsedData;
			export function selectFileForUpload(event){
				// document.getElementById('csvFileInput').addEventListener('change', function (event) {
				console.log(event.target.id);
				console.log(event.target.files);
				// document.getElementById('c').addEventListener('change', function (event) {
				const file = event.target.files[0];
				if (!file) return;
				const accountEmail = document.getElementById('accountEmail').value.trim();
				const portfolioId = document.getElementById('portfolioId').value.trim();
				const portfolioName = document.getElementById('portfolioName').value.trim();
                const portfolioGSTrate = document.getElementById("portfolioGSTrate").value.trim();
                const portfolioFXrate = document.getElementById("portfolioFXrate").value.trim();
				if (!accountEmail || !portfolioId || !portfolioName) {
					alert("Please enter:\n     Account Email Address;\n     Portfolio ID;\n     Account Name;\n...before uploading.");
                    document.getElementById("csvFileInput").value="";
					return;
				}
				const reader = new FileReader();
				reader.onload = function (e) {
				const csvText = e.target.result;
				parsedData = parseTransactions(csvText, accountEmail, portfolioId, portfolioName, portfolioGSTrate, portfolioFXrate);
				// document.getElementById('output').textContent = JSON.stringify(parsedData, null, 2); // renders raw json of imported csv file
				renderTransactions(parsedData,"section1");
				console.log("Parsed JSON:", parsedData);
				window.localStorage.setItem("XLfinance_parsedData",JSON.stringify(parsedData));
				};
				reader.readAsText(file);
			}
		// 📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤📤
	// upload new records END

    // desktop display START
        // 💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻
            function renderTable(data,sectionId) {
                const container = document.getElementById(`desktop-table-container-${sectionId}`);
                container.innerHTML = '';

                const table = document.createElement('table');
                table.id = 'transactionsTable';
                table.style.cssText = `
                    width: 100%;
                    border-collapse: collapse;
                `;

                const thead = document.createElement('thead');
                const tbody = document.createElement('tbody');
                tbody.id = 'transactionsBody';

                const headers = [
                    "id", "Date", "Reference", "Type", "Qty", "Ticker", "Unit Amount",
                    "Debit", "Credit", "Balance", "Brokerage_inclGST", "GST", "Payee", "Drawer"
                ];

                // Create header row
                const headerRow = document.createElement('tr');
                headers.forEach((h, idx) => {
                    const th = document.createElement('th');
                    th.textContent = h;
                    th.style.cssText = `
                        position: sticky;
                        top: 0;
                        background: #f2f2f2;
                        padding: 8px;
                        border-bottom: 2px solid #999;
                        cursor: pointer;
                    `;
                    th.dataset.index = idx;
                    th.addEventListener('click', () => sortTableByColumn(idx));
                    headerRow.appendChild(th);
                });
                thead.appendChild(headerRow);
                table.appendChild(thead);
                table.appendChild(tbody);
                container.appendChild(table);

                populateTable(data);

                // Filter listener
                const filterInput = document.getElementById('tableFilter');
                filterInput.addEventListener('input', () => {
                    const filterValue = filterInput.value.toLowerCase();
                    const filtered = data.filter(txn =>
                    Object.values(txn).some(val => String(val).toLowerCase().includes(filterValue))
                    );
                    populateTable(filtered);
                });

                function populateTable(rows) {
                    tbody.innerHTML = '';
                    rows.forEach(txn => {
                        const tr = document.createElement('tr');
                        tr.dataset.id = txn.id;
                        tr.innerHTML = `
                            <td>${txn.id || ''}</td>
                            <td>${txn.Date || ''}</td>
                            <td>${txn.Reference || ''}</td>
                            <td contenteditable="true">${txn.trxType || ''}</td>
                            <td contenteditable="true">${txn.trxQty || ''}</td>
                            <td contenteditable="true">${txn.trxTicker || ''}</td>
                            <td contenteditable="true">${txn.trxUnitAmount || ''}</td>
                            <td contenteditable="true">${txn.Debit || ''}</td>
                            <td contenteditable="true">${txn.Credit || ''}</td>
                            <td contenteditable="true">${txn.Balance || ''}</td>
                            <td contenteditable="true">${txn.Brokerage_inclGST || ''}</td>
                            <td contenteditable="true">${txn.GST || ''}</td>
                            <td contenteditable="true">${txn.Payee || ''}</td>
                            <td contenteditable="true">${txn.Drawer || ''}</td>
                        `;
                        tbody.appendChild(tr);
                    });
                }

                // Attach to the tbody so it covers all cells
                tbody.addEventListener('blur', function (event) {
                    const cell = event.target;

                    // Only act on contenteditable cells inside a <td>
                    if (cell.tagName !== 'TD' || !cell.isContentEditable) return;

                    const tr = cell.closest('tr');
                    const rowId = tr?.dataset.id;
                    if (!rowId) return;

                    // Find the corresponding object in your data array
                    const txn = data.find(t => t.id === rowId);
                    if (!txn) return;

                    // Determine which column this is
                    const columnIndex = Array.from(cell.parentNode.children).indexOf(cell);

                    // Match to your field names
                    const fieldMap = [
                        "id", "Date", "Reference", "trxType", "trxQty", "trxTicker", "trxUnitAmount",
                        "Debit", "Credit", "Balance", "Brokerage_inclGST", "GST", "Payee", "Drawer"
                    ];

                    const field = fieldMap[columnIndex];

                    // Avoid modifying id, Date, Reference
                    if (["id", "Date", "Reference"].includes(field)) return;

                    // Update the value in your data array
                    txn[field] = cell.textContent.trim();

                    console.log(`Updated [${field}] of txn ${rowId}:`, txn);
                }, true);  // useCapture: true so it catches blur events bubbling up


                // Basic sort handler
                function sortTableByColumn(columnIndex) {
                    let ascending = table.dataset.sortDir !== 'asc';
                    table.dataset.sortDir = ascending ? 'asc' : 'desc';

                    const sorted = [...data].sort((a, b) => {
                    const valA = Object.values(a)[columnIndex] || '';
                    const valB = Object.values(b)[columnIndex] || '';

                    const numA = parseFloat(valA);
                    const numB = parseFloat(valB);

                    if (!isNaN(numA) && !isNaN(numB)) {
                        return ascending ? numA - numB : numB - numA;
                    }

                    return ascending
                        ? String(valA).localeCompare(String(valB))
                        : String(valB).localeCompare(String(valA));
                    });

                    populateTable(sorted);
                }
            }
        // 💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻💻
    // desktop display END

    // mobile display START
        // 📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱
            function renderCards(data,sectionId) {
            const container = document.getElementById(`mobile-card-container-${sectionId}`);
            container.innerHTML = '';

            data.forEach(txn => {
                const card = document.createElement('div');
                card.style.cssText = `
                border: 1px solid #ccc;
                border-radius: 8px;
                margin: 10px 0;
                padding: 10px;
                background-color: #f9f9f9;
                `;

                card.innerHTML = `
                <strong>Date:</strong> ${txn.Date || ''}<br>
                <strong>Reference:</strong> ${txn.Reference || ''}<br>
                <strong>Type:</strong> ${txn.trxType || ''}<br>
                ${txn.trxQty ? `<strong>Qty:</strong> ${txn.trxQty}<br>` : ''}
                ${txn.trxTicker ? `<strong>Ticker:</strong> ${txn.trxTicker}<br>` : ''}
                ${txn.trxUnitAmount ? `<strong>Unit Amount:</strong> ${txn.trxUnitAmount}<br>` : ''}
                ${txn.Payee ? `<strong>Payee:</strong> ${txn.Payee}<br>` : ''}
                ${txn.Drawer ? `<strong>Drawer:</strong> ${txn.Drawer}<br>` : ''}
                <strong>Debit:</strong> ${txn.Debit || ''}<br>
                <strong>Credit:</strong> ${txn.Credit || ''}<br>
                <strong>Balance:</strong> ${txn.Balance || ''}<br>
                `;
                container.appendChild(card);
            });
            }
        // 📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱📱
    // mobile display END

	// save uploaded records START
	    // 💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤
			let fileHandle; // persist file handle for saving
			let savedEmail = ''; // to create consistent file name
			// Save to NDJSON file
			export async function appendUploadedRecords(){
				// document.getElementById('saveButton').addEventListener('click', async () => {
				try {
					if (!window.showSaveFilePicker) {
						alert('This feature requires a supported browser (e.g., Chrome).');
						return;
					}
					// const jsonString = window.localStorage.getItem("XLfinance_parsedData");
					// const parsedData = JSON.parse(jsonString);
					if (!parsedData || parsedData.length === 0) {
						alert('No parsed data to save.');
    					return;
					}
					const accountEmail = parsedData[0]?.accountEmail || 'unknown';
					savedEmail = accountEmail;
					const fileName = `XLfinance_${accountEmail}.ndjson`;
					if (!fileHandle) {
						fileHandle = await window.showSaveFilePicker({
							suggestedName: fileName,
							types: [{
							description: 'NDJSON File',
							accept: { 'application/x-ndjson': ['.ndjson'] }
							}]
						});
					}
					const writable = await fileHandle.createWritable({ keepExistingData: true });
					for (const record of parsedData) {
						await writable.write(JSON.stringify(record) + '\n');
					}
					await writable.close();
					alert('File saved successfully.');
				} catch (err) {
					console.error('Save error:', err);
					alert('Could not save file.');
				}
			}
		// 💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤💾📤
	// save uploaded records END

	// Open existing NDJSON file START
		// 📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂
			export async function openNDjsonFile(){
				// document.getElementById('openButton').addEventListener('click', async () => {
				try {
					if (!window.showOpenFilePicker) {
						alert('This feature requires a supported browser (e.g., Chrome).');
						return;
					}
					const [handle] = await window.showOpenFilePicker({
						types: [{
							description: 'NDJSON File',
							accept: { 'application/x-ndjson': ['.ndjson'] }
						}]
					});
					const file = await handle.getFile();
					const text = await file.text();
					// Optional: parse into objects
						const ndjsonLines = text.trim().split('\n');
						const parsedObjects = ndjsonLines.map(line => JSON.parse(line));
					// document.getElementById('loadedFileContent').style.display="block";
					// document.getElementById('loadedFileContent').textContent = JSON.stringify(parsedObjects, null, 2);
					document.getElementById("accountEmail_atOpenFile").value = parsedObjects[0].accountEmail;
					document.getElementById("portfolioId_atOpenFile").value = parsedObjects[0].portfolioId;
					document.getElementById("portfolioName_atOpenFile").value = parsedObjects[0].portfolioName;
					renderTransactions(parsedObjects,"section2");
					console.log('Loaded records:', parsedObjects);
				} catch (err) {
					console.error('Open error:', err);
					alert('Could not open file.');
				}
			}
		// 📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂📂
	// Open existing NDJSON file END