import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

function BackspaceIcon(props: SvgProps) {
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
                d="M26.95 6.41H10.58a3.033 3.033 0 00-2.33 1.08l-5.53 6.54a3.055 3.055 0 000 3.94l5.53 6.54a3.033 3.033 0 002.33 1.08h16.37A3.056 3.056 0 0030 22.54V9.46a3.056 3.056 0 00-3.05-3.05zm-4.66 12.15a1.008 1.008 0 010 1.42 1.024 1.024 0 01-.71.29 1.042 1.042 0 01-.71-.29l-2.56-2.56-2.56 2.56a1 1 0 11-1.41-1.42L16.9 16l-2.56-2.56a1.008 1.008 0 010-1.42.996.996 0 011.41 0l2.56 2.56 2.56-2.56a1.004 1.004 0 111.42 1.42L19.73 16z"
                data-original="#000000"
            />
        </Svg>
    )
}

export default BackspaceIcon
