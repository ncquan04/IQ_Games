import * as React from "react"
import Svg, { Path, SvgProps } from "react-native-svg"

function RedGem2(props: SvgProps) {
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
                fill="#fd3973"
                d="M214.124 21.878l-62.803 27.691-62.804-27.691L0 110.397l40.656 61.862L0 236.003l256 255.059 53.059-256L256 62.814z"
                data-original="#fd3973"
            />
            <Path
                fill="#e60070"
                d="M512 109.456l-88.517-88.518-62.804 33.754-62.803-33.754L256 62.814v428.248l256-256-44.85-56.407z"
                data-original="#e60070"
            />
            <Path
                fill="#cf006f"
                d="M297.876 20.938l37.292 90.031 25.414 21.688 25.609-21.688 37.292-90.031zM512 109.456l-90.031 37.291-24.396 24.862 24.396 26.161L512 235.062z"
                data-original="#cf006f"
            />
            <Path
                d="M214.124 21.878l-37.292 90.031-25.414 21.688-25.609-21.688-37.292-90.031zM0 110.397l90.031 37.292 24.396 23.92-24.396 27.102L0 236.003z"
                data-original="#e60070"
                fill="#e60070"
            />
            <Path
                fill="#ff6884"
                d="M176.832 111.909H125.81l-35.779 35.78v51.022L256 363.739l49.756-88.423L256 190.137z"
                data-original="#ff6884"
            />
            <Path
                fill="#fd3973"
                d="M421.969 146.747l-35.778-35.778h-51.023L256 190.137v173.602L421.969 197.77z"
                data-original="#fd3973"
            />
        </Svg>
    )
}

export default RedGem2
