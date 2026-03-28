import styles from "./main.module.css"
import type { WithChildren } from "../types/common-type-children"

export const Main = ({children}:WithChildren) =>{
    return ( 
        <main className={styles.main}>{children}</main>
    )

}