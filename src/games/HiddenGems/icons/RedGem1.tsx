import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

function RedGem1(props: SvgProps) {
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
                fill="#ce0045"
                d="M512 174.176L256 468.757 0 174.176l256-35.197z"
                data-original="#ce0045"
            />
            <Path
                fill="#a00031"
                d="M512 174.176L256 468.757V138.979z"
                data-original="#a00031"
            />
            <Path
                fill="#ce0045"
                d="M384.502 108.71l-30.308 65.466L256 115.617l-98.194 58.559L128 108.71V43.245h256z"
                data-original="#ce0045"
            />
            <Path
                fill="#a00031"
                d="M384.502 108.71l-30.308 65.466L256 115.617V43.245h128z"
                data-original="#a00031"
            />
            <Path
                fill="#fe7e52"
                d="M354.194 174.176H157.806L256 43.245z"
                data-original="#fe7e52"
            />
            <Path
                fill="#f53241"
                d="M354.194 174.176H256V43.245z"
                data-original="#f53241"
            />
            <Path
                fill="#fe7e52"
                d="M128 43.243L0 174.172h157.804z"
                data-original="#fe7e52"
            />
            <Path
                fill="#f53241"
                d="M354.196 174.172H512L384 43.243zm-.002.004L256 468.757l-98.194-294.581z"
                data-original="#f53241"
            />
            <Path
                fill="#ce0045"
                d="M354.194 174.176L256 468.757V174.176z"
                data-original="#ce0045"
            />
        </Svg>
    )
}

export default RedGem1
