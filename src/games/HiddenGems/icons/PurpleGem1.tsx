import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

function PurpleGem1(props: SvgProps) {
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
                fill="#b58dff"
                d="M129.67 30.05l41 72.645-41 72.645-62.272 32.006L0 175.34z"
                data-original="#b58dff"
            />
            <Path
                fill="#8a73ff"
                d="M512 175.34l-85.33 48.006-44.34-48.006-52.629-66.09 52.629-79.2z"
                data-original="#8a73ff"
            />
            <Path
                fill="#cb99ff"
                d="M256 30.05l42.665 72.645L256 175.34l-44.741 47.491-81.589-47.491V30.05z"
                data-original="#cb99ff"
            />
            <Path
                fill="#b58dff"
                d="M382.33 30.05v145.29l-78.023 43.76L256 175.34V30.05z"
                data-original="#b58dff"
            />
            <Path
                fill="#eabfff"
                d="M256 175.34l48.307 87.214L256 481.95 134.795 288.417 129.67 175.34z"
                data-original="#eabfff"
            />
            <Path
                fill="#b58dff"
                d="M512 175.34L256 481.95l48.307-219.396 78.023-87.214z"
                data-original="#b58dff"
            />
            <Path
                d="M382.33 175.34L256 481.95V175.34zM256 481.95L0 175.34h129.67z"
                data-original="#cb99ff"
                fill="#cb99ff"
            />
        </Svg>
    )
}

export default PurpleGem1
