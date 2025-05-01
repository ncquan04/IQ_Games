import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

function DressIcon(props: SvgProps) {
    return (
        <Svg
            // xmlns="http://www.w3.org/2000/svg"
            width={512}
            height={512}
            viewBox="0 0 38 58"
            // enableBackground="new 0 0 512 512"
            {...props}
        >
            <Path
                d="M1 25.79V17a1 1 0 011-1h34a1 1 0 011 1v8.79A4.15 4.15 0 0133.41 30a4 4 0 01-3.61-1.6 1 1 0 00-1.8.6 4 4 0 11-8 0 1 1 0 00-2 0 4 4 0 11-8 0 1 1 0 00-1.8-.6A4 4 0 014.59 30 4.15 4.15 0 011 25.79zm-.78 28.7A80.09 80.09 0 004.07 31.9c.11 0 .21.06.32.07a6 6 0 003.95-1A6 6 0 0019 32.31 6 6 0 0029.66 31a6 6 0 004 1c.11 0 .21 0 .32-.07a80.09 80.09 0 003.85 22.59c-10.12 4.63-27.46 4.66-37.61-.03zM9 14c0-.17 0-4.34-2.06-12.49a2.003 2.003 0 00-3.88 1A55.72 55.72 0 015 14zm24 0a56.31 56.31 0 011.94-11.51 2.003 2.003 0 10-3.88-1C29 9.66 29 13.83 29 14z"
                data-original="#000000"
            />
        </Svg>
    )
}

export default DressIcon
