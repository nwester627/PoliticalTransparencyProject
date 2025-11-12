import styles from "./page.module.css";
import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";

export default function Home() {
  return (
    <main className={styles.main}>
      <Header />
      <Hero />
    </main>
  );
}
