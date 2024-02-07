import * as React from "react";
const UpscaleSvg = (
  props: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>
) => (
  <svg
    width={24}
    height={24}
    fill="none"
    className="text-primary-600"
    {...props}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.25}
      d="M9.3 10.202a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.25}
      d="M12.9 3H9.3C4.8 3 3 4.8 3 9.3v5.4C3 19.2 4.8 21 9.3 21h5.4c4.5 0 6.3-1.8 6.3-6.3v-4.5"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.25}
      d="M18.18 7.88v-5.4l1.8 1.8m-1.797-1.8-1.8 1.8M3.602 18.257l4.437-2.979c.71-.477 1.737-.423 2.376.126l.297.261c.702.603 1.836.603 2.538 0l3.744-3.213c.702-.603 1.836-.603 2.538 0l1.467 1.26"
    />
  </svg>
);
export default UpscaleSvg;
