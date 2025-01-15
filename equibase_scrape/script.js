document.getElementById('fetchDataButton').addEventListener('click', fetchData);
document.getElementById('downloadCSVButton').addEventListener('click', tableToCSV);

async function fetchData() {
  try {
    let totalrows = null;
    document.getElementById('fetchDataButton').disabled = true;
    let scrapeddata = [];
    const pagecount = parseInt(document.getElementById("pagecount").value);
    for(let page = 1; page < pagecount+1; page++){
      await fetch('https://www.equibase.com/Data.cfm/Stats/Horse/Year/Page?year=2025&page='+page+'&sort=EARNINGS&dir=A&list=N&category=A&attribute_total=1024&set=full&race_breed_type=TB')
      .then(response => response.json())
      .then(data => {
        if(!totalrows)
          totalrows = data.total_rows;
        scrapeddata = scrapeddata.concat(data.stats.slice(page === 1 ? 0 : 1));
      })
    }

    populateTable(scrapeddata);
    document.getElementById('fetchDataButton').disabled = false;
    document.getElementById("num_retrieved").textContent = 'Retrieved records: ' + scrapeddata.length;
    document.getElementById("num_total").textContent = 'Total records: ' + totalrows;
  } catch (error) {
    console.error('Error fetching data:', error);
    alert('Error fetching data.');
  }
}

function populateTable(data) {
  const tableHeaders = document.getElementById('tableHeaders');
  const tableBody = document.getElementById('tableBody');

  // Clear existing content
  tableHeaders.innerHTML = '';
  tableBody.innerHTML = '';

  if (data.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="100%">No data available</td></tr>';
    return;
  }

  // Create table headers dynamically based on keys
  //const headers = Object.keys(data[0]);

  // Create table headers statically
  const headers = ['rank', 'winPercentage', 'horseName', 'referenceNumber', 'earnings', 'place', 'sireReferenceNumber', 'starts', 'sireName', 'speedFigure', 'perStart', 'topThreePercentage', 'show', 'win', 'topThree', 'registry']
  headers.forEach(header => {
    const th = document.createElement('th');
    th.textContent = header;
    tableHeaders.appendChild(th);
  });

  // Populate table rows
  data.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(header => {
      const td = document.createElement('td');
      td.textContent = row[header] || ''; // Handle missing keys
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

function tableToCSV() {

  // Variable to store the final csv data
  let csv_data = [];

  // Get each row data
  let rows = document.getElementsByTagName('tr');
  for (let i = 0; i < rows.length; i++) {

      // Get each column data
      let cols = rows[i].querySelectorAll('td,th');

      // Stores each csv row data
      let csvrow = [];
      for (let j = 0; j < cols.length; j++) {

          // Get the text data of each cell
          // of a row and push it to csvrow
          csvrow.push(cols[j].innerHTML);
      }

      // Combine each column value with comma
      csv_data.push(csvrow.join(","));
  }

  // Combine each row data with new line character
  csv_data = csv_data.join('\n');

  // Call this function to download csv file  
  downloadCSVFile(csv_data);

}

function downloadCSVFile(csv_data) {

  // Create CSV file object and feed
  // our csv_data into it
  CSVFile = new Blob([csv_data], {
      type: "text/csv"
  });

  // Create to temporary link to initiate
  // download process
  let temp_link = document.createElement('a');

  // Download csv file
  temp_link.download = "equibase_export.csv";
  let url = window.URL.createObjectURL(CSVFile);
  temp_link.href = url;

  // This link should not be displayed
  temp_link.style.display = "none";
  document.body.appendChild(temp_link);

  // Automatically click the link to
  // trigger download
  temp_link.click();
  document.body.removeChild(temp_link);
}