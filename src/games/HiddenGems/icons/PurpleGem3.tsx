import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

function PurpleGem3(props: SvgProps) {
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
                fill="#b9f"
                d="M256 137.68l43.253 124.344L256 374.32l-83.159-34.226L137.68 256l36.279-104.982z"
                data-original="#bb99ff"
            />
            <Path
                fill="#b366ff"
                d="M374.32 256l-23.206 85.771L256 374.32V137.68l80.025 16.317zM256 0l39.944 85.55L256 137.68 137.68 256l-36.208 42.255L0 256c0-3.84 1.46-7.68 4.39-10.61l241-241C248.32 1.46 252.16 0 256 0z"
                data-original="#b366ff"
            />
            <Path
                fill="#93f"
                d="M256 374.32l37.102 37.184L256 512c-3.84 0-7.68-1.46-10.61-4.39l-241-241A14.953 14.953 0 010 256h137.68zM512 256l-89.466 46.037L374.32 256 256 137.68V0c3.84 0 7.68 1.46 10.61 4.39l241 241c2.93 2.93 4.39 6.77 4.39 10.61z"
                data-original="#9933ff"
            />
            <Path
                fill="#7a29cc"
                d="M512 256c0 3.84-1.46 7.68-4.39 10.61l-241 241A14.953 14.953 0 01256 512V374.32L374.32 256z"
                data-original="#7a29cc"
            />
        </Svg>
    )
}

export default PurpleGem3
