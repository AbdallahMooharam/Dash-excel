document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('fileInput').addEventListener('change', handleFileUpload);
    document.getElementById('saveChanges').addEventListener('click', saveChanges);
    document.getElementById('downloadFile').addEventListener('click', downloadFile); // إضافة مستمع الحدث للزر
  });
  
  let globalData = []; // لتخزين البيانات المعدلة
  
  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        globalData = XLSX.utils.sheet_to_json(sheet);
        displayData(globalData);
      };
      reader.readAsBinaryString(file);
    }
  }
  
  function displayData(data) {
    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');
  
    if (data.length === 0) return;
  
    const headers = Object.keys(data[0]);
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';
  
    // Create table header
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      tableHeader.appendChild(th);
    });
  
    // Create table rows
    data.forEach((row, rowIndex) => {
      const tr = document.createElement('tr');
      headers.forEach(header => {
        const td = document.createElement('td');
        td.contentEditable = true; // جعل الخلايا قابلة للتعديل
        td.textContent = row[header];
        td.addEventListener('blur', () => updateData(rowIndex, header, td.textContent));
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  }
  
  function updateData(rowIndex, header, newValue) {
    globalData[rowIndex][header] = newValue; // تحديث البيانات في الذاكرة
  }
  
  function saveChanges() {
    // هنا يمكنك إضافة الكود لإرسال البيانات المعدلة إلى الخادم أو حفظها محلياً
    console.log('Updated Data:', globalData);
    alert('Changes saved! Check the console.');
  }
  
  function downloadFile() {
    const ws = XLSX.utils.json_to_sheet(globalData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
  
    function s2ab(s) {
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
      return buf;
    }
  
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'modified_data.xlsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  