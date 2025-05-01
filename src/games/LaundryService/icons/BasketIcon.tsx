import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

function BasketIcon(props: SvgProps) {
    return (
        <Svg
            // xmlns="http://www.w3.org/2000/svg"
            width={512}
            height={512}
            viewBox="0 0 24 24"
            fillRule="evenodd"
            // enableBackground="new 0 0 512 512"
            {...props}
        >
            <Path
                d="M18.643 8.614l-3-5a.75.75 0 00-1.286.772l3 5a.75.75 0 001.286-.772zm-12 .772l3-5a.75.75 0 00-1.286-.772l-3 5a.75.75 0 001.286.772z"
                data-original="#000000"
            />
            <Path
                d="M21.74 9.121A.75.75 0 0021 8.25H3a.75.75 0 00-.74.871l1.525 9.323a2.75 2.75 0 002.714 2.306h11.002a2.75 2.75 0 002.714-2.306zM11.25 12.5v4a.75.75 0 001.5 0v-4a.75.75 0 00-1.5 0zm4 0v4a.75.75 0 001.5 0v-4a.75.75 0 00-1.5 0zm-8 0v4a.75.75 0 001.5 0v-4a.75.75 0 00-1.5 0z"
                data-original="#000000"
            />
            <Path
                d="M22 8.25H2a.75.75 0 000 1.5h20a.75.75 0 000-1.5z"
                data-original="#000000"
            />
        </Svg>
    )
}

export default BasketIcon
