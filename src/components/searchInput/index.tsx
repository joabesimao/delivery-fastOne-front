import styles from "./searchInput.module.css"
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const SearchInput = (props:InputProps )=>{
    return(
        <div className={styles.container}>
            <input className={styles.input}{...props}/>
        </div>
    )
}