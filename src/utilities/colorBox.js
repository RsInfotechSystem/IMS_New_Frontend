import React from "react";

const colors = [
  { name: "Light Blue", colorCode: "#d3d3d3", status: "Assigned" },
  { name: "Light Green", colorCode: "#d8f5d4", status: "Returned" },
  { name: "Light Coral", colorCode: "#ffe0b2", status: "Accept" },
  { name: "Light Pink", colorCode: "#add8e6", status: "Edited" },
  //   { name: "Light Yellow", colorCode: "#FFFFE0" },
  //   { name: "Light Cyan", colorCode: "#E0FFFF" },
  //   { name: "Light Grey", colorCode: "#D3D3D3" },
  //   { name: "Light Salmon", colorCode: "#FFA07A" },
  //   { name: "Light Goldenrod", colorCode: "#FAFAD2" },
  //   { name: "Lavender", colorCode: "#E6E6FA" },
];

const ColorBox = () => {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", justifyContent: "end" }}>
      {colors.map((color, index) => (
        <div
          key={index}
          style={{
            textAlign: "center",
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "15px",
              height: "10px",
              backgroundColor: color.colorCode,
              borderRadius: "5px",
              border: "1px solid #ccc",
              marginBottom: "5px",
            }}
          ></div>
          <span style={{ fontSize: "12px" }}>{color.status}</span>
        </div>
      ))}
    </div>
  );
};

export default ColorBox;
