import React from "react";

// Reusable Saudi Riyal currency symbol component
// Usage: <RiyalSymbol /> replaces $ in all currency displays
const RiyalSymbol = ({ size = "1em" }) => (
	<img
		src="/img/riyal_symbol.png"
		alt="SAR"
		style={{
			height: size,
			width: "auto",
			display: "inline-block",
			verticalAlign: "middle",
			marginRight: "2px",
			filter: "brightness(0) invert(0)", // keep black color
		}}
	/>
);

export default RiyalSymbol;
