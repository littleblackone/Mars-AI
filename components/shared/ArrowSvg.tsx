import * as React from "react";
const ArrowSvg = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={15}
    height={15}
    fill="none"
    className={`scale-125 ${
      !props.open && "rotate-0 transition-all duration-700"
    } ${props.open && "rotate-180 transition-all duration-700"}`}
    {...props}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M6.158 3.135a.5.5 0 0 1 .707.023l3.75 4a.5.5 0 0 1 0 .684l-3.75 4a.5.5 0 1 1-.73-.684L9.566 7.5l-3.43-3.658a.5.5 0 0 1 .023-.707Z"
      clipRule="evenodd"
    />
  </svg>
);
export default ArrowSvg;
