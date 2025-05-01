import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

function ShortDressIcon(props: SvgProps) {
    return (
        <Svg
            // xmlns="http://www.w3.org/2000/svg"
            width={512}
            height={512}
            viewBox="0 0 64 64"
            // enableBackground="new 0 0 512 512"
            {...props}
        >
            <Path
                d="M19.73 18.38h24.66v3.11H19.73zm33.06 25.8a19.07 19.07 0 00-11.04-4.07 19.065 19.065 0 00-8.42 2.12c-.49.22-.97.43-1.46.63-6.03 2.49-13.11 3.29-21.06 2.4l8.77-22.77h5.48l-.75 6.04a.488.488 0 00.43.55.127.127 0 00.06.01.506.506 0 00.5-.44l.77-6.16h11.25l1.35 6.2a.49.49 0 00.48.4c.04 0 .07-.01.11-.01a.503.503 0 00.38-.6l-1.29-5.99h6.19z"
                data-original="#000000"
            />
        </Svg>
    )
}

export default ShortDressIcon
