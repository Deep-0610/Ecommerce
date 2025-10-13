import React, { useState, useEffect } from 'react';
import { dbAPI } from '../api';
import './DBViewer.css';

const DBViewer = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable]);

  const fetchTables = async () => {
    try {
      const response = await dbAPI.getTables();
      setTables(response.data);
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  const fetchTableData = async (tableName) => {
    setLoading(true);
    try {
      const response = await dbAPI.getTableData(tableName);
      setTableData(response.data);
    } catch (error) {
      console.error('Error fetching table data:', error);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="db-viewer">
      <h1>Database Viewer</h1>

      <div className="table-selector">
        <label htmlFor="table-select">Select Table:</label>
        <select
          id="table-select"
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
        >
          <option value="">Choose a table...</option>
          {tables.map(table => (
            <option key={table} value={table}>{table}</option>
          ))}
        </select>
      </div>

      {selectedTable && (
        <div className="table-container">
          <h2>{selectedTable} Table</h2>
          {loading ? (
            <div className="loading">Loading table data...</div>
          ) : tableData.length === 0 ? (
            <p>No data found in this table.</p>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    {Object.keys(tableData[0]).map(key => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex}>
                          {value === null ? 'NULL' : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DBViewer;
