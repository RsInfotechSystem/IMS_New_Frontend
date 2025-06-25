const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        // Only show the one segment being hovered (the one with a value and color)
        const hovered = payload.find((item) => {
            return item.payload && item.value !== 0 && item.dataKey;
        });

        if (!hovered) return null;

        const engineerName = label;
        const stockStatus = hovered.dataKey;
        const quantity = hovered.value;

        return (
            <div
                style={{
                    backgroundColor: "#fff",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    padding: "10px",
                }}
            >
                <p style={{ margin: 0, fontWeight: 600 }}>{engineerName}</p>
                <p style={{ margin: 0 }}>{stockStatus}: {quantity}</p>
            </div>
        );
    }

    return null;
};

export default CustomTooltip;

