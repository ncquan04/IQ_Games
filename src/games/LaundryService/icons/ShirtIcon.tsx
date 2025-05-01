import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

function ShirtIcon(props: SvgProps) {
    return (
        <Svg
            // xmlns="http://www.w3.org/2000/svg"
            width={512}
            height={512}
            viewBox="0 0 409.6 409.6"
            // enableBackground="new 0 0 512 512"
            {...props}
        >
            <Path
                d="M348.401 58.266C335.135 45 310.835 34.135 294.4 34.135h-29.865c0 32.998-26.737 59.73-59.735 59.73s-59.735-26.732-59.735-59.73H115.2c-16.435 0-40.735 10.865-54.001 24.131L0 119.465l68.265 68.27 17.07-17.07v204.8h238.93v-204.8l17.07 17.07 68.265-68.27-61.199-61.199z"
                data-original="#000000"
            />
        </Svg>
    )
}

export default ShirtIcon
