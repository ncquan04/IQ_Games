import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

function PauseIcon(props: SvgProps) {
    return (
        <Svg
            // xmlns="http://www.w3.org/2000/svg"
            width={512}
            height={512}
            viewBox="0 0 32 32"
            // enableBackground="new 0 0 512 512"
            {...props}
        >
            <Path
                d="M13 5v22a3 3 0 01-3 3H9a3 3 0 01-3-3V5a3 3 0 013-3h1a3 3 0 013 3zm10-3h-1a3 3 0 00-3 3v22a3 3 0 003 3h1a3 3 0 003-3V5a3 3 0 00-3-3z"
                data-name="Layer 30"
                data-original="#000000"
            />
        </Svg>
    )
}

export default PauseIcon
