import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

function BlueGem2(props: SvgProps) {
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
                d="M256 0L34.297 128v256L256 512l221.703-128V128z"
                fill="#82d2ff"
                data-original="#82d2ff"
            />
            <Path d="M256 256V0L34.297 128z" fill="#08b7fc" data-original="#08b7fc" />
            <Path
                d="M34.297 128v256L256 256z"
                fill="#006dff"
                data-original="#006dff"
            />
            <Path
                d="M477.703 128L256 256l221.703 128z"
                fill="#08b7fc"
                data-original="#08b7fc"
            />
            <Path
                d="M256 256L34.297 384 256 512z"
                fill="#0050c0"
                data-original="#0050c0"
            />
            <Path
                d="M256 512l221.703-128L256 256z"
                fill="#006dff"
                data-original="#006dff"
            />
            <Path
                d="M381.121 328.238V183.762L256 111.523l-125.121 72.239v144.476L256 400.477z"
                fill="#82d2ff"
                data-original="#82d2ff"
            />
            <Path
                d="M381.121 328.238V183.762L256 111.523v288.954z"
                fill="#55cbff"
                data-original="#55cbff"
            />
        </Svg>
    )
}

export default BlueGem2
