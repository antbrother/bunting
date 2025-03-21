import { useState, useEffect } from "react";
import SpringBootServer from "./Server";
import * as XLSX from "xlsx";
import { Container, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { format } from 'date-fns';
import './DataUpload.css';

function dateAdd(date, interval, units) {
  const newDate = new Date(date);

  switch (interval) {
    case 'days':
      newDate.setDate(newDate.getDate() + units);
      break;
    case 'months':
      newDate.setMonth(newDate.getMonth() + units);
      break;
    case 'years':
      newDate.setFullYear(newDate.getFullYear() + units);
      break;
    default:
      throw new Error('Invalid interval');
  }

  return newDate;
}

const startDay = new Date("1900-01-01");

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


const formatDatetime = (dateString) => {
    if (!dateString) {
      return "N/A";
    }
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
};


function DataUpload({loginId}) {
  const [data, setData] = useState([]);
  const [fileType, setFileType] = useState([]);
  const [fileKey, setFileKey] = useState(Date.now()); // Use a key to force re-render
  const [isDisabled, setIsDisabled] = useState(false);
  const [conflictEquipments, setConflictEquipments] = useState(undefined);
  const [conflictBuntings, setConflictBuntings] = useState(undefined);
  

  useEffect(() => {
    // This useEffect now only resets the fileKey when the data is updated.
    if (data.length === 0) {
      setFileKey(Date.now()); // Update key to force re-render
    }
  }, [data]); // Removed fileKey from dependency array

  
  const handleFileUpload = (e) => {
    // Clear the state and force re-render
    setData([]);
    setFileKey(Date.now());
    setFileType("");
    setConflictEquipments(undefined);
    setConflictBuntings(undefined);
    
    const reader = new FileReader();
    reader.readAsArrayBuffer(e.target.files[0]);
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
  
      // Check the upload excel file
      const valueOfA1 = sheet["A1"] ? sheet["A1"].v : null;
      const valueOfB1 = sheet["B1"] ? sheet["B1"].v : null;
      const valueOfC1 = sheet["C1"] ? sheet["C1"].v : null;
      const valueOfD1 = sheet["D1"] ? sheet["D1"].v : null;
      const valueOfE1 = sheet["E1"] ? sheet["E1"].v : null;
      const valueOfF1 = sheet["F1"] ? sheet["F1"].v : null;
      const valueOfG1 = sheet["G1"] ? sheet["G1"].v : null;

      const valueOfA2 = sheet["A2"] ? sheet["A2"].v : null;
      const valueOfB2 = sheet["B2"] ? sheet["B2"].v : null;
      const valueOfC2 = sheet["C2"] ? sheet["C2"].v : null;
      const valueOfD2 = sheet["D2"] ? sheet["D2"].v : null;
      const valueOfE2 = sheet["E2"] ? sheet["E2"].v : null;
      const valueOfF2 = sheet["F2"] ? sheet["F2"].v : null;
      const valueOfG2 = sheet["G2"] ? sheet["G2"].v : null;
      const valueOfH2 = sheet["H2"] ? sheet["H2"].v : null;


      let parsedDataList = [];
      let isValidFile = false;

  
      if (valueOfA2 === "Lamppost No." && valueOfB2 === "Department" && valueOfC2 === "Event" && valueOfD2 === "Application Date" && valueOfE2 === "Installation Date" && valueOfF2 === "Removal Date" && valueOfG2 === "Registration Date" && valueOfH2 === "Remarks") {
        setFileType("bunting"); // the upload excel is bunting data
        isValidFile = true;
        // Read the second row as headers
        const secondRow = XLSX.utils.sheet_to_json(sheet, { header: 1, range: 1, blankrows: false })[0];
        const headers = secondRow.map(cell => (cell ? cell : ""));

        // Skip the first row and use the second row as headers
        parsedDataList = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
          cellDates: true,
          dateNF: 'yyyy-mm-dd',
          header: headers, // Use the manually read headers
          range: 2 // Skip the first row and the header row
        });
      } else if (valueOfA1 === "Lamppost No." && valueOfB1 === "Department" && valueOfC1 === "Device Type" && valueOfD1 === "Installation Date" && valueOfE1 === "Removal Date" && valueOfF1 === "Power Supply" && valueOfG1 === "Remarks") {
        setFileType("equipment"); // the upload excel is equipment data
        isValidFile = true;
        // If the first cell is not empty, use the first row as headers
        parsedDataList = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
          cellDates: true,
          dateNF: 'yyyy-mm-dd'
        });
      } else {
        alert("Invalid Excel file");
        let emptyList = [];
        setData(emptyList);
        isValidFile = false;
      }


      if (isValidFile) {
        // Process parsedDataList to handle multiple Lamppost No. values
        let expandedDataList = [];
        parsedDataList.forEach(parsedData => {
          const lamppostNos = parsedData["Lamppost No."].split(",").map(lamppost => lamppost.trim());
          lamppostNos.forEach(lamppostNo => {
            const newEntry = { ...parsedData, "Lamppost No.": lamppostNo };
            expandedDataList.push(newEntry);
          });
        });
    
        // Optimize data transformation
        expandedDataList = expandedDataList.map(parsedData => {
          // add Login ID 
          const auditData = {"Created By": loginId, "Updated By": loginId};
          const newParsedData = { ...parsedData, ...auditData };
          //console.log(parsedData);
          //console.log(newParsedData);

          Object.keys(newParsedData).forEach(key => {
            if (key.includes("Date") && newParsedData[key]) {
              const parsedDate = formatDate(dateAdd(startDay, "days", newParsedData[key] - 2));
              newParsedData[key] = (parsedDate === "1899-12-30") ? "" : parsedDate;
            }
            if (key === "Power Supply" && newParsedData[key]) {
              newParsedData[key] = newParsedData[key].charAt(0).toUpperCase();
            }
          });
          return newParsedData;
        });
    
        reader.onerror = (e) => {
          if (expandedDataList !== null) {
            expandedDataList.length = 0;
          }
        };
    
        setData(expandedDataList);
        setIsDisabled(false);
      }
    }
  }


  const handleSave = async () => {
    // Log the data state before sending the request
    console.log("Data being sent:", data);
    try {
      let url = "";

      if (fileType === "equipment") {
        //alert("equipment");
        url = SpringBootServer + "/api/equipments/batch";
        //url = "/api/equipments/batch";
      } else if (fileType === "bunting") {
        //alert("bunting");
        url = SpringBootServer + "/api/buntings/batch";
        //url = "/api/buntings/batch";
      } else {
        throw new Error("Invalid excel file uploaded!");
      }
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      console.log(result);
      if (response.status === 409) {
        alert("Data conflict occured");

        // Set state for conflictEquipments and conflictBuntings
        setConflictEquipments(result.conflictEquipments || undefined);
        setConflictBuntings(result.conflictBuntings || undefined);        
      } else if (response.ok) {
        console.log("Data saved successfully:", result);
        alert("Data saved successfully!");
        setIsDisabled(true);
      } else if (response.status === 422) {
        console.log(result);
        if (!result.validLamppostNo) {
          alert("Invalid Lamppost No. find, please check the excel file");
        } else if (!result.validDateRange) {
          alert("Invalid Installation Date and Removal Date find, please check excel file");
        } else {
          alert("Invalid field value find in excel file");
        }
      } 
    } catch (error) {
      console.error("Failed to save data:", error);
      alert("Failed to save data.");
    }
  }

  return (
    <Container className="DataUpload">
      <Typography variant="h4" component="h1" gutterBottom>
        Equipment and Bunting Data Upload
      </Typography>

      <input
        key={fileKey}
        type="file"
        accept=".xlsm"
        style={{ display: 'none' }}
        id="file-input"
        onChange={handleFileUpload}
      />
      <label htmlFor="file-input">
        <Button variant="contained" component="span" color="primary">
          Choose File
        </Button>
      </label>

      {data.length > 0 && (
        <TableContainer component={Paper}>
          <Table className="table">
            <TableHead>
              <TableRow>
                {Object.keys(data[0]).filter(key => key !== 'Created By' && key !== 'Updated By').map((key) => (
                  <TableCell key={key}>{key}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Object.keys(row).filter(key => key !== 'Created By' && key !== 'Updated By').map((key) => (
                    <TableCell key={key}>{row[key]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}


      <br /><br />
      {data.length > 0 && (
        <Button variant="contained" color="primary" onClick={handleSave} disabled={isDisabled}>
          Submit
        </Button>
      )}

      {/* Render conflictEquipments table */}
      {conflictEquipments !== undefined && (
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
          <Typography variant="h6">Conflict Equipments</Typography>
          <Table>
            <TableHead>
              <TableRow>
                {Object.keys(conflictEquipments[0] || {})
                  .filter(key => key !== 'equipmentId') // Exclude equipmentId
                  .map((key) => (
                    <TableCell key={key}>{key}</TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {conflictEquipments.length > 0 ? (
                conflictEquipments.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Object.keys(row)
                      .filter(key => key !== 'equipmentId') // Exclude equipmentId
                      .map((key) => (
                        <TableCell key={key}>
                          {key === "Create Datetime" ? formatDatetime(row[key]) : row[key]}
                        </TableCell>
                      ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={Object.keys(conflictEquipments[0] || {}).length - 1} align="center">Nil</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Render conflictBuntings table */}
      {conflictBuntings !== undefined && (
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
          <Typography variant="h6">Conflict Buntings</Typography>
          <Table>
            <TableHead>
              <TableRow>
                {Object.keys(conflictBuntings[0] || {})
                  .filter(key => key !== 'buntingId') // Exclude buntingId
                  .map((key) => (
                    <TableCell key={key}>{key}</TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {conflictBuntings.length > 0 ? (
                conflictBuntings.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Object.keys(row)
                      .filter(key => key !== 'buntingId') // Exclude buntingId
                      .map((key) => (
                        <TableCell key={key}>
                          {key === "Create Datetime" ? formatDatetime(row[key]) : row[key]}
                        </TableCell>
                      ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={Object.keys(conflictBuntings[0] || {}).length - 1} align="center">Nil</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}

export default DataUpload;
