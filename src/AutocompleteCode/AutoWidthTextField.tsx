import { TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";

export default function AutoWidthTextField({ value = "", style, ...props }: any) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [width, setWidth] = useState<string>("36px");

  // Replace spaces with middle dots for measurement
  const displayValue = (
    (value || "").length > (props.placeholder || "").length ? (value || "") : (props.placeholder || "")
  ).replace(/ /g, "·");
  // const displayValue = (value || "").replace(/ /g, "·");

  useEffect(() => {
    console.log(displayValue);
    if (spanRef.current) {
      const newWidth = spanRef.current.clientWidth + 30;
      setWidth(`${Math.max(newWidth, 36)}px`);
    }
  }, [displayValue]);

  return (
    <>
      <TextField {...props} value={value} style={{ ...style, width, minWidth: 36 }} />
      <Typography
        component="span"
        ref={spanRef}
        style={{
          whiteSpace: "nowrap",
          visibility: "hidden",
          position: "absolute",
          font: "inherit",
        }}
      >
        {displayValue}
      </Typography>
    </>
  );
}
