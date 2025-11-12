import styles from "./page.module.css";
import Header from "@/components/Header/Header";
import Hero from "@/components/Hero/Hero";
import Tutorial from "@/components/Tutorial/Tutorial";

export default function Home() {
  return (
    <main className={styles.main}>
      <Header />
      <Hero />
      <Tutorial />
    </main>
  );
}
