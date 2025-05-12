import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

function IncorrectGem(props: SvgProps) {
    return (
        <Svg
            // xmlns="http://www.w3.org/2000/svg"
            width={512}
            height={512}
            viewBox="0 0 512 512"
            // enableBackground="new 0 0 512 512"
            {...props}
        >
            <Path
                d="M496.8 128.2l-44.1-44.1c-23.1-23.1-54.4-36-87-36H146.3c-32.6 0-63.9 12.9-87 36l-44.1 44.1c-18.9 19-20.4 49.2-3.3 69.8L216 445c18.3 22.1 51.1 25.2 73.2 6.9 2.5-2.1 4.8-4.4 6.9-6.9l204-246.9c17-20.7 15.6-50.9-3.3-69.9z"
                data-original="#000000"
            />
        </Svg>
    )
}

export default IncorrectGem
