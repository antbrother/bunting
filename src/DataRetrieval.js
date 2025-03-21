import React, { useState } from 'react';
import { Box, Button, TextField, MenuItem, Select, InputLabel, FormControl, Typography, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { Checkbox, FormControlLabel } from '@mui/material'
import './DataRetrieval.css'; // Optional: Include your CSS styles if needed
import SpringBootServer from './Server';

const DataRetrieval = () => {
  const [type, setType] = useState('');
  const [criteria, setCriteria] = useState('');
  const [inputData, setInputData] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [criteriaOptions, setCriteriaOptions] = useState([]);
  const [resultData, setResultData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [exactMatch, setExactMatch] = useState(false);
  const isDeleteEnabled = selectedRows.length > 0;
  
  
  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setType(selectedType);
    setCriteria('');
    setInputData('');
    setFromDate(null);
    setToDate(null);
    setResultData([]);

  
    if (selectedType === 'equipment') {
      setCriteriaOptions([
        'Lamppost No.',
        'Department',
        'Device Type',
        'Installation Date',
        'Removal Date',
        'Power Supply',
        'Create Datetime',
        'Created By',
      ]);
    } else if (selectedType === 'bunting') {
      setCriteriaOptions([
        'Lamppost No.',
        'Department',
        'Event',
        'Application Date',
        'Installation Date',
        'Removal Date',
        'Registration Date',
        'Create Datetime',
        'Created By',
      ]);
    }
  };

  const handleCriteriaChange = (e) => {
    setCriteria(e.target.value);
    setInputData('');
    setFromDate(null);
    setToDate(null);

  };

  const handleInputChange = (e) => {
    setInputData(e.target.value);

  };

  const handleFromDateChange = (newValue) => {
    setFromDate(newValue);

  };

  const handleToDateChange = (newValue) => {
    setToDate(newValue);

  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    // Construct the data payload
    const payload = {
      type,
      criteria,
      inputData,
      fromDate,
      toDate,
      exactMatch
    };

    console.log(type);
    console.log(criteria);
    console.log(inputData);
    console.log(fromDate);
    console.log(toDate);
    console.log(exactMatch);


    let url = "";

    // Send the data to the backend endpoint
    if (type === "equipment") {
        url = SpringBootServer + "/api/equipments/data-retrieval";
        //url = "/api/equipments/data-retrieval";
    } else {
        url = SpringBootServer + "/api/buntings/data-retrieval";
        //url = "/api/buntings/data-retrieval";
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      console.log("ok");
      const result = await response.json();
      console.log(result);
      setResultData(result); // Store the result in state
    } else {
      alert('Failed to retrieve data');
    }
  };


  const handleDelete = async () => {
    // Check if there are any selected rows
    if (selectedRows.length === 0) {
      return; // No rows selected, exit the function
    }

    const idsParam = selectedRows.join(","); // Convert array to comma-separated string
    console.log(idsParam);

    let url = "";
    if (type === "equipment") {
        url = SpringBootServer + "/api/equipments/delete?ids=" + idsParam ;
        //url = "/api/equipments/delete?ids=" + idsParam ;
    } else {
        url = SpringBootServer + "/api/buntings/delete?ids=" + idsParam;
        //url = "/api/buntings/delete?ids=" + idsParam;
    }
  
    try {
      // Send a DELETE request to the backend with the selected IDs
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },        
      });
      
      console.log(response);
      // Check if the response is okay
      if (!response.status === 204) {
        throw new Error('Network response was not ok');
      }
      // Handle success (e.g., show a success message)
      alert('Delete successful');
      
      // Clear the selected rows after deletion
      setSelectedRows([]);
  
      // Create a synthetic event and call handleSubmit
      handleSubmit({ preventDefault: () => {} }); // Passing an empty function to prevent default
  
    } catch (error) {
      // Handle errors (e.g., show an error message)
      console.error('Error deleting data:', error);
    }
  };


  const isDateCriteria = criteria.includes('Date');

  const handleRowSelect = (rowId) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(rowId)) {
        return prevSelectedRows.filter((id) => id !== rowId);
      } else {
        return [...prevSelectedRows, rowId];
      }
    });
  };
  
  const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A";
    }
    return format(new Date(dateString), 'yyyy-MM-dd');
  };

  const formatDatetime = (dateString) => {
    if (!dateString) {
      return "N/A";
    }
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };



  const renderBuntingTable = () => {
    return (
      <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
        <TableContainer component={Paper} sx={{ width: '100%', maxWidth: '100%' }}>
          <Table sx={{ tableLayout: 'auto' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ minWidth: 50 }}>
                  <Checkbox
                    checked={selectedRows.length === resultData.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(resultData.map((row) => row.buntingId));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ minWidth: 100 }}>Lamppost No.</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Department</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Event</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Application Date</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Installation Date</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Removal Date</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Registration Date</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Remarks</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Create Datetime</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Created By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resultData.map((row) => (
                <TableRow key={row.buntingId}>
                  <TableCell sx={{ minWidth: 50 }}>
                    <Checkbox
                      checked={selectedRows.includes(row.buntingId)}
                      onChange={() => handleRowSelect(row.buntingId)}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 100 }}>{row["Lamppost No."]}</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>{row["Department"]}</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>{row["Event"]}</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>{formatDate(row["Application Date"])}</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>{formatDate(row["Installation Date"])}</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>{formatDate(row["Removal Date"])}</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>{formatDate(row["Registration Date"])}</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>{row["Remarks"]}</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>{formatDatetime(row["Create Datetime"])}</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>{row["Created By"]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };
  
  
  const renderEquipmentTable = () => {
    return (
      <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
        <TableContainer component={Paper} sx={{ width: '100%', maxWidth: '100%' }}>
          <Table sx={{ tableLayout: 'auto' }}>
            <TableHead>
              <TableRow>
              <TableCell sx={{ minWidth: 50 }}>
                  <Checkbox
                    checked={selectedRows.length === resultData.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRows(resultData.map((row) => row.equipmentId));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                  />
                </TableCell>  
                <TableCell sx={{ minWidth: 100 }}>Lamppost No.</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Department</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Device Type</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Installation Date</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Removal Date</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Power Supply</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Remarks</TableCell>
                <TableCell sx={{ minWidth: 120 }}>Create Datetime</TableCell>
                <TableCell sx={{ minWidth: 100 }}>Created By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {resultData.map((row) => (
                <TableRow key={row.equipmentId}>
                  <TableCell sx={{ minWidth: 50 }}>
                    <Checkbox
                      checked={selectedRows.includes(row.equipmentId)}
                      onChange={() => handleRowSelect(row.equipmentId)}
                    />
                  </TableCell>
                  <TableCell sx={{ minWidth: 100 }}>{row["Lamppost No."]}</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>{row["Department"]}</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>{row["Device Type"]}</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>{formatDate(row["Installation Date"])}</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>{formatDate(row["Removal Date"])}</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>{row["Power Supply"]}</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>{row["Remarks"]}</TableCell>
                  <TableCell sx={{ minWidth: 120 }}>{formatDatetime(row["Create Datetime"])}</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>{row["Created By"]}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };
  


  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="sm">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ minWidth: 1000 }}>
            Equipment and Bunting Data Retrieval
          </Typography>
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="type-label">Type</InputLabel>
              <Select
                labelId="type-label"
                id="type"
                value={type}
                onChange={handleTypeChange}
                label="Type"
              >
                <MenuItem value="equipment">Equipment</MenuItem>
                <MenuItem value="bunting">Bunting</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel id="criteria-label">Criteria</InputLabel>
              <Select
                labelId="criteria-label"
                id="criteria"
                value={criteria}
                onChange={handleCriteriaChange}
                label="Criteria"
              >
                {criteriaOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
              <Box display="flex" alignItems="center">
                <TextField
                  fullWidth
                  margin="normal"
                  id="inputData"
                  label="Criteria Data"
                  value={inputData}
                  onChange={handleInputChange}
                  variant="outlined"
                  disabled={isDateCriteria}
                />               
                <FormControlLabel
                    control={
                    <Checkbox
                      checked={exactMatch}
                      onChange={(e) => setExactMatch(e.target.checked)}
                      color="primary"
                      disabled={isDateCriteria}
                    />
                    }
                    label="Exact match"
                    sx={{ ml: 2 }}
                />
              </Box>
            {isDateCriteria && (
              <>
                <DatePicker
                  label="From"
                  value={fromDate}
                  onChange={handleFromDateChange}
                  renderInput={(params) => <TextField fullWidth margin="normal" {...params} />}
                />
                <DatePicker
                  label="To"
                  value={toDate}
                  onChange={handleToDateChange}
                  renderInput={(params) => <TextField fullWidth margin="normal" {...params} />}
                />
              </>
            )}
            <Button type="submit" variant="contained" color="primary">
              Retrieve Data
            </Button>
          </form>
          {resultData.length > 0 && type === "bunting" && (
            <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
              {renderBuntingTable()}
            </Box>
          )}
          {resultData.length > 0 && type === "equipment" && (
            <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
              {renderEquipmentTable()}
            </Box>
          )}
          {resultData.length > 0 && (
            <Button
            variant="contained"
            color="secondary"
            onClick={handleDelete}
            disabled={!isDeleteEnabled}
            sx={{ mt: 4 }}
          >
            Delete selected row(s)
          </Button>
          )}
        </Box>
      </Container>
    </LocalizationProvider>
  );
  
};

export default DataRetrieval;
