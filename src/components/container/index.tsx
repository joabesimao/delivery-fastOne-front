import styles from "./container.module.css";
import type { WithChildren } from "../types/common-type-children";

export const Container = ({ children }: WithChildren) => {
  return <div className={styles.container}>{children}</div>;
};
