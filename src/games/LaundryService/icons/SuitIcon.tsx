import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

function SuitIcon(props: SvgProps) {
  return (
    <Svg
    //   xmlns="http://www.w3.org/2000/svg"
      width={512}
      height={512}
      viewBox="0 0 48 48"
    //   enableBackground="new 0 0 512 512"
      {...props}
    >
      <Path
        d="M24 10l-9-9-3 5 6 10zm12-4l-3-5-9 9 6 6zm-12 6.828l-2.952 2.952L22 18l-3 18 5 5 5-5-3-18 .952-2.22zm0-5.656L25.172 6l5-5H17.828l5 5z"
        data-original="#000000"
      />
      <Path
        d="M38.165 6.008a.998.998 0 01-.142.506l-6.967 11.613a1 1 0 01-1.564.193l-1.018-1.017-.405.946 3.073 18.438L24 43.827l-7.142-7.142 3.073-18.437-.405-.946-1.018 1.017a1 1 0 01-1.564-.193L9.977 6.514a.998.998 0 01-.142-.506A9.006 9.006 0 001 15v29a3.003 3.003 0 003 3h40a3.003 3.003 0 003-3V15a9.006 9.006 0 00-8.835-8.992z"
        data-original="#000000"
      />
    </Svg>
  )
}

export default SuitIcon
