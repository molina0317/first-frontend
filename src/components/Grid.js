import React, { useEffect, useRef, useState } from "react";
import Handsontable from "handsontable";
import "handsontable/dist/handsontable.full.min.css";
import * as XLSX from "xlsx";
import axios from "axios";

const Grid = () => {
    const hotRef = useRef(null);
    const [gridData, setGridData] = useState([]);
    const [mergedCells, setMergedCells] = useState([]);
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchGridData();
    }, []);

    const fetchGridData = async () => {
        if (!token) {
            console.error("No token found! Please log in.");
            return;
        }

        try {
            const res = await axios.get("http://localhost:5000/api/grid/grid", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.data.data) {
                setGridData(res.data.data);
                setMergedCells(res.data.mergedCells || []);
                initializeGrid(res.data.data, res.data.mergedCells || []);
            }
        } catch (error) {
            console.error("Error fetching grid data", error.response?.data || error);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.error("No file selected!");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });

            const firstSheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[firstSheetName];

            const sheetData = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
            const formattedData = formatExcelData(sheetData, sheet);
            const mergedCellsData = extractMergedCells(sheet);

            try {
                await axios.post(
                    "http://localhost:5000/api/grid/upload",
                    { data: formattedData, mergedCells: mergedCellsData },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log("Excel data uploaded successfully!");
                fetchGridData();
            } catch (error) {
                console.error("Error uploading Excel data", error.response?.data || error);
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const formatExcelData = (sheetData) => {
        return sheetData.map((row) => row.map((cell) => (cell ? cell : "")));
    };

    const extractMergedCells = (sheet) => {
        if (!sheet["!merges"]) return [];
        return sheet["!merges"].map(({ s, e }) => ({
            row: s.r,
            col: s.c,
            rowspan: e.r - s.r + 1,
            colspan: e.c - s.c + 1,
        }));
    };

    const initializeGrid = (data, merges) => {
      if (hotRef.current) {
          hotRef.current.destroy();
          hotRef.current = null;
      }
  
      hotRef.current = new Handsontable(document.getElementById("grid"), {
          data,
          colHeaders: true,
          rowHeaders: true,
          contextMenu: true,
          mergeCells: merges || [],
          licenseKey: "non-commercial-and-evaluation",
          height: "90vh", // ✅ Large grid height
          width: "100%",
          stretchH: "all",
          rowHeights: 50,  // ✅ Bigger row height for visibility
          colWidths: 150,  // ✅ Wider columns
  
          // ✅ Apply center alignment for numbers
          cells: (row, col) => {
              return { className: "htCenter htMiddle" }; // ✅ Center both horizontally & vertically
          },
  
          afterChange: (changes, source) => {
              if (hotRef.current && changes && source !== "loadData") {
                  saveGridData();
              }
          },
      });
    };
  

    const saveGridData = async () => {
        if (!hotRef.current) {
            console.warn("Handsontable instance is destroyed. Skipping save.");
            return;
        }

        const updatedData = hotRef.current.getData();
        let updatedMergedCells = [];
        if (hotRef.current.getPlugin("mergeCells")) {
            updatedMergedCells = hotRef.current.getPlugin("mergeCells").mergedCellsCollection.mergedCells;
        }

        if (!token) {
            console.error("No token found! Please log in.");
            return;
        }

        try {
            await axios.post(
                "http://localhost:5000/api/grid/update",
                { data: updatedData, mergedCells: updatedMergedCells },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log("Grid data and merged cells updated successfully!");
        } catch (error) {
            console.error("Error updating grid", error.response?.data || error);
        }
    };

    return (
        <div>
            {/* <div className="flex justify-between items-center bg-blue-600 text-white p-4 rounded-md">
                <label htmlFor="fileInput" className="cursor-pointer bg-blue-500 px-4 py-2 rounded-lg">
                    📄 Choose Excel File
                </label>
                <input type="file" id="fileInput" accept=".xlsx" className="hidden" onChange={handleFileUpload} />
            </div> */}
            <div id="grid" className="mt-4 border border-gray-300 shadow-lg rounded-md"></div>
        </div>
    );
};

export default Grid;