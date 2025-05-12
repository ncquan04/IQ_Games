import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

function BlueGem3(props: SvgProps) {
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
                fill="#80ffff"
                d="M146.664 406.302L77.377 212.518 256 83.055l178.623 129.463-69.287 193.784z"
                data-original="#80ffff"
            />
            <Path
                fill="#73e7ff"
                d="M365.336 406.302l69.287-193.784L256 83.055v323.247z"
                data-original="#73e7ff"
            />
            <Path
                fill="#4d87ff"
                d="M499.3 176.801v157.8l-93 128.099-63.627-16.786L344.2 376.3l54.6-152.699 47.501-52.12z"
                data-original="#4d87ff"
            />
            <Path
                fill="#73e7ff"
                d="M256 0l30 50.008-30 70.093-142.8 103.5-47.051 8.09-53.449-54.89 93-128.101z"
                data-original="#73e7ff"
            />
            <Path
                fill="#59abff"
                d="M167.8 376.3l-62.1 86.4-93-128.099v-157.8l100.5 46.8z"
                data-original="#59abff"
            />
            <Path
                fill="#73e7ff"
                d="M406.3 462.7L256 512l-150.3-49.3 62.1-86.4h176.4z"
                data-original="#73e7ff"
            />
            <Path
                d="M499.3 176.801l-100.5 46.8-142.8-103.5V0l150.3 48.7zM256 376.3V512l150.3-49.3-62.1-86.4z"
                data-original="#59abff"
                fill="#59abff"
            />
        </Svg>
    )
}

export default BlueGem3
